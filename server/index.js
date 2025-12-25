const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const dossierRoutes = require('./routes/dossierRoutes');
const templateRoutes = require('./routes/templateRoutes');

app.use('/api/dossiers', dossierRoutes);
app.use('/api/templates', templateRoutes);

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
