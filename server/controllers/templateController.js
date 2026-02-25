const { pool } = require('../config/db');
const path = require('path');

const fetchFullTemplateContent = async (template_id) => {
    const [sections] = await pool.query(`
        SELECT * FROM Sectie 
        WHERE template_id = ? 
        ORDER BY volgorde ASC
    `, [template_id]);

    for (let section of sections) {
        const [placeholders] = await pool.query(`
            SELECT pl.sleutel as naam, pl.type, p.pdf_label
            FROM Placeholder p
            JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
            WHERE p.sectie_id = ?
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

const templateController = {
    getAllTemplates: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM Template ORDER BY created_at DESC');

            const templates = rows.map((row) => {
                return {
                    id: row.template_id.toString(),
                    name: row.naam,
                    title: row.titel || row.naam,
                    description: row.beschrijving,
                    sections: [], 
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

    getTemplateById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT * FROM Template WHERE template_id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Template niet gevonden' });
            const row = rows[0];
            const sections = await fetchFullTemplateContent(row.template_id);
            res.json({
                id: row.template_id.toString(),
                name: row.naam,
                title: row.titel || row.naam,
                description: row.beschrijving,
                sections: sections,
                isAiSuggested: Boolean(row.is_ai_suggested),
                source: row.source || 'Custom'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    updateTemplate: async (req, res) => {
        const { id } = req.params;
        const { name, description, sections, title } = req.body;
        try {
            await pool.query(
                'UPDATE Template SET naam = COALESCE(?, naam), titel = COALESCE(?, titel), beschrijving = COALESCE(?, beschrijving) WHERE template_id = ?',
                [name, title, description, id]
            );
            if (sections) {
                const [existingSections] = await pool.query('SELECT sectie_id FROM Sectie WHERE template_id = ?', [id]);
                const existingIds = existingSections.map(s => s.sectie_id);
                const incomingIds = [];
                for (let i = 0; i < sections.length; i++) {
                    const s = sections[i];
                    let sectieId = s.id;
                    if (sectieId && existingIds.includes(Number(sectieId))) {
                        await pool.query(
                            'UPDATE Sectie SET titel = ?, tekst_content = ?, volgorde = ? WHERE sectie_id = ?',
                            [s.title, s.content, i, sectieId]
                        );
                        incomingIds.push(Number(sectieId));
                        await pool.query('DELETE FROM Placeholder WHERE sectie_id = ?', [sectieId]);
                    } else {
                        const [sResult] = await pool.query(
                            'INSERT INTO Sectie (template_id, titel, tekst_content, volgorde) VALUES (?, ?, ?, ?)',
                            [id, s.title, s.content, i]
                        );
                        sectieId = sResult.insertId;
                    }
                    if (Array.isArray(s.placeholders)) {
                        for (const p of s.placeholders) {
                            const key = p.id || p.label;
                            const [libRows] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ?', [key]);
                            let placeholderId;
                            if (libRows.length > 0) placeholderId = libRows[0].placeholder_id;
                            else {
                                const [insResult] = await pool.query(
                                    'INSERT INTO Placeholder_Library (sleutel, type, beschrijving) VALUES (?, ?, ?)',
                                    [key, p.type || 'text', p.description || '']
                                );
                                placeholderId = insResult.insertId;
                            }
                            await pool.query(
                                'INSERT INTO Placeholder (sectie_id, placeholder_id, pdf_label) VALUES (?, ?, ?)',
                                [sectieId, placeholderId, p.label || key]
                            );
                        }
                    }
                }
                const toDelete = existingIds.filter(id => !incomingIds.includes(id));
                if (toDelete.length > 0) {
                    await pool.query('DELETE FROM Placeholder WHERE sectie_id IN (?)', [toDelete]);
                    await pool.query('DELETE FROM Sectie WHERE sectie_id IN (?)', [toDelete]);
                }
            }
            res.json({ message: 'Template bijgewerkt' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    createTemplate: async (req, res) => {
        const { name, title, description, source } = req.body;
        let sections = req.body.sections;
        if (typeof sections === 'string') {
            try { sections = JSON.parse(sections); } catch (e) { sections = null; }
        }
        try {
            console.log('--- Template Creation Started ---');
            if (req.file) {
                const { extractTextFromPDF, analyzeTemplate } = require('../services/aiService');
                const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
                const text = await extractTextFromPDF(filePath);
                if (text && text.trim().length > 0) {
                    const [libraryPlaceholders] = await pool.query('SELECT sleutel, beschrijving, type FROM Placeholder_Library');
                    const aiSections = await analyzeTemplate(text, libraryPlaceholders, req.body.custom_template_prompt || null);
                    if (aiSections && aiSections.length > 0) sections = aiSections;
                }
            }
            const defaultName = req.file ? req.file.originalname.replace('.pdf', '') : 'Unnamed Template';
            const [result] = await pool.query(
                'INSERT INTO Template (naam, titel, beschrijving, source) VALUES (?, ?, ?, ?)',
                [name || defaultName, title || name || defaultName, description || '', source || 'Custom']
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
                            const [libRows] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ?', [key]);
                            let placeholderId;
                            if (libRows.length > 0) placeholderId = libRows[0].placeholder_id;
                            else {
                                const [insResult] = await pool.query(
                                    'INSERT INTO Placeholder_Library (sleutel, type, beschrijving) VALUES (?, ?, ?)',
                                    [key, p.type || 'text', p.description || '']
                                );
                                placeholderId = insResult.insertId;
                            }
                            await pool.query(
                                'INSERT INTO Placeholder (sectie_id, placeholder_id, pdf_label) VALUES (?, ?, ?)',
                                [sectieId, placeholderId, p.label || key]
                            );
                        }
                    }
                }
            }
            res.status(201).json({ message: 'Template aangemaakt', template: { id: templateId.toString() } });
        } catch (error) {
            console.error('Template Creation Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteTemplate: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM Template WHERE template_id = ?', [id]);
            res.json({ message: 'Template verwijderd' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    toggleArchive: async (req, res) => {
        const { id } = req.params;
        const { is_archived } = req.body;
        try {
            await pool.query('UPDATE Template SET is_archived = ? WHERE template_id = ?', [is_archived, id]);
            res.json({ message: 'Template status bijgewerkt' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = templateController;
