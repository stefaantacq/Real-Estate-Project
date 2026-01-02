const { pool } = require('../config/db');
const { extractTextFromPDF, analyzeDocument } = require('../services/aiService');
const path = require('path');

const fetchFullVersionContent = async (versie_id) => {
    // Get dossier_id first to fetch master data placeholders
    const [verRows] = await pool.query(`
        SELECT ouv.dossier_id 
        FROM Versie v 
        JOIN Verkoopsovereenkomst ouv ON v.overeenkomst_id = ouv.overeenkomst_id 
        WHERE v.versie_id = ?
    `, [versie_id]);

    if (verRows.length === 0) return [];
    const dossierId = verRows[0].dossier_id;

    const [sections] = await pool.query(`
        SELECT asub.*, s.titel, s.tekst_content as original_content
        FROM AangepasteSectie asub
        JOIN Sectie s ON asub.sectie_id = s.sectie_id
        WHERE asub.versie_id = ?
        ORDER BY s.volgorde ASC
    `, [versie_id]);

    for (let section of sections) {
        // Fetch placeholders linked to this section via the intersection table
        const [placeholders] = await pool.query(`
            SELECT 
                pl.id as placeholder_id, 
                pl.sleutel as naam, 
                pl.type, 
                sp.pdf_label,
                ap.ingevulde_waarde,
                ap.onzekerheidsscore,
                ap.validatiestatus as placeholder_validatiestatus
            FROM SectiePlaceholder sp
            JOIN PlaceholderLibrary pl ON sp.placeholder_id = pl.id
            LEFT JOIN AangepastePlaceholder ap ON pl.id = ap.placeholder_id AND ap.dossier_id = ?
            WHERE sp.sectie_id = ?
        `, [dossierId, section.sectie_id]);

        section.placeholders = placeholders.map(p => ({
            id: p.naam,
            label: p.pdf_label || p.naam,
            currentValue: p.ingevulde_waarde || '',
            confidence: p.onzekerheidsscore > 0.8 ? 'High' : (p.onzekerheidsscore > 0.5 ? 'Medium' : 'Low'),
            isApproved: p.placeholder_validatiestatus === 'approved',
            type: p.type
        }));

        // Map fields for frontend compatibility
        section.id = section.aangepaste_sectie_id.toString();
        section.title = section.titel;
        section.content = section.tekst_inhoud;
        section.isApproved = section.validatiestatus === 'approved';
    }

    return sections;
};

const initializeVersionFromTemplate = async (verId, template_id, dossierId) => {
    const [templateSecties] = await pool.query('SELECT * FROM Sectie WHERE template_id = ? ORDER BY volgorde ASC', [template_id]);
    for (const ts of templateSecties) {
        await pool.query(
            'INSERT INTO AangepasteSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
            [verId, ts.sectie_id, ts.tekst_content, 'pending']
        );

        const [templatePlaceholders] = await pool.query(`
            SELECT pl.* 
            FROM PlaceholderLibrary pl 
            JOIN SectiePlaceholder sp ON pl.id = sp.placeholder_id 
            WHERE sp.sectie_id = ?
        `, [ts.sectie_id]);

        for (const tp of templatePlaceholders) {
            // Ensure Master Placeholder exists for the dossier
            // We use INSERT IGNORE based on unique_dossier_placeholder index
            await pool.query(
                'INSERT IGNORE INTO AangepastePlaceholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?)',
                [dossierId, tp.id, '', 'unverified']
            );
        }
    }
};

const copyVersionContent = async (sourceVersionId, targetVersionId) => {
    const [oldSecties] = await pool.query('SELECT * FROM AangepasteSectie WHERE versie_id = ?', [sourceVersionId]);
    for (const os of oldSecties) {
        await pool.query(
            'INSERT INTO AangepasteSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
            [targetVersionId, os.sectie_id, os.tekst_inhoud, os.validatiestatus]
        );
        // Note: AangepastePlaceholder entries are dossier-level and don't need copying per version
    }
};

const syncDossierMasterData = async (dossierId, tag, value) => {
    try {
        // 1. Update/Insert Master Placeholder
        const [pDef] = await pool.query('SELECT id FROM PlaceholderLibrary WHERE sleutel = ? LIMIT 1', [tag]);
        if (pDef.length > 0) {
            const placeholderId = pDef[0].id;
            await pool.query(`
                INSERT INTO AangepastePlaceholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus) 
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE ingevulde_waarde = VALUES(ingevulde_waarde)
            `, [dossierId, placeholderId, value, 'unverified']);
        }

        // 3. If tag is address-related, sync to Dossier table
        const addressTags = ['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_street', 'property_municipality', 'property_address'];
        if (addressTags.includes(tag)) {
            // We only update Dossier.adres if the value is not empty
            if (value && value.trim()) {
                await pool.query('UPDATE Dossier SET adres = ? WHERE dossier_id = ?', [value, dossierId]);
            }
        }
    } catch (err) {
        console.error('Error in syncDossierMasterData:', err);
    }
};

const processDossierDocuments = async (dossierId, files, customPrompt = null) => {
    try {
        console.log(`Starting AI extraction for dossier ${dossierId} with ${files.length} documents...`);

        // 1. Get all possible placeholders from the library for extraction
        // We fetch the pdf_label (usually Dutch) from the intersection table to help the AI map fields
        const [pRows] = await pool.query(`
            SELECT pl.sleutel as naam, pl.type, s.titel as section_title, sp.pdf_label
            FROM PlaceholderLibrary pl
            LEFT JOIN SectiePlaceholder sp ON pl.id = sp.placeholder_id
            LEFT JOIN Sectie s ON sp.sectie_id = s.sectie_id
        `);

        // Consolidate: if a placeholder appears multiple times (different sections), 
        // combine the labels/contexts to give Gemini a better chance.
        const consolidatedMap = {};
        for (const row of pRows) {
            if (!consolidatedMap[row.naam]) {
                consolidatedMap[row.naam] = {
                    naam: row.naam,
                    type: row.type,
                    labels: new Set(),
                    sections: new Set()
                };
            }
            if (row.pdf_label) consolidatedMap[row.naam].labels.add(row.pdf_label);
            if (row.section_title) consolidatedMap[row.naam].sections.add(row.section_title);
        }

        const tagsToExtract = Object.keys(consolidatedMap);
        const fieldContexts = Object.values(consolidatedMap).map(ctx => ({
            naam: ctx.naam,
            type: ctx.type,
            label: Array.from(ctx.labels).join(', ') || ctx.naam,
            sections: Array.from(ctx.sections).join(', ') || 'General'
        }));

        console.log(`Sending ${tagsToExtract.length} unique tags to Gemini for extraction.`);

        let combinedExtractedData = {};

        for (const file of files) {
            if (file.mimetype === 'application/pdf') {
                const filePath = path.join(__dirname, '..', 'uploads', file.filename);

                await pool.query(
                    'INSERT INTO TimelineEvent (dossier_id, title, description, user_name) VALUES (?, ?, ?, ?)',
                    [dossierId, 'AI Analyse: PDF inlezen', `Tekst extraheren uit ${file.originalname}...`, 'AI Assistent']
                );

                const text = await extractTextFromPDF(filePath);

                if (text && text.trim().length > 0) {
                    await pool.query(
                        'INSERT INTO TimelineEvent (dossier_id, title, description, user_name) VALUES (?, ?, ?, ?)',
                        [dossierId, 'AI Analyse: Gegevens zoeken', `Gemini analyseert ${file.originalname} (${text.length} tekens)...`, 'AI Assistent']
                    );

                    const extractedData = await analyzeDocument(text, tagsToExtract, customPrompt, fieldContexts);
                    console.log(`Gemini extracted data for ${file.originalname}:`, JSON.stringify(extractedData, null, 2));
                    // Merge data (later documents can overwrite or supplement)
                    combinedExtractedData = { ...combinedExtractedData, ...extractedData };
                } else {
                    await pool.query(
                        'INSERT INTO TimelineEvent (dossier_id, title, description, user_name) VALUES (?, ?, ?, ?)',
                        [dossierId, 'AI Analyse: Waarschuwing', `Kon geen tekst extraheren uit ${file.originalname}. Is dit een gescand document zonder tekstlaag?`, 'AI Assistent']
                    );
                }
            }
        }

        // 2. Sync findings to Master Placeholders and Versions
        let matchCount = 0;
        for (const [tag, value] of Object.entries(combinedExtractedData)) {
            if (value && value.toString().trim()) {
                console.log(`AI extracted [${tag}]: ${value}`);
                await syncDossierMasterData(dossierId, tag, value.toString());
                matchCount++;
            }
        }

        // 3. Log event when done
        await pool.query(
            'INSERT INTO TimelineEvent (dossier_id, title, description, user_name) VALUES (?, ?, ?, ?)',
            [dossierId, 'AI Analyse Voltooid', `AI heeft de documenten geanalyseerd en ${matchCount} velden ingevuld of bijgewerkt.`, 'AI Assistent']
        );

        console.log(`AI extraction for dossier ${dossierId} completed. ${matchCount} fields synced.`);
    } catch (error) {
        console.error('Error in processDossierDocuments:', error);
        await pool.query(
            'INSERT INTO TimelineEvent (dossier_id, title, description, user_name) VALUES (?, ?, ?, ?)',
            [dossierId, 'AI Analyse Fout', `Er is een fout opgetreden bij het verwerken van de documenten: ${error.message}`, 'Systeem']
        );
    }
};

const dossierController = {
    // GET /api/dossiers
    getAllDossiers: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT d.*, 
                (SELECT COUNT(*) FROM Documenten doc WHERE doc.dossier_id = d.dossier_id) as documentCount,
                (SELECT COUNT(*) FROM Verkoopsovereenkomst v WHERE v.dossier_id = d.dossier_id) as agreementCount
                FROM Dossier d 
                ORDER BY d.last_modified DESC
            `);

            const dossiers = rows.map(row => ({
                id: row.ui_id || row.dossier_id.toString(),
                name: row.titel,
                address: row.adres,
                verkoper_naam: row.verkoper_naam,
                date: row.last_modified || row.datum_aanmaak,
                creationDate: row.datum_aanmaak,
                documentCount: row.documentCount || 0,
                agreementCount: row.agreementCount || 0,
                status: row.status || 'draft',
                type: row.type || 'House'
            }));

            res.json(dossiers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/dossiers
    createDossier: async (req, res) => {
        // req.body is empty because of multipart/form-data, use req.body from fields
        const { titel, verkoper_naam, adres, type, template_id, remarks, ai_extraction_prompt } = req.body;

        if (!titel) {
            return res.status(400).json({ error: 'Titel is verplicht' });
        }

        const ui_id = `dos-${Date.now()}`;
        const account_id = 1;

        try {
            await pool.query(`
                INSERT IGNORE INTO Account (account_id, naam, email, wachtwoord_hash) 
                VALUES (1, 'Dev User', 'dev@local', 'hash')
            `);

            const [dosResult] = await pool.query(
                `INSERT INTO Dossier (account_id, ui_id, titel, verkoper_naam, adres, type, status, remarks) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [account_id, ui_id, titel, verkoper_naam, adres, type || 'House', 'draft', remarks || null]
            );

            const dossier_id = dosResult.insertId;

            // Sync initial address to Master Placeholders
            if (adres) {
                const tagsToSync = ['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_address', 'property_street', 'property_municipality'];
                for (const tag of tagsToSync) {
                    await syncDossierMasterData(dossier_id, tag, adres);
                }
            }

            // Save uploaded files
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const docUiId = `doc-${Date.now()}-${Math.round(Math.random() * 1000)}`;
                    await pool.query(
                        'INSERT INTO Documenten (ui_id, dossier_id, naam, bestandstype, bestand_pad, document_type) VALUES (?, ?, ?, ?, ?, ?)',
                        [docUiId, dossier_id, file.originalname, file.mimetype, `/uploads/${file.filename}`, 'Uploaded']
                    );
                }
            }

            // Initialize first Agreement and V1.0 if template_id provided
            if (template_id) {
                const ouvUiId = `ouv-${Date.now()}`;
                const [ouvResult] = await pool.query(
                    'INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id) VALUES (?, ?, ?)',
                    [ouvUiId, dossier_id, template_id]
                );

                const verUiId = `ver-${Date.now()}-1.0`;
                const [verResult] = await pool.query(
                    'INSERT INTO Versie (ui_id, overeenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?)',
                    [verUiId, ouvResult.insertId, '1.0', 'AI', true]
                );

                await initializeVersionFromTemplate(verResult.insertId, template_id, dossier_id);
            }

            // Create initial timeline event
            await pool.query(
                'INSERT INTO TimelineEvent (dossier_id, title, description, user_name) VALUES (?, ?, ?, ?)',
                [dossier_id, 'Dossier aangemaakt', `Dossier "${titel}" is succesvol aangemaakt met ${req.files?.length || 0} documenten.`, 'Systeem']
            );

            // Trigger AI processing in background
            if (req.files && req.files.length > 0) {
                let combinedPrompt = ai_extraction_prompt || '';
                if (remarks) {
                    combinedPrompt = combinedPrompt
                        ? `${combinedPrompt}\n\nDOSSIER-SPECIFIEKE INSTRUCTIE: ${remarks}`
                        : remarks;
                }
                processDossierDocuments(dossier_id, req.files, combinedPrompt || null);
            }

            res.status(201).json({
                message: 'Dossier aangemaakt',
                id: ui_id,
                dossier_id: dossier_id
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
            const [rows] = await pool.query('SELECT * FROM Dossier WHERE ui_id = ? OR dossier_id = ?', [id, id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Dossier niet gevonden' });
            }
            const row = rows[0];

            // Fetch Timeline
            const [timelineRows] = await pool.query('SELECT * FROM TimelineEvent WHERE dossier_id = ? ORDER BY event_date DESC', [row.dossier_id]);

            // Fetch Documents
            const [docRows] = await pool.query('SELECT * FROM Documenten WHERE dossier_id = ?', [row.dossier_id]);

            // Fetch Agreements and their Versions
            const [agreementRows] = await pool.query(`
                SELECT a.*, t.naam as template_name
                FROM Verkoopsovereenkomst a
                LEFT JOIN Template t ON a.template_id = t.template_id
                WHERE a.dossier_id = ?
            `, [row.dossier_id]);

            const agreements = await Promise.all(agreementRows.map(async (agg) => {
                const [versionRows] = await pool.query('SELECT * FROM Versie WHERE overeenkomst_id = ? ORDER BY created_at ASC', [agg.overeenkomst_id]);

                const versions = await Promise.all(versionRows.map(async (v) => {
                    const versionObj = {
                        id: v.ui_id,
                        number: v.versie_nummer,
                        source: v.source,
                        isCurrent: Boolean(v.is_current),
                        date: v.created_at,
                    };

                    if (v.is_current) {
                        versionObj.sections = await fetchFullVersionContent(v.versie_id);
                    }

                    return versionObj;
                }));

                return {
                    id: agg.ui_id,
                    templateId: agg.template_id,
                    templateName: agg.template_name,
                    versions: versions
                };
            }));

            const dossier = {
                id: row.ui_id,
                name: row.titel,
                address: row.adres,
                verkoper_naam: row.verkoper_naam,
                date: row.last_modified,
                creationDate: row.datum_aanmaak,
                status: row.status,
                type: row.type,
                remarks: row.remarks,
                documentCount: docRows.length,
                agreements: agreements,
                timeline: timelineRows.map(t => ({
                    id: t.ui_id,
                    date: t.event_date,
                    title: t.title,
                    description: t.description,
                    user: t.user_name
                })),
                documents: docRows.map(d => ({
                    id: d.ui_id || d.document_id,
                    name: d.naam,
                    type: d.bestandstype,
                    category: d.document_type,
                    path: d.bestand_pad
                }))
            };

            res.json(dossier);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // PUT /api/dossiers/:id
    updateDossier: async (req, res) => {
        const { id } = req.params;
        const { name, address, status, remarks } = req.body;

        try {
            // Fetch internal dossier_id first
            const [dosRows] = await pool.query('SELECT dossier_id FROM Dossier WHERE ui_id = ?', [id]);
            if (dosRows.length === 0) return res.status(404).json({ error: 'Dossier niet gevonden' });
            const dossierId = dosRows[0].dossier_id;

            const [result] = await pool.query(
                `UPDATE Dossier SET 
                 titel = COALESCE(?, titel), 
                 adres = COALESCE(?, adres), 
                 status = COALESCE(?, status), 
                 remarks = COALESCE(?, remarks) 
                 WHERE dossier_id = ?`,
                [name, address, status, remarks, dossierId]
            );

            if (address) {
                // Determine which tag to use for address. 
                const tagsToSync = ['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_address', 'property_street', 'property_municipality'];
                for (const tag of tagsToSync) {
                    await syncDossierMasterData(dossierId, tag, address);
                }
            }

            res.json({ message: 'Dossier succesvol bijgewerkt' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/versions/:id
    getVersionById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT * FROM Versie WHERE ui_id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Versie niet gevonden' });
            }
            const version = rows[0];
            version.sections = await fetchFullVersionContent(version.versie_id);

            // Fetch dossier documents for context in editor
            const [aggRows] = await pool.query('SELECT dossier_id FROM Verkoopsovereenkomst WHERE overeenkomst_id = ?', [version.overeenkomst_id]);
            if (aggRows.length > 0) {
                const [docRows] = await pool.query('SELECT naam, bestand_pad as path FROM Documenten WHERE dossier_id = ?', [aggRows[0].dossier_id]);
                version.dossier_documents = docRows;
            }

            res.json(version);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/versions/:id/duplicate
    // (Used when opening editor on an existing version to start a new "draft" or just saving)
    // For now, let's add a generic updateVersion endpoint
    updateVersion: async (req, res) => {
        const { id } = req.params; // ui_id
        const sections = Array.isArray(req.body) ? req.body : req.body.sections;

        if (!sections) {
            console.error("No sections provided in updateVersion body:", req.body);
            return res.status(400).json({ error: 'No sections provided' });
        }
        try {
            const [verRows] = await pool.query('SELECT versie_id, overeenkomst_id FROM Versie WHERE ui_id = ?', [id]);
            if (verRows.length === 0) return res.status(404).json({ error: 'Versie niet gevonden' });
            const { versie_id, overeenkomst_id } = verRows[0];

            // Get Dossier ID for sharing logic
            const [aggRows] = await pool.query('SELECT dossier_id FROM Verkoopsovereenkomst WHERE overeenkomst_id = ?', [overeenkomst_id]);
            const dossierId = aggRows[0]?.dossier_id;

            for (const s of sections) {
                // Update AangepasteSectie
                await pool.query(
                    'UPDATE AangepasteSectie SET tekst_inhoud = ?, validatiestatus = ? WHERE aangepaste_sectie_id = ?',
                    [s.content, s.isApproved ? 'approved' : 'pending', s.id]
                );

                if (Array.isArray(s.placeholders)) {
                    for (const p of s.placeholders) {
                        // Update AangepastePlaceholder (Master Data)
                        const [pRows] = await pool.query('SELECT id FROM PlaceholderLibrary WHERE sleutel = ?', [p.id]);
                        if (pRows.length > 0) {
                            const placeholderId = pRows[0].id;
                            await pool.query(`
                                INSERT INTO AangepastePlaceholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus)
                                VALUES (?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE ingevulde_waarde = VALUES(ingevulde_waarde), validatiestatus = VALUES(validatiestatus)
                            `, [dossierId, placeholderId, p.currentValue, p.isApproved ? 'approved' : 'pending']);
                        }
                    }
                }
            }

            res.json({ message: 'Versie bijgewerkt en gesynchroniseerd over dossier' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/dossiers/:id/agreements
    createAgreement: async (req, res) => {
        const { id } = req.params; // dossier ui_id
        const { template_id } = req.body;
        console.log("Creating agreement for dossier:", id, "with template ID:", template_id);

        try {
            // Get dossier internal id
            const [dossierRows] = await pool.query('SELECT dossier_id FROM Dossier WHERE ui_id = ?', [id]);
            if (dossierRows.length === 0) return res.status(404).json({ error: 'Dossier niet gevonden' });
            const dossierId = dossierRows[0].dossier_id;

            // Get template sections
            const [templateRows] = await pool.query('SELECT sections, naam FROM Template WHERE template_id = ?', [template_id]);
            if (templateRows.length === 0) return res.status(404).json({ error: 'Template niet gevonden' });
            const sections = templateRows[0].sections;

            // Determine agreement index (for V1.0, V2.0 logic)
            const [aggCountRows] = await pool.query('SELECT COUNT(*) as count FROM Verkoopsovereenkomst WHERE dossier_id = ?', [dossierId]);
            const nextAggIndex = aggCountRows[0].count + 1;
            const verNum = `${nextAggIndex}.0`;

            const aggUiId = `agg-${Date.now()}`;
            const [aggResult] = await pool.query(
                'INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id) VALUES (?, ?, ?)',
                [aggUiId, dossierId, template_id]
            );
            const aggId = aggResult.insertId;

            const verUiId = `ver-${Date.now()}`;
            const [verResult] = await pool.query(
                'INSERT INTO Versie (ui_id, overeenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?)',
                [verUiId, aggId, verNum, 'AI', true]
            );

            await initializeVersionFromTemplate(verResult.insertId, template_id, dossierId);

            res.json({ id: aggUiId, versionId: verUiId, version_nummer: verNum });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/agreements/:id/versions
    createVersion: async (req, res) => {
        const { id } = req.params; // agreement ui_id
        const { sections, source } = req.body;

        try {
            // Get agreement internal id
            const [aggRows] = await pool.query('SELECT overeenkomst_id, template_id, dossier_id FROM Verkoopsovereenkomst WHERE ui_id = ?', [id]);
            if (aggRows.length === 0) return res.status(404).json({ error: 'Overeenkomst niet gevonden' });
            const { overeenkomst_id, template_id, dossier_id } = aggRows[0];

            // Get latest version number
            const [verRows] = await pool.query(
                'SELECT versie_id, versie_nummer, sections FROM Versie WHERE overeenkomst_id = ? ORDER BY created_at DESC LIMIT 1',
                [overeenkomst_id]
            );

            let nextNum = '1.0';
            let baseSections = sections;

            if (verRows.length > 0) {
                const currentNum = verRows[0].versie_nummer;
                const parts = currentNum.split('.');
                // If it's the first version (X.0), the next is X.1
                // If it's already a minor version (X.Y), the next is X.(Y+1)
                nextNum = `${parts[0]}.${parseInt(parts[1] || 0) + 1}`;

                // If no sections provided, copy from previous version
                if (!baseSections && !req.file) {
                    baseSections = verRows[0].sections;
                }
            }

            // Set all others to not current
            await pool.query('UPDATE Versie SET is_current = false WHERE overeenkomst_id = ?', [overeenkomst_id]);

            const verUiId = `ver-${Date.now()}`;
            const filePath = req.file ? `/uploads/${req.file.filename}` : null;
            const finalSource = req.file ? 'Upload' : (source || 'Manual');

            const [verResult] = await pool.query(
                'INSERT INTO Versie (ui_id, overeenkomst_id, versie_nummer, source, file_path, is_current) VALUES (?, ?, ?, ?, ?, ?)',
                [verUiId, overeenkomst_id, nextNum, finalSource, filePath, true]
            );
            const newVerId = verResult.insertId;

            if (verRows.length > 0) {
                // Copy from previous version
                await copyVersionContent(verRows[0].versie_id, newVerId);
            } else {
                // Should not happen as we usually have a V1.0, but just in case
                await initializeVersionFromTemplate(newVerId, template_id, dossier_id);
            }

            res.json({ id: verUiId, version_nummer: nextNum, file_path: filePath });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /api/dossiers/:id
    deleteDossier: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM Dossier WHERE ui_id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Dossier niet gevonden' });
            }
            res.json({ message: 'Dossier verwijderd' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /api/dossiers/versions/:id
    deleteVersion: async (req, res) => {
        const { id } = req.params; // ui_id
        try {
            // Get internal version id
            const [verRows] = await pool.query('SELECT versie_id, overeenkomst_id, is_current FROM Versie WHERE ui_id = ?', [id]);
            if (verRows.length === 0) return res.status(404).json({ error: 'Versie niet gevonden' });

            const { versie_id, overeenkomst_id, is_current } = verRows[0];

            // Placeholder links are in SectiePlaceholder and are global, 
            // but dossier-level values are in AangepastePlaceholder. 
            // We only delete AangepasteSections for the version.
            await pool.query('DELETE FROM AangepasteSectie WHERE versie_id = ?', [versie_id]);

            // 2. Delete the version itself
            await pool.query('DELETE FROM Versie WHERE versie_id = ?', [versie_id]);

            // 3. Check if any versions remain for this agreement
            const [remainingVersions] = await pool.query('SELECT COUNT(*) as count FROM Versie WHERE overeenkomst_id = ?', [overeenkomst_id]);

            if (remainingVersions[0].count === 0) {
                // No versions left, delete the agreement
                await pool.query('DELETE FROM Verkoopsovereenkomst WHERE overeenkomst_id = ?', [overeenkomst_id]);
                return res.json({ message: 'Versie en overeenkomst verwijderd (geen versies meer)' });
            }

            // 4. If it was the current version, set the next latest one as current
            if (is_current) {
                const [nextLatest] = await pool.query(
                    'SELECT versie_id FROM Versie WHERE overeenkomst_id = ? ORDER BY created_at DESC LIMIT 1',
                    [overeenkomst_id]
                );
                if (nextLatest.length > 0) {
                    await pool.query('UPDATE Versie SET is_current = true WHERE versie_id = ?', [nextLatest[0].versie_id]);
                }
            }

            res.json({ message: 'Versie verwijderd' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /api/dossiers/agreements/:id
    deleteAgreement: async (req, res) => {
        const { id } = req.params; // overeenkomst_id or ui_id
        try {
            // Get internal agreement id
            const [aggRows] = await pool.query('SELECT overeenkomst_id FROM Verkoopsovereenkomst WHERE overeenkomst_id = ? OR ui_id = ?', [id, id]);
            if (aggRows.length === 0) return res.status(404).json({ error: 'Overeenkomst niet gevonden' });

            const { overeenkomst_id } = aggRows[0];

            // 1. Get all versions for this agreement
            const [versions] = await pool.query('SELECT versie_id FROM Versie WHERE overeenkomst_id = ?', [overeenkomst_id]);

            // 2. Delete all associated sections for each version
            for (const version of versions) {
                await pool.query('DELETE FROM AangepasteSectie WHERE versie_id = ?', [version.versie_id]);
            }

            // 3. Delete all versions
            await pool.query('DELETE FROM Versie WHERE overeenkomst_id = ?', [overeenkomst_id]);

            // 4. Delete the agreement itself
            await pool.query('DELETE FROM Verkoopsovereenkomst WHERE overeenkomst_id = ?', [overeenkomst_id]);

            res.json({ message: 'Overeenkomst verwijderd' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // PATCH /api/dossiers/versions/:id/rename
    renameVersion: async (req, res) => {
        const { id } = req.params; // versie_id or ui_id
        const { name } = req.body;

        if (!name) return res.status(400).json({ error: 'Naam is verplicht' });

        try {
            const [result] = await pool.query(
                'UPDATE Versie SET versie_nummer = ? WHERE versie_id = ? OR ui_id = ?',
                [name, id, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Versie niet gevonden' });
            }

            res.json({ message: 'Versie hernoemd', name });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/dossiers/versions/:id/export?format=pdf
    exportVersion: async (req, res) => {
        const { id } = req.params;
        const { format } = req.query; // 'pdf' or 'docx'

        try {
            const [verRows] = await pool.query('SELECT versie_id, versie_nummer FROM Versie WHERE ui_id = ?', [id]);
            if (verRows.length === 0) return res.status(404).json({ error: 'Versie niet gevonden' });

            const internalVerId = verRows[0].versie_id;
            const sections = await fetchFullVersionContent(internalVerId);

            // Resolve placeholders in content?
            // Generate DOCX
            const exportService = require('../services/exportService');
            // Log what we are getting
            console.log(`Exporting version ${internalVerId}, found ${sections.length} sections.`);

            const docxBuffer = await exportService.generateDocx(sections, `Verkoopsovereenkomst v${verRows[0].versie_nummer}`);

            // DEBUG: Save the buffer to disk to verify it is valid BEFORE sending
            const fs = require('fs');
            const path = require('path');
            try {
                const debugPath = path.join(__dirname, `../debug_server_export_${id}.docx`);
                fs.writeFileSync(debugPath, docxBuffer);
                console.log(`SAVED DEBUG DOCX TO: ${debugPath} (Size: ${docxBuffer.length})`);
            } catch (err) {
                console.error("Failed to save debug docx:", err);
            }

            if (format === 'pdf') {
                const pdfBuffer = await exportService.convertToPdf(docxBuffer);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="verkoopsovereenkomst_${id}.pdf"`);
                res.send(pdfBuffer);
            } else {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="verkoopsovereenkomst_${id}.docx"`);
                res.send(docxBuffer);
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = dossierController;
