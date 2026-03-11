const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // POST /api/auth/register
    register: async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Naam, email en wachtwoord zijn verplicht' });
        }

        try {
            // Check if user already exists
            const [existing] = await pool.query('SELECT account_id FROM Account WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Gebruiker met dit e-mailadres bestaat al' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert user
            const [result] = await pool.query(
                'INSERT INTO Account (naam, email, password_hash) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );

            res.status(201).json({
                message: 'Account succesvol aangemaakt',
                userId: result.insertId
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/auth/login
    login: async (req, res) => {
        console.log(`Login attempt for email: ${req.body.email}`);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email en wachtwoord zijn verplicht' });
        }

        try {
            // Find user
            const [rows] = await pool.query('SELECT * FROM Account WHERE email = ?', [email]);
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Ongeldige inloggegevens' });
            }

            const user = rows[0];

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Ongeldige inloggegevens' });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user.account_id, email: user.email, name: user.naam },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.account_id,
                    name: user.naam,
                    email: user.email,
                    customDocumentPrompt: user.custom_document_prompt,
                    customTemplatePrompt: user.custom_template_prompt
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message || error.toString(), stack: error.stack });
        }
    },

    // GET /api/auth/me
    me: async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT account_id, naam, email, custom_document_prompt as customDocumentPrompt, custom_template_prompt as customTemplatePrompt FROM Account WHERE account_id = ?',
                [req.user.id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Gebruiker niet gevonden' });
            }
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // PUT /api/auth/settings
    updateSettings: async (req, res) => {
        const { customDocumentPrompt, customTemplatePrompt } = req.body;
        
        try {
            await pool.query(
                'UPDATE Account SET custom_document_prompt = ?, custom_template_prompt = ? WHERE account_id = ?',
                [customDocumentPrompt, customTemplatePrompt, req.user.id]
            );
            res.json({ message: 'Instellingen bijgewerkt' });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController;
