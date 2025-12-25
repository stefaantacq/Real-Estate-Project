const { pool } = require('../config/db');

// Mock data for initial implementation - will be replaced by DB queries later
// or we can seed the DB with this data.
const MOCK_TEMPLATES = [
    {
        id: 'verkoop-vlaanderen-2024',
        name: 'Standaard Verkoopsovereenkomst (Vlaanderen)',
        description: 'Geschikt voor residentiële verkoop in het Vlaamse Gewest.',
        sections: [], // In real implementation, these would be huge JSON objects
        isAiSuggested: true
    },
    {
        id: 'verkoop-brussel-2024',
        name: 'Compromis de Vente (Bruxelles)',
        description: 'Modeldocument voor verkoop in Brussel (Franstalig).',
        sections: [],
        isAiSuggested: false
    },
    {
        id: 'verkoop-wallonie-2024',
        name: 'Compromis de Vente (Wallonie)',
        description: 'Modeldocument voor verkoop in Wallonië.',
        sections: [],
        isAiSuggested: false
    }
];

const templateController = {
    // GET /api/templates
    getAllTemplates: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM Template ORDER BY created_at DESC');

            // Map DB columns to Frontend Interface
            const templates = rows.map(row => ({
                id: row.ui_id || row.template_id.toString(),
                name: row.naam,
                title: row.title || row.naam, // Default to name if title is null
                description: row.description,
                sections: row.sections,
                isAiSuggested: Boolean(row.is_ai_suggested),
                source: row.source || 'Custom' // Default to Custom if null
            }));

            res.json(templates);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/templates/:id
    getTemplateById: async (req, res) => {
        const { id } = req.params;
        try {
            // Search by ui_id (the string ID used in frontend)
            const [rows] = await pool.query('SELECT * FROM Template WHERE ui_id = ?', [id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Template niet gevonden' });
            }

            const row = rows[0];
            const template = {
                id: row.ui_id,
                name: row.naam,
                title: row.title || row.naam,
                description: row.description,
                sections: row.sections,
                isAiSuggested: Boolean(row.is_ai_suggested),
                source: row.source || 'Custom'
            };

            res.json(template);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // PUT /api/templates/:id
    updateTemplate: async (req, res) => {
        const { id } = req.params;
        const { name, description, sections } = req.body;

        try {
            // Update by ui_id
            const [result] = await pool.query(
                'UPDATE Template SET naam = ?, title = ?, description = ?, sections = ? WHERE ui_id = ?',
                [req.body.name, req.body.title || req.body.name, req.body.description, JSON.stringify(sections), id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Template niet gevonden' });
            }

            res.json({ message: 'Template succesvol bijgewerkt' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/templates
    createTemplate: async (req, res) => {
        const { id, name, title, description, type, source, sections } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO Template (ui_id, naam, title, description, sections, source) VALUES (?, ?, ?, ?, ?, ?)',
                [id, name, title || name, description, JSON.stringify(sections || []), source || 'Custom']
            );
            res.status(201).json({ message: 'Template aangemaakt', id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /api/templates/:id
    deleteTemplate: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM Template WHERE ui_id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Template niet gevonden' });
            }
            res.json({ message: 'Template verwijderd' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = templateController;
