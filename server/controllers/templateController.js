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
            // Filter: Own custom templates OR official CIB templates (system-wide)
            const [rows] = await pool.query(`
                SELECT * FROM Template 
                WHERE (source = 'CIB') 
                OR (account_id = ? AND source = 'Custom')
                ORDER BY created_at DESC
            `, [req.user.id]);

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
            const [rows] = await pool.query('SELECT * FROM Template WHERE template_id = ? AND (source = "CIB" OR account_id = ?)', [id, req.user.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Template niet gevonden of geen toegang' });
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
            // Check ownership
            const [check] = await pool.query('SELECT account_id, source FROM Template WHERE template_id = ?', [id]);
            if (check.length === 0) return res.status(404).json({ error: 'Template niet gevonden' });
            if (check[0].source === 'CIB') return res.status(403).json({ error: 'System templates kunnen niet worden bewerkt' });
            if (check[0].account_id !== req.user.id) return res.status(403).json({ error: 'Geen toegang tot deze template' });

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
        // Set a long timeout so large templates (e.g. 50 pages) won't crash the request midway
        if (req.setTimeout) req.setTimeout(0);
        if (res.setTimeout) res.setTimeout(0);

        const { name, title, description, source } = req.body;

        // Check for duplicate name (within user's own templates OR CIB)
        if (name) {
            const [existing] = await pool.query(
                'SELECT template_id FROM Template WHERE naam = ? AND (source = "CIB" OR account_id = ?)', 
                [name, req.user.id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Een template met deze naam bestaat al.' });
            }
        }

        let sections = req.body.sections;
        if (typeof sections === 'string') {
            try { sections = JSON.parse(sections); } catch (e) { sections = null; }
        }
        try {
            console.log('--- Template Creation Started ---');
            if (req.file) {
                const { extractTextFromPDF, extractTextFromDOCX, analyzeTemplate } = require('../services/aiService');
                const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
                const ext = path.extname(req.file.originalname).toLowerCase();
                
                let text = '';
                try {
                    if (ext === '.pdf') {
                        text = await extractTextFromPDF(filePath);
                    } else if (ext === '.docx') {
                        text = await extractTextFromDOCX(filePath);
                    } else {
                        console.warn(`Unsupported file extension: ${ext}`);
                    }
                } catch (err) {
                    console.error(`Extraction failed: ${err.message}`);
                }

                if (text && text.trim().length > 0) {
                    console.log(`Extracted ${text.length} characters. Analyzing template...`);
                    const [libraryPlaceholders] = await pool.query('SELECT sleutel, beschrijving, type FROM Placeholder_Library');
                    const aiSections = await analyzeTemplate(text, libraryPlaceholders, req.body.custom_template_prompt || null);
                    if (aiSections && aiSections.length > 0) {
                        sections = aiSections;
                    } else {
                        console.warn('AI returned no sections for the template.');
                    }
                } else {
                    console.warn('No text could be extracted from the uploaded file.');
                }
            }
            const defaultName = req.file ? req.file.originalname.replace('.pdf', '') : 'Unnamed Template';
            const [result] = await pool.query(
                'INSERT INTO Template (naam, titel, beschrijving, source, account_id) VALUES (?, ?, ?, ?, ?)',
                [name || defaultName, title || name || defaultName, description || '', source || 'Custom', req.user.id]
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
            res.status(201).json({ 
                message: 'Template aangemaakt', 
                template: { 
                    id: templateId.toString(),
                    name: name || defaultName,
                    title: title || name || defaultName,
                    description: description || '',
                    source: source || 'Custom',
                    type: req.body.type || 'House',
                    sections: sections || [],
                    isArchived: false,
                    isAiSuggested: false
                } 
            });
        } catch (error) {
            console.error('Template Creation Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteTemplate: async (req, res) => {
        const { id } = req.params;
        try {
            // Check ownership
            const [check] = await pool.query('SELECT account_id, source FROM Template WHERE template_id = ?', [id]);
            if (check.length === 0) return res.status(404).json({ error: 'Template niet gevonden' });
            if (check[0].source === 'CIB') return res.status(403).json({ error: 'System templates kunnen niet worden verwijderd' });
            if (check[0].account_id !== req.user.id) return res.status(403).json({ error: 'Geen toegang' });

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
            // Check ownership
            const [check] = await pool.query('SELECT account_id, source FROM Template WHERE template_id = ?', [id]);
            if (check.length === 0) return res.status(404).json({ error: 'Template niet gevonden' });
            if (check[0].source === 'CIB') return res.status(403).json({ error: 'System templates kunnen niet worden gearchiveerd' });
            if (check[0].account_id !== req.user.id) return res.status(403).json({ error: 'Geen toegang' });

            await pool.query('UPDATE Template SET is_archived = ? WHERE template_id = ?', [is_archived, id]);
            res.json({ message: 'Template status bijgewerkt' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = templateController;
