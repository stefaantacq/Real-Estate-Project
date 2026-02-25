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
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/auth/me
    me: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT account_id, naam, email FROM Account WHERE account_id = ?', [req.user.id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Gebruiker niet gevonden' });
            }
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController;
