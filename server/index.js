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
app.use(express.json());
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
const dossierRoutes = require('./routes/dossierRoutes');
const templateRoutes = require('./routes/templateRoutes');

app.use('/api/dossiers', dossierRoutes);
app.use('/api/templates', templateRoutes);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
