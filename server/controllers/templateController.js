const { pool } = require('../config/db');

const fetchFullTemplateContent = async (template_id) => {
    const [sections] = await pool.query(`
        SELECT * FROM Sectie 
        WHERE template_id = ? 
        ORDER BY volgorde ASC
    `, [template_id]);

    for (let section of sections) {
        const [placeholders] = await pool.query(`
            SELECT * FROM Placeholder 
            WHERE sectie_id = ?
        `, [section.sectie_id]);

        section.placeholders = placeholders.map(p => ({
            id: p.naam,
            label: p.naam,
            type: p.type
        }));

        // Map fields for frontend compatibility
        section.id = section.sectie_id.toString();
        section.content = section.tekst_content;
    }

    return sections;
};

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
            const templates = await Promise.all(rows.map(async (row) => {
                const sections = await fetchFullTemplateContent(row.template_id);
                return {
                    id: row.template_id.toString(),
                    name: row.naam,
                    title: row.title || row.naam,
                    description: row.description,
                    sections: sections,
                    isAiSuggested: Boolean(row.is_ai_suggested),
                    source: row.source || 'Custom'
                };
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
            // Search by template_id
            const [rows] = await pool.query('SELECT * FROM Template WHERE template_id = ?', [id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Template niet gevonden' });
            }

            const row = rows[0];
            const sections = await fetchFullTemplateContent(row.template_id);
            const template = {
                id: row.template_id.toString(),
                name: row.naam,
                title: row.title || row.naam,
                description: row.description,
                sections: sections,
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
        const { name, description, sections, title } = req.body;

        try {
            await pool.query(
                'UPDATE Template SET naam = COALESCE(?, naam), title = COALESCE(?, title), description = COALESCE(?, description) WHERE template_id = ?',
                [name, title, description, id]
            );

            if (sections) {
                // Update Sections and Placeholders
                // Simple strategy: Clear and re-insert for template structure
                await pool.query('DELETE FROM Placeholder WHERE sectie_id IN (SELECT sectie_id FROM Sectie WHERE template_id = ?)', [id]);
                await pool.query('DELETE FROM Sectie WHERE template_id = ?', [id]);

                for (let i = 0; i < sections.length; i++) {
                    const s = sections[i];
                    const [sResult] = await pool.query(
                        'INSERT INTO Sectie (template_id, titel, tekst_content, volgorde) VALUES (?, ?, ?, ?)',
                        [id, s.title, s.content, i]
                    );
                    const sectieId = sResult.insertId;

                    if (Array.isArray(s.placeholders)) {
                        for (const p of s.placeholders) {
                            await pool.query(
                                'INSERT INTO Placeholder (sectie_id, naam, type) VALUES (?, ?, ?)',
                                [sectieId, p.id || p.label, p.type || 'text']
                            );
                        }
                    }
                }
            }

            res.json({ message: 'Template succesvol bijgewerkt' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/templates
    createTemplate: async (req, res) => {
        const { name, title, description, source, sections } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO Template (naam, title, description, source) VALUES (?, ?, ?, ?)',
                [name, title || name, description, source || 'Custom']
            );
            const templateId = result.insertId;

            if (sections) {
                for (let i = 0; i < sections.length; i++) {
                    const s = sections[i];
                    const [sResult] = await pool.query(
                        'INSERT INTO Sectie (template_id, titel, tekst_content, volgorde) VALUES (?, ?, ?, ?)',
                        [templateId, s.title, s.content, i]
                    );
                    const sectieId = sResult.insertId;

                    if (Array.isArray(s.placeholders)) {
                        for (const p of s.placeholders) {
                            await pool.query(
                                'INSERT INTO Placeholder (sectie_id, naam, type) VALUES (?, ?, ?)',
                                [sectieId, p.id || p.label, p.type || 'text']
                            );
                        }
                    }
                }
            }

            res.status(201).json({ message: 'Template aangemaakt', id: templateId.toString() });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /api/templates/:id
    deleteTemplate: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM Template WHERE template_id = ?', [id]);
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
