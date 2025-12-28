const { pool } = require('../config/db');

const fetchFullTemplateContent = async (template_id) => {
    const [sections] = await pool.query(`
        SELECT * FROM Sectie 
        WHERE template_id = ? 
        ORDER BY volgorde ASC
    `, [template_id]);

    for (let section of sections) {
        const [placeholders] = await pool.query(`
            SELECT pl.sleutel as naam, pl.type, sp.pdf_label
            FROM SectiePlaceholder sp
            JOIN PlaceholderLibrary pl ON sp.placeholder_id = pl.id
            WHERE sp.sectie_id = ?
        `, [section.sectie_id]);

        section.placeholders = placeholders.map(p => ({
            id: p.naam,
            label: p.pdf_label || p.naam,
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
            const templates = rows.map((row) => {
                return {
                    id: row.template_id.toString(),
                    name: row.naam,
                    title: row.title || row.naam,
                    description: row.description,
                    sections: [], // Fetching sections is deferred to getTemplateById/Preview
                    isAiSuggested: Boolean(row.is_ai_suggested),
                    isArchived: Boolean(row.is_archived),
                    source: row.source || 'Custom',
                    type: row.type || 'House'
                };
            });

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
                // Strategy: Update existing sections, Insert new ones. 
                // Only delete sections that are explicitly removed AND not in use (or just warn).

                // 1. Get existing sections for this template
                const [existingSections] = await pool.query('SELECT sectie_id FROM Sectie WHERE template_id = ?', [id]);
                const existingIds = existingSections.map(s => s.sectie_id);

                // 2. Process incoming sections
                const incomingIds = [];

                for (let i = 0; i < sections.length; i++) {
                    const s = sections[i];
                    let sectieId = s.id; // Assuming frontend sends ID if it exists

                    if (sectieId && existingIds.includes(Number(sectieId))) {
                        // UPDATE existing section
                        await pool.query(
                            'UPDATE Sectie SET titel = ?, tekst_content = ?, volgorde = ? WHERE sectie_id = ?',
                            [s.title, s.content, i, sectieId]
                        );
                        incomingIds.push(Number(sectieId));

                        // Update Placeholders for this section: Clear old links and re-link
                        await pool.query('DELETE FROM SectiePlaceholder WHERE sectie_id = ?', [sectieId]);
                    } else {
                        // INSERT new section
                        const [sResult] = await pool.query(
                            'INSERT INTO Sectie (template_id, titel, tekst_content, volgorde) VALUES (?, ?, ?, ?)',
                            [id, s.title, s.content, i]
                        );
                        sectieId = sResult.insertId;
                    }

                    // Link Placeholders (common for both Update and Insert)
                    if (Array.isArray(s.placeholders)) {
                        const uniquePlaceholders = new Set();
                        for (const p of s.placeholders) {
                            const key = p.id || p.label;
                            if (uniquePlaceholders.has(key)) continue;
                            uniquePlaceholders.add(key);

                            // Ensure library placeholder exists
                            const [libRows] = await pool.query('SELECT id FROM PlaceholderLibrary WHERE sleutel = ?', [key]);
                            let placeholderId;
                            if (libRows.length > 0) {
                                placeholderId = libRows[0].id;
                            } else {
                                const [insResult] = await pool.query(
                                    'INSERT INTO PlaceholderLibrary (sleutel, type, beschrijving) VALUES (?, ?, ?)',
                                    [key, p.type || 'text', p.description || '']
                                );
                                placeholderId = insResult.insertId;
                            }

                            // Link to section
                            await pool.query(
                                'INSERT INTO SectiePlaceholder (sectie_id, placeholder_id, pdf_label) VALUES (?, ?, ?)',
                                [sectieId, placeholderId, p.label || key]
                            );
                        }
                    }
                }

                // 3. Handle Deletions (Optional: Try to delete sections that are not in incomingIds)
                // We wrap this in a try-catch so if it fails due to FK, we just ignore it for now (orphan section is better than crash)
                const toDelete = existingIds.filter(id => !incomingIds.includes(id));
                if (toDelete.length > 0) {
                    try {
                        await pool.query('DELETE FROM SectiePlaceholder WHERE sectie_id IN (?)', [toDelete]);
                        await pool.query('DELETE FROM Sectie WHERE sectie_id IN (?)', [toDelete]);
                    } catch (err) {
                        console.warn('Could not delete some sections due to constraints (likely used in dossiers):', err.message);
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
        const { name, title, description, source } = req.body;
        let sections = req.body.sections;

        // If it's a JSON body, sections might be a string if sent via FormData incorrectly?
        // Actually, with Multer, body fields are strings.
        if (typeof sections === 'string') {
            try {
                sections = JSON.parse(sections);
            } catch (e) {
                sections = null;
            }
        }

        try {
            console.log('--- Template Creation Started ---');
            console.log('Body:', req.body);
            console.log('File:', req.file);

            // Handle AI Analysis if PDF is provided
            if (req.file) {
                console.log(`Processing uploaded PDF for template: ${req.file.filename}`);
                const { extractTextFromPDF, analyzeTemplate } = require('../services/aiService');
                const path = require('path');
                const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);

                const text = await extractTextFromPDF(filePath);
                console.log(`Extracted text length: ${text?.length || 0}`);

                if (!text || text.trim().length === 0) {
                    console.error('Text extraction failed or returned empty content.');
                    // We continue but with a warning, or we could throw error
                } else {
                    console.log('Fetching library placeholders for AI analysis...');
                    const [libraryPlaceholders] = await pool.query('SELECT sleutel, beschrijving, type FROM PlaceholderLibrary');
                    console.log(`Found ${libraryPlaceholders.length} library placeholders.`);

                    const aiSections = await analyzeTemplate(text, libraryPlaceholders);
                    console.log(`AI identified ${aiSections?.length || 0} sections.`);

                    if (aiSections && aiSections.length > 0) {
                        sections = aiSections;
                    } else {
                        console.warn('AI analysis returned no sections.');
                    }
                }
            }

            const [result] = await pool.query(
                'INSERT INTO Template (naam, title, description, source) VALUES (?, ?, ?, ?)',
                [name || (req.file ? req.file.originalname.replace('.pdf', '') : 'Unnamed Template'),
                title || name || (req.file ? req.file.originalname.replace('.pdf', '') : 'Unnamed Template'),
                description || '',
                source || 'Custom']
            );
            const templateId = result.insertId;

            if (sections && Array.isArray(sections)) {
                for (let i = 0; i < sections.length; i++) {
                    const s = sections[i];
                    const [sResult] = await pool.query(
                        'INSERT INTO Sectie (template_id, titel, tekst_content, volgorde) VALUES (?, ?, ?, ?)',
                        [templateId, s.title, s.content, i]
                    );
                    const sectieId = sResult.insertId;

                    if (Array.isArray(s.placeholders)) {
                        for (const p of s.placeholders) {
                            const key = p.id || p.label;
                            // 1. Ensure placeholder exists in library
                            const [libRows] = await pool.query('SELECT id FROM PlaceholderLibrary WHERE sleutel = ?', [key]);
                            let placeholderId;
                            if (libRows.length > 0) {
                                placeholderId = libRows[0].id;
                            } else {
                                const [insResult] = await pool.query(
                                    'INSERT INTO PlaceholderLibrary (sleutel, type, beschrijving) VALUES (?, ?, ?)',
                                    [key, p.type || 'text', p.description || '']
                                );
                                placeholderId = insResult.insertId;
                            }

                            // 2. Link to section
                            await pool.query(
                                'INSERT INTO SectiePlaceholder (sectie_id, placeholder_id, pdf_label) VALUES (?, ?, ?)',
                                [sectieId, placeholderId, p.label || key]
                            );
                        }
                    }
                }
            }

            console.log(`Template ${templateId} created successfully. Inserting ${sections?.length || 0} sections.`);

            // Fetch the full template back to return it
            const createdTemplate = {
                id: templateId.toString(),
                name: name || (req.file ? req.file.originalname.replace('.pdf', '') : 'Unnamed Template'),
                title: title || name || (req.file ? req.file.originalname.replace('.pdf', '') : 'Unnamed Template'),
                description: description || '',
                source: source || 'Custom',
                sections: sections || [],
                isAiSuggested: false
            };

            res.status(201).json({ message: 'Template aangemaakt', template: createdTemplate });
        } catch (error) {
            console.error('Template Creation Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /api/templates/:id
    deleteTemplate: async (req, res) => {
        const { id } = req.params;
        try {
            // Check if template is used in any dossiers (via AangepasteSectie -> Versie -> Verkoopsovereenkomst)
            const [usage] = await pool.query(
                `SELECT COUNT(DISTINCT vo.dossier_id) as count 
                 FROM AangepasteSectie ads
                 JOIN Versie v ON ads.versie_id = v.versie_id
                 JOIN Verkoopsovereenkomst vo ON v.overeenkomst_id = vo.overeenkomst_id
                 JOIN Sectie s ON ads.sectie_id = s.sectie_id
                 WHERE s.template_id = ?`,
                [id]
            );

            if (usage[0].count > 0) {
                return res.status(400).json({
                    error: `Deze template kan niet verwijderd worden omdat hij in gebruik is in ${usage[0].count} dossier(s).`
                });
            }

            const [result] = await pool.query('DELETE FROM Template WHERE template_id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Template niet gevonden' });
            }
            res.json({ message: 'Template verwijderd' });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ error: 'Deze template kan niet verwijderd worden omdat er dossiers aan gekoppeld zijn.' });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // PATCH /api/templates/:id/archive
    toggleArchive: async (req, res) => {
        const { id } = req.params;
        const { is_archived } = req.body; // Expect boolean

        try {
            const [result] = await pool.query(
                'UPDATE Template SET is_archived = ? WHERE template_id = ?',
                [is_archived, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Template niet gevonden' });
            }

            res.json({ message: 'Template status bijgewerkt', is_archived });
        } catch (error) {
            console.error('Archive Template Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

};

module.exports = templateController;
