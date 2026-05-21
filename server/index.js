const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/db');
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ─── Process-level safety nets ────────────────────────────────────────────────
// These must be registered as early as possible so nothing slips through.

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception — the process will exit.');
    console.error('[FATAL] Error name   :', err.name);
    console.error('[FATAL] Error message:', err.message);
    console.error('[FATAL] Stack trace  :\n', err.stack);
    try {
        fs.appendFileSync(
            path.join(__dirname, 'error.log'),
            `[${new Date().toISOString()}] UNCAUGHT EXCEPTION\n${err.stack}\n`
        );
    } catch (_) { /* best-effort */ }
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    const message = reason instanceof Error ? reason.stack : String(reason);
    console.error('[FATAL] Unhandled Promise Rejection.');
    console.error('[FATAL] Reason:', message);
    try {
        fs.appendFileSync(
            path.join(__dirname, 'error.log'),
            `[${new Date().toISOString()}] UNHANDLED REJECTION\n${message}\n`
        );
    } catch (_) { /* best-effort */ }
    // Do NOT exit here — log and keep running so the startup sequence can finish.
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadDir));

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
app.set('upload', upload); // Make it accessible in routes

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const templateRoutes = require('./routes/templateRoutes');
const authMiddleware = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/dossiers', authMiddleware, dossierRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/wopi', require('./routes/wopiRoutes')); // Register WOPI routes

// AI Status Endpoint
const aiService = require('./services/aiService');
app.get('/api/ai/status', async (req, res) => {
    try {
        const isConnected = await aiService.checkConnection();
        res.json({
            status: isConnected ? 'online' : 'offline',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'offline',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// AI Chat Endpoint
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
    try {
        const { messages, contextText, language } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages are required and must be an array' });
        }
        
        const responseText = await aiService.chatWithContext(messages, contextText || '', language);
        res.json({ text: responseText });
    } catch (error) {
        console.error('AI Chat Error:', error);
        require('fs').appendFileSync('chat_error.log', new Date().toISOString() + ' ' + error.stack + '\n');
        res.status(500).json({ error: error.message });
    }
});

// AI Chat Stream Endpoint
app.post('/api/ai/chat-stream', authMiddleware, async (req, res) => {
    try {
        const { messages, contextText, language } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages are required and must be an array' });
        }
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.flushHeaders();

        await aiService.streamChatWithContext(messages, contextText || '', language, (chunk) => {
             res.write(chunk);
        });
        
        res.end();
    } catch (error) {
        console.error('AI Chat Stream Error:', error);
        require('fs').appendFileSync('chat_error.log', new Date().toISOString() + ' ' + error.stack + '\n');
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            res.end();
        }
    }
});

// Test Endpoint
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as result');
        res.json({ status: 'success', message: 'Local Backend Connected!', data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Document Preview Endpoint (Converts DOCX to PDF inline)
app.get('/api/documents/preview/:filename', async (req, res, next) => {
    try {
        let filename = req.params.filename;
        // If the frontend appended .pdf to a docx file (to trigger Chrome's PDF viewer #search hash):
        if (filename.toLowerCase().endsWith('.pdf') && !fs.existsSync(path.join(uploadDir, filename))) {
            const baseFilename = filename.slice(0, -4);
            if (fs.existsSync(path.join(uploadDir, baseFilename))) {
                filename = baseFilename;
            }
        }
        
        const filePath = path.join(uploadDir, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.docx' || ext === '.doc') {
            const exportService = require('./services/exportService');
            const fileBuffer = fs.readFileSync(filePath);
            const pdfBuffer = await exportService.convertToPdf(fileBuffer);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
            return res.send(pdfBuffer);
        }
        
        // Map extensions to content types
        const mimeMap = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const contentType = mimeMap[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
});

// Serve frontend (must come after all API routes)
const frontendDist = path.join(__dirname, '../compromais/dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
}

// Global Error Logger
app.use((err, req, res, next) => {
    const errorLog = `[${new Date().toISOString()}] ${err.stack}\n`;
    fs.appendFileSync(path.join(__dirname, 'error.log'), errorLog);
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    console.log('[Startup] startServer() called — beginning initialisation sequence.');

    // ── 1. Database ────────────────────────────────────────────────────────────
    console.log('[Startup] Step 1/3 — Testing database connection…');
    try {
        await testConnection();
        console.log('[Startup] Step 1/3 — Database connection OK.');
    } catch (err) {
        console.error('[Startup] Step 1/3 — Database connection FAILED. Server will not start.');
        console.error('[Startup] Error name   :', err.name);
        console.error('[Startup] Error message:', err.message);
        console.error('[Startup] Stack trace  :\n', err.stack);
        process.exit(1);
    }

    // ── 2. Route / middleware sanity check ────────────────────────────────────
    // Any synchronous require() errors in route files would have already thrown
    // at the top of this file, but we log a checkpoint here for clarity.
    console.log('[Startup] Step 2/3 — Routes and middleware loaded successfully.');

    // ── 3. HTTP server ────────────────────────────────────────────────────────
    console.log(`[Startup] Step 3/3 — Calling app.listen() on 0.0.0.0:${PORT}…`);

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Startup] ✓ app.listen() callback fired — server is accepting connections on port ${PORT}.`);
        console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
        console.error('[Startup] HTTP server emitted an error event:');
        console.error('[Startup] Error name   :', err.name);
        console.error('[Startup] Error message:', err.message);
        console.error('[Startup] Stack trace  :\n', err.stack);
        process.exit(1);
    });

    // ── 4. Liveness timeout ───────────────────────────────────────────────────
    // If the listen callback has not fired within 5 seconds something is wrong.
    const LIVENESS_TIMEOUT_MS = 5000;
    let listenCallbackFired = false;

    server.once('listening', () => {
        listenCallbackFired = true;
    });

    setTimeout(() => {
        if (!listenCallbackFired) {
            console.warn(
                `[Startup] WARNING — app.listen() callback has NOT fired after ${LIVENESS_TIMEOUT_MS / 1000}s. ` +
                'The server may be stuck or the port may already be in use.'
            );
        }
    }, LIVENESS_TIMEOUT_MS);
}

startServer().catch((err) => {
    console.error('[Startup] Unexpected top-level error during startup:');
    console.error('[Startup] Error name   :', err.name);
    console.error('[Startup] Error message:', err.message);
    console.error('[Startup] Stack trace  :\n', err.stack);
    try {
        fs.appendFileSync(
            path.join(__dirname, 'error.log'),
            `[${new Date().toISOString()}] STARTUP ERROR\n${err.stack}\n`
        );
    } catch (_) { /* best-effort */ }
    process.exit(1);
});
