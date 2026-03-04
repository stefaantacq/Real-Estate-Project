const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const multer = require('multer');

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
        const { messages, contextText } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages are required and must be an array' });
        }
        
        const responseText = await aiService.chatWithContext(messages, contextText || '');
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
        const { messages, contextText } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages are required and must be an array' });
        }
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.flushHeaders();

        await aiService.streamChatWithContext(messages, contextText || '', (chunk) => {
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
        if ((filename.endsWith('.docx.pdf') || filename.endsWith('.doc.pdf')) && !fs.existsSync(path.join(uploadDir, filename))) {
            filename = filename.slice(0, -4);
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
        
        // Default fallback: send inline
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
});

// Global Error Logger
app.use((err, req, res, next) => {
    const errorLog = `[${new Date().toISOString()}] ${err.stack}\n`;
    fs.appendFileSync(path.join(__dirname, 'error.log'), errorLog);
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
