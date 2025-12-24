const { pool } = require('../config/db');

const dossierController = {
    // GET /api/dossiers
    getAllDossiers: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM Dossier ORDER BY datum_aanmaak DESC');
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/dossiers
    createDossier: async (req, res) => {
        const { titel, verkoper_naam, adres } = req.body;
        // Voor nu hardcoden we account_id = 1 (Dev User) totdat we echte auth hebben.
        const account_id = 1;

        try {
            // Zorg dat account 1 bestaat (HACK voor dev)
            await pool.query(`
                INSERT IGNORE INTO Account (account_id, naam, email, wachtwoord_hash) 
                VALUES (1, 'Dev User', 'dev@local', 'hash')
            `);

            const [result] = await pool.query(
                'INSERT INTO Dossier (account_id, titel, verkoper_naam, adres) VALUES (?, ?, ?, ?)',
                [account_id, titel, verkoper_naam, adres]
            );

            res.status(201).json({
                message: 'Dossier aangemaakt',
                dossierId: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/dossiers/:id
    getDossierById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT * FROM Dossier WHERE dossier_id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Dossier niet gevonden' });
            }
            res.json(rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /api/dossiers/:id
    deleteDossier: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM Dossier WHERE dossier_id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Dossier niet gevonden' });
            }
            res.json({ message: 'Dossier verwijderd' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = dossierController;
