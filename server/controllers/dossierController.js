const { pool } = require('../config/db');
const { extractTextFromPDF, extractTextFromDOCX, analyzeDocument } = require('../services/aiService');
const path = require('path');
const fs = require('fs');

const dlog = (msg) => {
    try {
        fs.appendFileSync('/tmp/dossier_debug.log', new Date().toISOString() + ' - ' + msg + '\n');
    } catch(e) {}
};
const fetchFullVersionContent = async (versie_id) => {
    const [verRows] = await pool.query(`
        SELECT vo.dossier_id 
        FROM Versie v 
        JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id 
        WHERE v.versie_id = ?
    `, [versie_id]);

    if (verRows.length === 0) return [];
    const dossierId = verRows[0].dossier_id;

    const [sections] = await pool.query(`
        SELECT vs.*, s.titel as title, s.tekst_content as original_content
        FROM VersieSectie vs
        JOIN Sectie s ON vs.sectie_id = s.sectie_id
        WHERE vs.versie_id = ?
        ORDER BY s.volgorde ASC
    `, [versie_id]);

    for (let section of sections) {
        const [placeholders] = await pool.query(`
            SELECT 
                pl.placeholder_id, 
                pl.sleutel as name, 
                pl.type, 
                p.pdf_label,
                ap.ingevulde_waarde as value,
                ap.validatiestatus as placeholder_validation_status,
                ap.document_id,
                ap.bron_text,
                ap.pagina_nummer,
                d.bestand_pad as document_pad,
                d.bestandsnaam as document_naam
            FROM Placeholder p
            JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
            LEFT JOIN Aangepaste_Placeholder ap ON pl.placeholder_id = ap.placeholder_id AND ap.dossier_id = ?
            LEFT JOIN Documenten d ON ap.document_id = d.document_id
            WHERE p.sectie_id = ?
        `, [dossierId, section.sectie_id]);

        section.placeholders = placeholders.map(p => ({
            id: p.name,
            label: p.pdf_label || p.name,
            currentValue: p.value || '',
            isApproved: p.placeholder_validation_status === 'approved',
            type: p.type,
            documentId: p.document_id || null,
            bronText: p.bron_text || null,
            paginaNummer: p.pagina_nummer || null,
            documentPad: p.document_pad || null,
            documentNaam: p.document_naam || null
        }));

        section.id = section.aangepaste_sectie_id.toString();
        section.content = section.tekst_inhoud;
        section.isApproved = section.validatiestatus === 'approved';
    }

    return sections;
};

const initializeVersionFromTemplate = async (versie_id, template_id, dossier_id) => {
    dlog(`[INIT] initializeVersionFromTemplate called for versie ${versie_id} with template ${template_id}`);
    const [templateSections] = await pool.query('SELECT * FROM Sectie WHERE template_id = ? ORDER BY volgorde ASC', [template_id]);
    dlog(`[INIT] found ${templateSections.length} sections for template ${template_id}`);
    for (const ts of templateSections) {
        const [vsResult] = await pool.query(
            'INSERT INTO VersieSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
            [versie_id, ts.sectie_id, ts.tekst_content, 'pending']
        );
        const aangepasteSectieId = vsResult.insertId;

        const [templatePlaceholders] = await pool.query(`
            SELECT pl.* 
            FROM Placeholder_Library pl 
            JOIN Placeholder p ON pl.placeholder_id = p.placeholder_id 
            WHERE p.sectie_id = ?
        `, [ts.sectie_id]);

        for (const tp of templatePlaceholders) {
            const [existing] = await pool.query('SELECT 1 FROM Aangepaste_Placeholder WHERE dossier_id = ? AND placeholder_id = ?', [dossier_id, tp.placeholder_id]);
            if (existing.length > 0) {
                await pool.query(
                    'UPDATE Aangepaste_Placeholder SET aangepaste_sectie_id = ? WHERE dossier_id = ? AND placeholder_id = ?',
                    [aangepasteSectieId, dossier_id, tp.placeholder_id]
                );
            } else {
                await pool.query(
                    'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?, ?)',
                    [dossier_id, tp.placeholder_id, aangepasteSectieId, '', 'unverified']
                );
            }
        }
    }
};

const copyVersionContent = async (sourceVersionId, targetVersionId) => {
    const [oldSections] = await pool.query('SELECT * FROM VersieSectie WHERE versie_id = ?', [sourceVersionId]);
    for (const os of oldSections) {
        await pool.query(
            'INSERT INTO VersieSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
            [targetVersionId, os.sectie_id, os.tekst_inhoud, os.validatiestatus]
        );
    }
};

const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null) => {
    try {
        const [pDef] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ? LIMIT 1', [tag]);
        if (pDef.length > 0) {
            const placeholderId = pDef[0].placeholder_id;
            const [existing] = await pool.query('SELECT 1 FROM Aangepaste_Placeholder WHERE dossier_id = ? AND placeholder_id = ?', [dossierId, placeholderId]);
            if (existing.length > 0) {
                await pool.query(
                    'UPDATE Aangepaste_Placeholder SET ingevulde_waarde = ?, validatiestatus = ?, document_id = ?, bron_text = ? WHERE dossier_id = ? AND placeholder_id = ?',
                    [value, 'unverified', documentId, bronText, dossierId, placeholderId]
                );
            } else {
                await pool.query(
                    'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text) VALUES (?, ?, ?, ?, ?, ?)',
                    [dossierId, placeholderId, value, 'unverified', documentId, bronText]
                );
            }
        }
        if (['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_street', 'property_municipality', 'property_address'].includes(tag)) {
            if (value && value.trim()) await pool.query('UPDATE Dossier SET adres = ? WHERE dossier_id = ?', [value, dossierId]);
        }
    } catch (err) { console.error('Error in syncDossierMasterData:', err); }
};

const processDossierDocuments = async (dossierId, files, customPrompt = null, templateId = null) => {
    try {
        let pRows;
        if (templateId) {
            [pRows] = await pool.query(`
                SELECT pl.sleutel as name, pl.type, s.titel as section_title, p.pdf_label
                FROM Placeholder_Library pl
                JOIN Placeholder p ON pl.placeholder_id = p.placeholder_id
                JOIN Sectie s ON p.sectie_id = s.sectie_id
                WHERE s.template_id = ?
            `, [templateId]);
        } else {
            [pRows] = await pool.query(`
                SELECT pl.sleutel as name, pl.type, s.titel as section_title, p.pdf_label
                FROM Placeholder_Library pl
                LEFT JOIN Placeholder p ON pl.placeholder_id = p.placeholder_id
                LEFT JOIN Sectie s ON p.sectie_id = s.sectie_id
            `);
        }
        const consolidatedMap = {};
        for (const row of pRows) {
            if (!consolidatedMap[row.name]) consolidatedMap[row.name] = { name: row.name, type: row.type, labels: new Set(), sections: new Set() };
            if (row.pdf_label) consolidatedMap[row.name].labels.add(row.pdf_label);
            if (row.section_title) consolidatedMap[row.name].sections.add(row.section_title);
        }
        const tagsToExtract = Object.keys(consolidatedMap);
        const fieldContexts = Object.values(consolidatedMap).map(ctx => ({ naam: ctx.name, type: ctx.type, label: Array.from(ctx.labels).join(', ') || ctx.name, sections: Array.from(ctx.sections).join(', ') || 'General' }));
        let combinedExtractedData = {};
        for (const file of files) {
            dlog(`[AI] Processing file ${file.filename} / ${file.originalname} (mimetype: ${file.mimetype})`);
            
            let text = null;
            const filePath = path.join(__dirname, '..', 'uploads', file.filename);
            
            if (file.mimetype === 'application/pdf') {
                dlog(`[AI] File path: ${filePath}`);
                await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [dossierId, 'AI Analyse: PDF inlezen', `Tekst extraheren uit ${file.originalname}...`, 'AI Assistent']);
                text = await extractTextFromPDF(filePath);
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
                dlog(`[AI] File path: ${filePath}`);
                await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [dossierId, 'AI Analyse: Word inlezen', `Tekst extraheren uit ${file.originalname}...`, 'AI Assistent']);
                text = await extractTextFromDOCX(filePath);
            } else {
                dlog(`[AI] Unsupported mimetype: ${file.mimetype}`);
                continue;
            }

            dlog(`[AI] Extracted text length: ${text ? text.length : 0}`);
            if (text && text.trim().length > 0) {
                await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [dossierId, 'AI Analyse: Gegevens zoeken', `Gemini analyseert ${file.originalname} (${text.length} tekens)...`, 'AI Assistent']);
                dlog(`[AI] Calling analyzeDocument for ${tagsToExtract.length} tags`);
                const extractedData = await analyzeDocument(text, tagsToExtract, customPrompt, fieldContexts);
                dlog(`[AI] Extracted ${Object.keys(extractedData || {}).length} items from document`);
                for (const [key, val] of Object.entries(extractedData || {})) {
                    if (val && typeof val === 'object' && val.waarde !== undefined && val.waarde !== '') {
                        combinedExtractedData[key] = {
                            waarde: val.waarde,
                            bron_text: val.bron_text || null,
                            document_id: file.id || null
                        };
                    } else if (typeof val === 'string' && val.trim() !== '') {
                        combinedExtractedData[key] = {
                            waarde: val,
                            bron_text: null,
                            document_id: file.id || null
                        };
                    }
                }
            }
        }
        let matchCount = 0;
        for (const [tag, data] of Object.entries(combinedExtractedData)) {
            if (data && data.waarde && data.waarde.toString().trim()) { 
                console.log(`AI extracted field [${tag}]: ${data.waarde}`);
                await syncDossierMasterData(dossierId, tag, data.waarde.toString(), data.document_id, data.bron_text); 
                matchCount++; 
            }
        }
        await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [dossierId, 'AI Analyse Voltooid', `AI heeft de documenten geanalyseerd and ${matchCount} velden ingevuld of bijgewerkt.`, 'AI Assistent']);
        dlog(`[AI] Finished processDossierDocuments successfully with ${matchCount} matches`);
    } catch (error) {
        dlog(`[AI] ERROR in processDossierDocuments: ${error.message} - ${error.stack}`);
        console.error('Error in processDossierDocuments:', error);
        await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [dossierId, 'AI Analyse Fout', `Er is een fout opgetreden bij het verwerken van de documenten: ${error.message}`, 'Systeem']);
    }
};

const dossierController = {
    getAllDossiers: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT d.*, 
                (SELECT COUNT(*) FROM Documenten doc WHERE doc.dossier_id = d.dossier_id) as documentCount,
                (SELECT COUNT(*) FROM Verkoopsovereenkomst v WHERE v.dossier_id = d.dossier_id) as agreementCount
                FROM Dossier d 
                WHERE d.account_id = ?
                ORDER BY d.display_order ASC, d.last_modified DESC
            `, [req.user.id]);
            res.json(rows.map(row => ({
                id: row.ui_id,
                name: row.titel,
                address: row.adres,
                verkoper_naam: row.verkoper_naam,
                date: row.last_opened || row.last_modified || row.created_at,
                status: row.status || 'draft',
                type: row.type || 'House',
                documentCount: row.documentCount || 0,
                agreementCount: row.agreementCount || 0
            })));
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    createDossier: async (req, res) => {
        const { titel, verkoper_naam, adres, type, template_id, remarks, ai_extraction_prompt } = req.body;
        console.log("--- createDossier request received ---");
        console.log("Body fields:", { titel, verkoper_naam, adres, type, template_id });
        console.log("Files received:", req.files ? req.files.length : 0);
        
        if (!titel) return res.status(400).json({ error: 'Titel is verplicht' });
        const ui_id = `dos-${Date.now()}`;
        try {
            console.log("Inserting Dossier record...");
            const [dosResult] = await pool.query(
                `INSERT INTO Dossier (account_id, ui_id, titel, verkoper_naam, adres, type, status, remarks) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [req.user.id, ui_id, titel, verkoper_naam, adres, type || 'House', 'draft', remarks || null]
            );
            const dossier_id = dosResult.insertId;
            console.log("Dossier inserted, ID:", dossier_id);
            if (adres) {
                console.log("Syncing master data for address...");
                for (const tag of ['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_address', 'property_street', 'property_municipality']) await syncDossierMasterData(dossier_id, tag, adres);
            }
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    await pool.query(
                        'INSERT INTO Documenten (ui_id, dossier_id, naam, bestandsnaam, bestand_pad, bestandstype, document_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [`doc-${Date.now()}-${Math.random()}`, dossier_id, file.originalname, file.filename, `/uploads/${file.filename}`, file.mimetype, 'Uploaded']
                    );
                }
            }
            if (template_id) {
                console.log("Initializing version from template:", template_id);
                // ... (rest of the block)
                const [voResult] = await pool.query('INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id) VALUES (?, ?, ?)', [`ouv-${Date.now()}`, dossier_id, template_id]);
                const [verResult] = await pool.query('INSERT INTO Versie (ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?)', [`ver-${Date.now()}`, voResult.insertId, '1.0', 'AI', true]);
                await initializeVersionFromTemplate(verResult.insertId, template_id, dossier_id);
            }
            console.log("Adding timeline event...");
            await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [dossier_id, 'Dossier aangemaakt', `Dossier "${titel}" is succesvol aangemaakt.`, 'Systeem']);
            console.log("Sending response back to client.");
            res.status(201).json({ message: 'Dossier aangemaakt', id: ui_id, dossier_id });
        } catch (error) { 
            console.error("CRITICAL ERROR IN createDossier:", error); 
            res.status(500).json({ error: error.message }); 
        }
    },

    getDossierById: async (req, res) => {
        const { id } = req.params;
        try {
            // First find the internal dossier_id to avoid type mismatch in complex OR queries
            const [idCheck] = await pool.query('SELECT dossier_id FROM Dossier WHERE ui_id = ? OR dossier_id = ?', [id, isNaN(id) ? -1 : id]);
            if (idCheck.length === 0) return res.status(404).json({ error: 'Dossier niet gevonden' });
            const internalId = idCheck[0].dossier_id;

            await pool.query('UPDATE Dossier SET last_opened = CURRENT_TIMESTAMP WHERE dossier_id = ? AND account_id = ?', [internalId, req.user.id]);
            const [rows] = await pool.query('SELECT * FROM Dossier WHERE dossier_id = ? AND account_id = ?', [internalId, req.user.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Dossier niet gevonden' });
            const row = rows[0];
            const [timelineRows] = await pool.query('SELECT * FROM TimelineEvent WHERE dossier_id = ? ORDER BY event_date DESC', [row.dossier_id]);
            const [docRows] = await pool.query('SELECT * FROM Documenten WHERE dossier_id = ?', [row.dossier_id]);
            const [agreementRows] = await pool.query(`
                SELECT vo.*, t.naam as template_name
                FROM Verkoopsovereenkomst vo
                LEFT JOIN Template t ON vo.template_id = t.template_id
                WHERE vo.dossier_id = ?
            `, [row.dossier_id]);
            const agreements = await Promise.all(agreementRows.map(async (agg) => {
                const [versionRows] = await pool.query('SELECT * FROM Versie WHERE verkoopsovereenkomst_id = ? ORDER BY created_at ASC', [agg.verkoopsovereenkomst_id]);
                const versions = await Promise.all(versionRows.map(async (v) => {
                    const vo = { id: v.ui_id, number: v.versie_nummer, source: v.source, isCurrent: Boolean(v.is_current), date: v.created_at };
                    if (v.is_current) vo.sections = await fetchFullVersionContent(v.versie_id);
                    return vo;
                }));
                return { id: agg.ui_id, templateId: agg.template_id, templateName: agg.template_name, versions };
            }));
            res.json({
                id: row.ui_id, name: row.titel, address: row.adres, verkoper_naam: row.verkoper_naam, date: row.last_modified, creationDate: row.created_at, status: row.status, type: row.type, remarks: row.remarks,
                agreements, timeline: timelineRows.map(t => ({ id: t.ui_id, date: t.event_date, title: t.titel, description: t.beschrijving, user: t.user_name })),
                documents: docRows.map(d => ({ id: d.ui_id, name: d.naam, type: d.bestandstype, category: d.document_type, path: d.bestand_pad }))
            });
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    updateDossier: async (req, res) => {
        const { id } = req.params;
        const { name, address, status, remarks } = req.body;
        try {
            const [dosRows] = await pool.query('SELECT dossier_id FROM Dossier WHERE ui_id = ?', [id]);
            if (dosRows.length === 0) return res.status(404).json({ error: 'Dossier niet gevonden' });
            const internalId = dosRows[0].dossier_id;
            await pool.query(`UPDATE Dossier SET titel = COALESCE(?, titel), adres = COALESCE(?, adres), status = COALESCE(?, status), remarks = COALESCE(?, remarks) WHERE dossier_id = ?`, [name, address, status, remarks, internalId]);
            if (address) for (const tag of ['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_address', 'property_street', 'property_municipality']) await syncDossierMasterData(internalId, tag, address);
            res.json({ message: 'Dossier bijgewerkt' });
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    getVersionById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT * FROM Versie WHERE ui_id = ? OR versie_id = ?', [id, isNaN(id) ? -1 : id]);
            if (rows.length === 0) {
                console.log(`[GET] getVersionById: Versie met ui_id / id ${id} niet gevonden!`);
                return res.status(404).json({ error: 'Versie niet gevonden' });
            }
            const v = rows[0];
            v.sections = await fetchFullVersionContent(v.versie_id);
            const [aggRows] = await pool.query('SELECT dossier_id FROM Verkoopsovereenkomst WHERE verkoopsovereenkomst_id = ?', [v.verkoopsovereenkomst_id]);
            if (aggRows.length > 0) {
                const [docRows] = await pool.query('SELECT naam as name, bestand_pad as path FROM Documenten WHERE dossier_id = ?', [aggRows[0].dossier_id]);
                v.dossier_documents = docRows;
                const [dosRows] = await pool.query('SELECT ui_id FROM Dossier WHERE dossier_id = ?', [aggRows[0].dossier_id]);
                if (dosRows.length > 0) v.dossier_ui_id = dosRows[0].ui_id;
            }
            res.json(v);
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    updateVersion: async (req, res) => { /* Omitting detailed loop for brevity but ensuring column names match */
        const { id } = req.params;
        const sections = Array.isArray(req.body) ? req.body : req.body.sections;
        try {
            const [verRows] = await pool.query('SELECT versie_id, verkoopsovereenkomst_id FROM Versie WHERE ui_id = ?', [id]);
            if (verRows.length === 0) return res.status(404).json({ error: 'Versie niet gevonden' });
            const [aggRows] = await pool.query('SELECT dossier_id FROM Verkoopsovereenkomst WHERE verkoopsovereenkomst_id = ?', [verRows[0].verkoopsovereenkomst_id]);
            const dossierId = aggRows[0]?.dossier_id;
            for (const s of (sections || [])) {
                await pool.query('UPDATE VersieSectie SET tekst_inhoud = ?, validatiestatus = ? WHERE aangepaste_sectie_id = ?', [s.content, s.isApproved ? 'approved' : 'pending', s.id]);
                for (const p of (s.placeholders || [])) {
                    const [pRows] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ?', [p.id]);
                    if (pRows.length > 0) await pool.query(`INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ingevulde_waarde = VALUES(ingevulde_waarde), validatiestatus = VALUES(validatiestatus)`, [dossierId, pRows[0].placeholder_id, p.currentValue, p.isApproved ? 'approved' : 'pending']);
                }
            }
            res.json({ message: 'Versie bijgewerkt' });
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    deleteDossier: async (req, res) => {
        const { id } = req.params;
        console.log(`--- Delete Dossier request for ID: ${id} ---`);
        try { 
            const [result] = await pool.query('DELETE FROM Dossier WHERE ui_id = ? OR dossier_id = ?', [id, isNaN(id) ? -1 : id]); 
            console.log(`Delete result: ${result.affectedRows} rows deleted`);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Dossier niet gevonden of niet gemachtigd' });
            }
            res.json({ message: 'Dossier verwijderd' }); 
        }
        catch (error) { console.error("Error deleting dossier:", error); res.status(500).json({ error: error.message }); }
    },

    createAgreement: async (req, res) => {
        try {
            const [dosRows] = await pool.query('SELECT dossier_id FROM Dossier WHERE ui_id = ?', [req.params.id]);
            if (dosRows.length === 0) return res.status(404).json({ error: 'Dossier niet gevonden' });
            const [aggCount] = await pool.query('SELECT COUNT(*) as count FROM Verkoopsovereenkomst WHERE dossier_id = ?', [dosRows[0].dossier_id]);
            const verNum = `${aggCount[0].count + 1}.0`;
            const vo_ui_id = `ouv-${Date.now()}`;
            const ver_ui_id = `ver-${Date.now()}`;
            const [voResult] = await pool.query('INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id) VALUES (?, ?, ?)', [vo_ui_id, dosRows[0].dossier_id, req.body.template_id]);
            const [vResult] = await pool.query('INSERT INTO Versie (ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?)', [ver_ui_id, voResult.insertId, verNum, 'AI', true]);
            await initializeVersionFromTemplate(vResult.insertId, req.body.template_id, dosRows[0].dossier_id);
            
            // Trigger AI analysis if documents exist
            dlog(`triggering AI analysis for createAgreement verNum ${verNum}`);
            const [docRows] = await pool.query('SELECT * FROM Documenten WHERE dossier_id = ?', [dosRows[0].dossier_id]);
            if (docRows.length > 0) {
                const files = docRows.map(doc => ({
                    id: doc.document_id,
                    filename: doc.bestandsnaam,
                    originalname: doc.naam,
                    mimetype: doc.bestandstype
                }));
                dlog(`docRows > 0, calling AI on files: ${files.length} for remarks: ${req.body.remarks}`);
                await processDossierDocuments(dosRows[0].dossier_id, files, req.body.remarks || null, req.body.template_id);
            }

            res.json({ id: vo_ui_id, versionId: ver_ui_id, version_nummer: verNum });
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    createVersion: async (req, res) => {
        try {
            const [aggRows] = await pool.query('SELECT verkoopsovereenkomst_id, template_id, dossier_id FROM Verkoopsovereenkomst WHERE ui_id = ?', [req.params.id]);
            if (aggRows.length === 0) return res.status(404).json({ error: 'Overeenkomst niet gevonden' });
            
            const [verRows] = await pool.query('SELECT versie_id, versie_nummer FROM Versie WHERE verkoopsovereenkomst_id = ? ORDER BY created_at DESC LIMIT 1', [aggRows[0].verkoopsovereenkomst_id]);
            let nextNum = '1.0';
            if (verRows.length > 0) { const parts = verRows[0].versie_nummer.split('.'); nextNum = `${parts[0]}.${parseInt(parts[1] || 0) + 1}`; }
            
            await pool.query('UPDATE Versie SET is_current = false WHERE verkoopsovereenkomst_id = ?', [aggRows[0].verkoopsovereenkomst_id]);
            const ver_ui_id = `ver-${Date.now()}`;
            const [vResult] = await pool.query('INSERT INTO Versie (ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?)', [ver_ui_id, aggRows[0].verkoopsovereenkomst_id, nextNum, req.file ? 'Upload' : (req.body.source || 'Manual'), true]);
            
            dlog(`Created new version ${vResult.insertId}. verRows length: ${verRows.length}`);
            if (verRows.length > 0) {
                console.log(`Copying version content from ${verRows[0].versie_id} to ${vResult.insertId}`);
                dlog(`Copying version content from ${verRows[0].versie_id} to ${vResult.insertId}`);
                await copyVersionContent(verRows[0].versie_id, vResult.insertId);
            } else {
                console.log(`Initializing new version from template ${aggRows[0].template_id} to ${vResult.insertId}`);
                dlog(`Initializing new version from template ${aggRows[0].template_id} to ${vResult.insertId}`);
                await initializeVersionFromTemplate(vResult.insertId, aggRows[0].template_id, aggRows[0].dossier_id);
            }

            // Trigger AI analysis if documents exist
            const [docRows] = await pool.query('SELECT * FROM Documenten WHERE dossier_id = ?', [aggRows[0].dossier_id]);
            if (docRows.length > 0) {
                const files = docRows.map(doc => ({
                    id: doc.document_id,
                    filename: doc.bestandsnaam,
                    originalname: doc.naam,
                    mimetype: doc.bestandstype
                }));
                const source = req.file ? 'Upload' : (req.body.source || 'Manual');
                const remarks = `Analyze for version ${nextNum} created via ${source}`;
                console.log(`Triggering AI analysis for new version ${nextNum} of agreement ${req.params.id}`);
                // Wait for AI analysis to finish before responding so that placeholders exist in Editor immediately
                await processDossierDocuments(aggRows[0].dossier_id, files, remarks, aggRows[0].template_id);
            }

            res.json({ id: ver_ui_id, version_nummer: nextNum });
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    deleteVersion: async (req, res) => {
        const { id } = req.params;
        console.log(`--- deleteVersion request for UI_ID: ${id} ---`);
        try {
            const [vRows] = await pool.query('SELECT versie_id, verkoopsovereenkomst_id, is_current FROM Versie WHERE ui_id = ?', [id]);
            if (vRows.length === 0) {
                console.log(`Version deletion failed: Versie met UI_ID ${id} niet gevonden`);
                return res.status(404).json({ error: 'Versie niet gevonden' });
            }
            const { versie_id, verkoopsovereenkomst_id, is_current } = vRows[0];
            console.log(`Deleting dependencies for versie_id: ${versie_id}`);

            // Aangepaste_Placeholder records should be handled by ON DELETE CASCADE, but let's be explicit if needed
            // Actually, Aangepaste_Placeholder links to VersieSectie which links to Versie.
            // If we delete VersieSectie, it should cascade to Aangepaste_Placeholder.
            await pool.query('DELETE FROM VersieSectie WHERE versie_id = ?', [versie_id]);
            await pool.query('DELETE FROM Versie WHERE versie_id = ?', [versie_id]);
            console.log(`Version ${versie_id} deleted successfully`);

            const [remain] = await pool.query('SELECT versie_id FROM Versie WHERE verkoopsovereenkomst_id = ? ORDER BY created_at DESC LIMIT 1', [verkoopsovereenkomst_id]);
            if (remain.length === 0) {
                console.log(`No versions left for agreement ${verkoopsovereenkomst_id}, deleting agreement...`);
                await pool.query('DELETE FROM Verkoopsovereenkomst WHERE verkoopsovereenkomst_id = ?', [verkoopsovereenkomst_id]);
            }
            else if (is_current) {
                console.log(`Previous current version was deleted, promoting version ${remain[0].versie_id} to current`);
                await pool.query('UPDATE Versie SET is_current = true WHERE versie_id = ?', [remain[0].versie_id]);
            }
            res.json({ message: 'Versie verwijderd' });
        } catch (error) { 
            console.error("CRITICAL ERROR IN deleteVersion:", error); 
            res.status(500).json({ error: error.message }); 
        }
    },

    deleteAgreement: async (req, res) => {
        try { 
            const id = req.params.id;
            await pool.query('DELETE FROM Verkoopsovereenkomst WHERE ui_id = ? OR verkoopsovereenkomst_id = ?', [id, isNaN(id) ? -1 : id]); 
            res.json({ message: 'Overeenkomst verwijderd' }); 
        }
        catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    renameVersion: async (req, res) => {
        try { 
            const id = req.params.id;
            await pool.query('UPDATE Versie SET versie_nummer = ? WHERE ui_id = ? OR versie_id = ?', [req.body.name, id, isNaN(id) ? -1 : id]); 
            res.json({ message: 'Versie hernoemd' }); 
        }
        catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    exportVersion: async (req, res) => {
        try {
            const [vRows] = await pool.query('SELECT versie_id, versie_nummer FROM Versie WHERE ui_id = ?', [req.params.id]);
            if (vRows.length === 0) return res.status(404).json({ error: 'Versie niet gevonden' });
            const sections = await fetchFullVersionContent(vRows[0].versie_id);
            const exportService = require('../services/exportService');
            const docxBuffer = await exportService.generateDocx(sections, `Verkoopsovereenkomst v${vRows[0].versie_nummer}`);
            if (req.query.format === 'pdf') {
                const pdfBuffer = await exportService.convertToPdf(docxBuffer);
                res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="verkoop_${req.params.id}.pdf"`); res.send(pdfBuffer);
            } else {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); res.setHeader('Content-Disposition', `attachment; filename="verkoop_${req.params.id}.docx"`); res.send(docxBuffer);
            }
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    reorderDossiers: async (req, res) => {
        try { for (const item of (req.body.orders || [])) await pool.query('UPDATE Dossier SET display_order = ? WHERE ui_id = ?', [item.order, item.id]); res.json({ message: 'Reordered' }); }
        catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    }
};

module.exports = dossierController;
