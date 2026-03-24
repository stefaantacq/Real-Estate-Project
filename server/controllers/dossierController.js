const { pool } = require('../config/db');
const { extractTextFromPDF, extractTextFromDOCX, extractTextFromImage, analyzeDocument } = require('../services/aiService');
const path = require('path');
const fs = require('fs');

const dlog = (msg) => {
    try {
        fs.appendFileSync('/tmp/dossier_debug.log', new Date().toISOString() + ' - ' + msg + '\n');
    } catch(e) {}
};
const fetchFullVersionContent = async (versie_id) => {
    const [verRows] = await pool.query(`
        SELECT vo.dossier_id, vo.verkoopsovereenkomst_id
        FROM Versie v 
        JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id 
        WHERE v.versie_id = ?
    `, [versie_id]);

    if (verRows.length === 0) return [];
    const dossierId = verRows[0].dossier_id;
    const verkoopsovereenkomstId = verRows[0].verkoopsovereenkomst_id;

    const [sections] = await pool.query(`
        SELECT vs.*, s.titel as title, s.tekst_content as original_content
        FROM VersieSectie vs
        JOIN Sectie s ON vs.sectie_id = s.sectie_id
        WHERE vs.versie_id = ?
        ORDER BY s.volgorde ASC
    `, [versie_id]);

    // Check if version-specific snapshots exist for this version
    const [snapshotCheck] = await pool.query(
        'SELECT COUNT(*) as cnt FROM VersiePlaceholder WHERE versie_id = ?',
        [versie_id]
    );
    const hasSnapshots = snapshotCheck[0].cnt > 0;

    // Attach top-level flag so callers know whether data is historically accurate
    sections.__hasPlaceholderSnapshot = hasSnapshots;
    for (let section of sections) {
        let placeholders;

        if (hasSnapshots) {
            // Use version-specific snapshot values (accurate per-version diff)
            const [rows] = await pool.query(`
                SELECT 
                    pl.placeholder_id,
                    pl.sleutel as name,
                    pl.type,
                    p.pdf_label,
                    vp.ingevulde_waarde as value,
                    vp.validatiestatus as placeholder_validation_status,
                    -- Use metadata from snapshot if available, otherwise from Master table
                    COALESCE(vp.document_id, ap.document_id) as document_id,
                    COALESCE(vp.bron_text, ap.bron_text) as bron_text,
                    COALESCE(vp.pagina_nummer, ap.pagina_nummer) as pagina_nummer,
                    COALESCE(vp.coords_json, ap.coords_json) as coords_json,
                    COALESCE(d1.bestand_pad, d2.bestand_pad) as document_pad,
                    COALESCE(d1.bestandsnaam, d2.bestandsnaam) as document_naam
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN VersiePlaceholder vp
                    ON pl.placeholder_id = vp.placeholder_id
                    AND vp.versie_id = ?
                    AND vp.aangepaste_sectie_id = ?
                LEFT JOIN Aangepaste_Placeholder ap 
                    ON pl.placeholder_id = ap.placeholder_id 
                    AND ap.verkoopsovereenkomst_id = ?
                LEFT JOIN Documenten d1 ON vp.document_id = d1.document_id
                LEFT JOIN Documenten d2 ON ap.document_id = d2.document_id
                WHERE p.sectie_id = ?
            `, [versie_id, section.aangepaste_sectie_id, verkoopsovereenkomstId, section.sectie_id]);
            placeholders = rows; console.log(`[FETCH] Version ${versie_id} Section ${section.aangepaste_sectie_id} found ${rows.length} placeholders with snapshot. First metadata:`, rows[0] ? { name: rows[0].name, doc_id: rows[0].document_id } : 'none');
        } else {
            // Fallback: use global Aangepaste_Placeholder (older versions before snapshot feature)
            const [rows] = await pool.query(`
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
                    ap.coords_json,
                    d.bestand_pad as document_pad,
                    d.bestandsnaam as document_naam
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN Aangepaste_Placeholder ap ON pl.placeholder_id = ap.placeholder_id AND ap.verkoopsovereenkomst_id = ?
                LEFT JOIN Documenten d ON ap.document_id = d.document_id
                WHERE p.sectie_id = ?
            `, [verkoopsovereenkomstId, section.sectie_id]);
            placeholders = rows; console.log(`[FETCH] Version ${versie_id} Section ${section.aangepaste_sectie_id} found ${rows.length} placeholders in FALLBACK. First metadata:`, rows[0] ? { name: rows[0].name, doc_id: rows[0].document_id } : 'none');
        }

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
            documentNaam: p.document_naam || null,
            coords: p.coords_json ? (typeof p.coords_json === 'string' ? JSON.parse(p.coords_json) : p.coords_json) : null
        }));

        section.id = section.aangepaste_sectie_id.toString();
        section.content = section.tekst_inhoud;
        
        // Bugfix: ensure that a section is only considered approved if all of its evaluated placeholders are also approved.
        const allPlaceholdersApproved = section.placeholders.length === 0 || section.placeholders.every(p => p.isApproved);
        section.isApproved = (section.validatiestatus === 'approved') && allPlaceholdersApproved;
    }

    return sections;
};

const initializeVersionFromTemplate = async (versie_id, template_id, dossier_id, verkoopsovereenkomstId = null) => {
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
            const [existing] = await pool.query('SELECT 1 FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [verkoopsovereenkomstId, tp.placeholder_id]);
            if (existing.length > 0) {
                await pool.query(
                    'UPDATE Aangepaste_Placeholder SET aangepaste_sectie_id = ? WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [aangepasteSectieId, verkoopsovereenkomstId, tp.placeholder_id]
                );
            } else {
                await pool.query(
                    'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, verkoopsovereenkomst_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?, ?, ?)',
                    [dossier_id, tp.placeholder_id, verkoopsovereenkomstId, aangepasteSectieId, '', 'unverified']
                );
            }
        }
    }
};

const copyVersionContent = async (sourceVersionId, targetVersionId) => {
    const [oldSections] = await pool.query('SELECT * FROM VersieSectie WHERE versie_id = ?', [sourceVersionId]);
    for (const os of oldSections) {
        const [vsResult] = await pool.query(
            'INSERT INTO VersieSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
            [targetVersionId, os.sectie_id, os.tekst_inhoud, os.validatiestatus]
        );
        const newAangepasteSectieId = vsResult.insertId;

        // Copy placeholders snapshots too so the historical reference is preserved
        const [oldSnapshots] = await pool.query('SELECT * FROM VersiePlaceholder WHERE versie_id = ? AND aangepaste_sectie_id = ?', [sourceVersionId, os.aangepaste_sectie_id]);
        for (const snap of oldSnapshots) {
            await pool.query(
                `INSERT INTO VersiePlaceholder (versie_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer, coords_json)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [targetVersionId, snap.placeholder_id, newAangepasteSectieId, snap.ingevulde_waarde, snap.validatiestatus, snap.document_id, snap.bron_text, snap.pagina_nummer, snap.coords_json]
            );
        }
    }
};

const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null, paginaNummer = null, verkoopsovereenkomstId = null, coords = null) => {
    try {
        const [pDef] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ? LIMIT 1', [tag]);
        if (pDef.length === 0) return;
        
        const placeholderId = pDef[0].placeholder_id;
        const coordsStr = coords ? JSON.stringify(coords) : null;

        // 1. Update the global Master Data table (Aangepaste_Placeholder)
        const [existing] = await pool.query('SELECT 1 FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [verkoopsovereenkomstId, placeholderId]);
        if (existing.length > 0) {
            await pool.query(
                `UPDATE Aangepaste_Placeholder SET 
                  ingevulde_waarde = ?, 
                  validatiestatus = ?, 
                  document_id = COALESCE(?, document_id), 
                  bron_text = COALESCE(?, bron_text), 
                  pagina_nummer = COALESCE(?, pagina_nummer),
                  coords_json = COALESCE(?, coords_json)
                WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?`, 
                [value, 'unverified', documentId, bronText, paginaNummer, coordsStr, verkoopsovereenkomstId, placeholderId]
            );
        } else {
            await pool.query(
                'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, verkoopsovereenkomst_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer, coords_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                [dossierId, placeholderId, verkoopsovereenkomstId, value, 'unverified', documentId, bronText, paginaNummer, coordsStr]
            );
        }

        // 2. Also PROPGATE the findings to the CURRENT (active) version's snapshots if they exist
        // This ensures the user sees the latest AI data even if they've already saved a version.
        const [versionRows] = await pool.query(`
            SELECT v.versie_id 
            FROM Versie v 
            JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id
            WHERE vo.verkoopsovereenkomst_id = ? AND v.is_current = TRUE
        `, [verkoopsovereenkomstId]);

        if (versionRows.length > 0) {
            const currentVersieId = versionRows[0].versie_id;
            // Check if snapshots exist for this placeholder in the current version
            const [snapshotRows] = await pool.query('SELECT 1 FROM VersiePlaceholder WHERE versie_id = ? AND placeholder_id = ?', [currentVersieId, placeholderId]);
            if (snapshotRows.length > 0) {
                await pool.query(
                    `UPDATE VersiePlaceholder SET 
                      ingevulde_waarde = ?, 
                      document_id = COALESCE(?, document_id), 
                      bron_text = COALESCE(?, bron_text), 
                      pagina_nummer = COALESCE(?, pagina_nummer),
                      coords_json = COALESCE(?, coords_json)
                    WHERE versie_id = ? AND placeholder_id = ?`,
                    [value, documentId, bronText, paginaNummer, coordsStr, currentVersieId, placeholderId]
                );
            }
        }

        if (['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_street', 'property_municipality', 'property_address'].includes(tag)) {
            if (value && value.trim()) await pool.query('UPDATE Dossier SET adres = ? WHERE dossier_id = ?', [value, dossierId]);
        }
    } catch (err) { console.error('Error in syncDossierMasterData:', err); }
};

/**
 * Determines which fields are relevant for a given document based on its filename.
 * Returns a subset of tags and contexts, or all if no heuristic matches.
 */
const getTargetedFieldsForDocument = (filename, allTags, allContexts) => {
    const name = (filename || '').toLowerCase();
    
    // Keyword groups for targeted extraction
    const groups = [
        { keywords: ['verkoper', 'seller', 'vendeur', 'eigenaar'], pattern: /verkop|seller|vendeur|eigenaar|eigen/i },
        { keywords: ['koper', 'buyer', 'acheteur', 'acquéreur'], pattern: /koper|buyer|achet|acquér/i },
        { keywords: ['makelaar', 'agent', 'kantoor', 'office', 'immobilier', 'vastgoed'], pattern: /makelaar|agent|kantoor|office|immob|vastgoed|biv/i },
        { keywords: ['bodem', 'ovam', 'milieu', 'environment'], pattern: /bodem|ovam|milieu|environ|attest/i },
    ];

    for (const group of groups) {
        if (group.pattern.test(name)) {
            // Filter tags that match this group's domain OR are generic (don't contain other group keywords)
            const otherPatterns = groups.filter(g => g !== group).map(g => g.pattern);
            const filteredTags = [];
            const filteredContexts = [];
            
            for (let i = 0; i < allTags.length; i++) {
                const tag = allTags[i];
                const tagLower = tag.toLowerCase();
                // Include if the tag matches this group's pattern OR doesn't match any other group
                const matchesThisGroup = group.pattern.test(tagLower);
                const matchesOtherGroup = otherPatterns.some(p => p.test(tagLower));
                
                if (matchesThisGroup || !matchesOtherGroup) {
                    filteredTags.push(tag);
                    filteredContexts.push(allContexts[i]);
                }
            }
            
            if (filteredTags.length > 0 && filteredTags.length < allTags.length) {
                console.log(`[TARGETING] Document "${filename}" matched group, filtered ${allTags.length} → ${filteredTags.length} fields`);
                return { tags: filteredTags, contexts: filteredContexts };
            }
        }
    }
    
    // No heuristic match — send all fields
    return { tags: allTags, contexts: allContexts };
};

/**
 * Processes a single document file for AI extraction.
 * Returns { file, extractedData, fileMatchCount }
 */
const processSingleFile = async (file, tags, contexts, customPrompt, dossierId) => {
    const startTime = Date.now();
    dlog(`[AI] Processing file ${file.filename} / ${file.originalname} (mimetype: ${file.mimetype})`);
    
    let extractedData = null;
    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        dlog(`[AI] Processing ${file.mimetype === 'application/pdf' ? 'PDF' : 'IMAGE'} with Vision extraction: ${file.originalname}`);
        extractedData = await analyzeDocument(filePath, tags, customPrompt, contexts);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
        dlog(`[AI] Processing Word with text extraction: ${file.originalname}`);
        const text = await extractTextFromDOCX(filePath);
        if (text && text.trim().length > 0) {
            extractedData = await analyzeDocument(text, tags, customPrompt, contexts);
        }
    } else {
        dlog(`[AI] Unsupported mimetype: ${file.mimetype}`);
        return { file, extractedData: null, elapsed: Date.now() - startTime };
    }
    
    const elapsed = Date.now() - startTime;
    const valueCount = extractedData ? Object.values(extractedData).filter(v => v?.waarde && v.waarde.toString().trim()).length : 0;
    dlog(`[AI] Finished ${file.originalname} in ${elapsed}ms — ${valueCount} values extracted`);
    
    return { file, extractedData, elapsed, valueCount };
};

const processDossierDocuments = async (dossierId, files, customPrompt = null, templateId = null, verkoopsovereenkomstId = null) => {
    const totalStartTime = Date.now();
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
        const allTags = Object.keys(consolidatedMap);
        const allContexts = Object.values(consolidatedMap).map(ctx => ({ naam: ctx.name, type: ctx.type, label: Array.from(ctx.labels).join(', ') || ctx.name, sections: Array.from(ctx.sections).join(', ') || 'General' }));

        // Log start
        await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', 
            [dossierId, 'AI Analyse Gestart', `AI analyseert ${files.length} document(en) parallel...`, 'AI Assistent']);

        // Filter out unsupported files
        const supportedFiles = files.filter(f => 
            f.mimetype === 'application/pdf' || 
            f.mimetype.startsWith('image/') || 
            f.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            f.mimetype === 'application/msword'
        );

        // Process ALL documents in parallel with targeted fields per document
        const filePromises = supportedFiles.map(file => {
            const { tags, contexts } = getTargetedFieldsForDocument(file.originalname, allTags, allContexts);
            return processSingleFile(file, tags, contexts, customPrompt, dossierId);
        });

        const results = await Promise.allSettled(filePromises);

        // Merge results: combine extracted data, preferring first non-empty value per key
        let combinedExtractedData = {};
        for (const result of results) {
            if (result.status === 'rejected') {
                console.error(`[AI] File processing failed:`, result.reason?.message);
                continue;
            }
            const { file, extractedData, elapsed, valueCount } = result.value;
            if (!extractedData) continue;

            // Per-document timeline event
            await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', 
                [dossierId, `AI: ${file.originalname}`, `${valueCount || 0} velden geëxtraheerd in ${Math.round((elapsed || 0) / 1000)}s`, 'AI Assistent']);

            for (const [key, val] of Object.entries(extractedData)) {
                const isNewValSolid = val && typeof val === 'object' && val.waarde !== undefined && val.waarde.toString().trim() !== '';
                const isOldValEmpty = !combinedExtractedData[key] || !combinedExtractedData[key].waarde;

                if (isNewValSolid && isOldValEmpty) {
                    combinedExtractedData[key] = {
                        waarde: val.waarde,
                        bron_text: val.bron_text || null,
                        document_id: file.id || null,
                        pagina_nummer: val.pagina_nummer || null,
                        coords: val.coords || null
                    };
                } else if (isNewValSolid && !isOldValEmpty && val.coords) {
                    combinedExtractedData[key].coords = val.coords;
                    combinedExtractedData[key].document_id = file.id;
                    combinedExtractedData[key].bron_text = val.bron_text || combinedExtractedData[key].bron_text;
                } else if (typeof val === 'string' && val.trim() !== '' && isOldValEmpty) {
                    combinedExtractedData[key] = {
                        waarde: val,
                        bron_text: null,
                        document_id: file.id || null
                    };
                }
            }
        }

        // Sync all extracted values to the database
        let matchCount = 0;
        for (const [tag, data] of Object.entries(combinedExtractedData)) {
            if (data && data.waarde && data.waarde.toString().trim()) { 
                console.log(`AI extracted field [${tag}]: ${data.waarde}`);
                await syncDossierMasterData(dossierId, tag, data.waarde.toString(), data.document_id, data.bron_text, data.pagina_nummer, verkoopsovereenkomstId, data.coords); 
                matchCount++; 
            }
        }

        const totalElapsed = Math.round((Date.now() - totalStartTime) / 1000);
        await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', 
            [dossierId, 'AI Analyse Voltooid', `AI heeft ${files.length} documenten geanalyseerd in ${totalElapsed}s — ${matchCount} velden ingevuld.`, 'AI Assistent']);
        dlog(`[AI] Finished processDossierDocuments in ${totalElapsed}s with ${matchCount} matches`);
    } catch (error) {
        dlog(`[AI] ERROR in processDossierDocuments: ${error.message} - ${error.stack}`);
        console.error('Error in processDossierDocuments:', error);
        await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [dossierId, 'AI Analyse Fout', `Er is een fout opgetreden bij het verwerken van de documenten: ${error.message}`, 'Systeem']);
    }
};

const formatDateBE = (dateString) => {
    if (!dateString) return '';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleString('nl-BE', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        }).replace(',', ' -');
    } catch (e) {
        return dateString;
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
                date: formatDateBE(row.last_opened || row.last_modified || row.created_at),
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
                
                // Add timeline event for uploaded documents
                await pool.query(
                    'INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)',
                    [dossier_id, 'Documenten geüpload', `Er zijn ${req.files.length} document(en) succesvol aan het dossier toegevoegd.`, 'Systeem']
                );
            }
            if (template_id) {
                console.log("Initializing version from template:", template_id);
                // ... (rest of the block)
                const [voResult] = await pool.query('INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id) VALUES (?, ?, ?)', [`ouv-${Date.now()}`, dossier_id, template_id]);
                const [verResult] = await pool.query('INSERT INTO Versie (ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?)', [`ver-${Date.now()}`, voResult.insertId, '1.0', 'AI', true]);
                await initializeVersionFromTemplate(verResult.insertId, template_id, dossier_id);
            }

            // Trigger AI analysis if documents exist and we are also creating an agreement (template_id is provided)
            if (template_id) {
                console.log("Checking for uploaded documents to trigger AI analysis...");
                const [docRows] = await pool.query('SELECT * FROM Documenten WHERE dossier_id = ?', [dossier_id]);
                if (docRows.length > 0) {
                    const files = docRows.map(doc => ({
                        id: doc.document_id,
                        filename: doc.bestandsnaam,
                        originalname: doc.naam,
                        mimetype: doc.bestandstype
                    }));
                    console.log(`Triggering AI analysis for createDossier with ${files.length} files`);
                    await processDossierDocuments(dossier_id, files, ai_extraction_prompt || remarks || null, template_id);
                }
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
                    // Check if this version has placeholder snapshots (needed for compare page warning)
                    const [snapCheck] = await pool.query(
                        'SELECT COUNT(*) as cnt FROM VersiePlaceholder WHERE versie_id = ?',
                        [v.versie_id]
                    );
                    const hasPlaceholderSnapshot = snapCheck[0].cnt > 0;
                    const vo = { id: v.ui_id, number: v.versie_nummer, source: v.source, isCurrent: Boolean(v.is_current), isBookmarked: Boolean(v.is_bookmarked), date: formatDateBE(v.created_at), hasPlaceholderSnapshot };
                    if (v.is_current) vo.sections = await fetchFullVersionContent(v.versie_id);
                    return vo;
                }));
                return { id: agg.ui_id, templateId: agg.template_id, templateName: agg.template_name, versions };
            }));
            res.json({
                id: row.ui_id, name: row.titel, address: row.adres, verkoper_naam: row.verkoper_naam, date: formatDateBE(row.last_modified), creationDate: formatDateBE(row.created_at), status: row.status, type: row.type, remarks: row.remarks,
                agreements, timeline: timelineRows.map(t => ({ id: t.ui_id, date: formatDateBE(t.event_date), title: t.titel, description: t.beschrijving, user: t.user_name })),
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
            const sections = await fetchFullVersionContent(v.versie_id);
            v.sections = sections;
            // Expose whether placeholder values are historically accurate for this version
            v.hasPlaceholderSnapshot = sections.__hasPlaceholderSnapshot || false;
            const [aggRows] = await pool.query('SELECT dossier_id FROM Verkoopsovereenkomst WHERE verkoopsovereenkomst_id = ?', [v.verkoopsovereenkomst_id]);
            if (aggRows.length > 0) {
                const [docRows] = await pool.query('SELECT naam as name, bestand_pad as path FROM Documenten WHERE dossier_id = ?', [aggRows[0].dossier_id]);
                v.dossier_documents = docRows;
                const [dosRows] = await pool.query('SELECT ui_id, status FROM Dossier WHERE dossier_id = ?', [aggRows[0].dossier_id]);
                if (dosRows.length > 0) {
                    v.dossier_ui_id = dosRows[0].ui_id;
                    v.dossier_status = dosRows[0].status;
                }
            }
            res.json(v);
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    updateVersion: async (req, res) => {
        const { id } = req.params;
        const sections = Array.isArray(req.body) ? req.body : req.body.sections;
        try {
            const [verRows] = await pool.query('SELECT versie_id, verkoopsovereenkomst_id, versie_nummer FROM Versie WHERE ui_id = ?', [id]);
            if (verRows.length === 0) return res.status(404).json({ error: 'Versie niet gevonden' });
            
            const ver = verRows[0];
            const verkoopsovereenkomstId = ver.verkoopsovereenkomst_id;
            const [aggRows] = await pool.query('SELECT dossier_id FROM Verkoopsovereenkomst WHERE verkoopsovereenkomst_id = ?', [ver.verkoopsovereenkomst_id]);
            const dossierId = aggRows[0]?.dossier_id;
            
            // Get highest version number for this agreement
            const [maxVerRows] = await pool.query('SELECT versie_nummer FROM Versie WHERE verkoopsovereenkomst_id = ? ORDER BY created_at DESC LIMIT 1', [ver.verkoopsovereenkomst_id]);
            let baseNum = "1.0";
            if (maxVerRows.length > 0) baseNum = maxVerRows[0].versie_nummer || "1.0";
            
            // Generate next minor version number
            const parts = baseNum.split('.');
            let nextNum = parts[0] + '.' + (parseInt(parts[1] || 0) + 1);

            // Create new version
            const new_ui_id = 'ver-' + Date.now();
            await pool.query('UPDATE Versie SET is_current = FALSE WHERE verkoopsovereenkomst_id = ?', [ver.verkoopsovereenkomst_id]);
            const [vResult] = await pool.query('INSERT INTO Versie(ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES(?, ?, ?, ?, ?)', [new_ui_id, ver.verkoopsovereenkomst_id, nextNum, 'Save', true]);
            const newVersieId = vResult.insertId;

            // Pre-scan all sections to collect the best available metadata for each unique placeholder
            const metadataMap = {};
            for (const s of (sections || [])) {
                for (const p of (s.placeholders || [])) {
                    if (p.documentId && !metadataMap[p.id]) {
                        metadataMap[p.id] = {
                            documentId: p.documentId,
                            bronText: p.bronText || p.bron_text,
                            paginaNummer: p.paginaNummer || p.pagina_nummer,
                            coords: p.coords
                        };
                    }
                }
            }

            for (const s of (sections || [])) {
                let sectieId = s.sectie_id || null;
                if (!sectieId && s.id && !isNaN(parseInt(s.id))) {
                    const [vsRows] = await pool.query('SELECT sectie_id FROM VersieSectie WHERE aangepaste_sectie_id = ?', [s.id]);
                    if (vsRows.length > 0) sectieId = vsRows[0].sectie_id;
                }
                
                const [sectieResult] = await pool.query('INSERT INTO VersieSectie(versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES(?, ?, ?, ?)', [newVersieId, sectieId, s.content, s.isApproved ? 'approved' : 'pending']);
                const newAangepasteSectieId = sectieResult.insertId;

                                for (const p of (s.placeholders || [])) {
                    // DIAGNOSTIC LOG
                                                            const [pRows] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ?', [p.id]);
                    if (pRows.length > 0) {
                        const placeholderId = pRows[0].placeholder_id;
                        const placeholderStatus = p.isApproved ? 'approved' : 'pending';
                        
                        const bestMeta = metadataMap[p.id] || {};
                        let docId = p.documentId || p.document_id || bestMeta.documentId || null;
                        let bronText = p.bronText || p.bron_text || bestMeta.bronText || null;
                        let paginaNummer = p.paginaNummer || p.pagina_nummer || bestMeta.paginaNummer || null;
                        let coords = p.coords || bestMeta.coords || null;
                        const coordsStr = coords ? JSON.stringify(coords) : null;

                        if (!docId || !bronText) {
                            const [existRows] = await pool.query('SELECT document_id, bron_text, pagina_nummer, coords_json FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [verkoopsovereenkomstId, placeholderId]);
                            if (existRows.length > 0) {
                                docId = docId || existRows[0].document_id;
                                bronText = bronText || existRows[0].bron_text;
                                paginaNummer = paginaNummer !== null ? paginaNummer : existRows[0].pagina_nummer;
                                if (!coordsStr && existRows[0].coords_json) {
                                    coords = existRows[0].coords_json;
                                }
                            }
                        }
                        
                        // Properly recalculate coordsStr with the potentially fetched DB value
                        const finalCoordsStr = coords ? (typeof coords === 'string' ? coords : JSON.stringify(coords)) : null;

                        console.log(`[updateVersion] Placeholder ${p.id} docId=${docId} (from p.documentId=${p.documentId}) coordsStr=${finalCoordsStr}`);

                        // Update the global current value (used by the Editor)
                        await pool.query(
                            `INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, verkoopsovereenkomst_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer, coords_json)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE
                               ingevulde_waarde = VALUES(ingevulde_waarde),
                               validatiestatus = VALUES(validatiestatus),
                               aangepaste_sectie_id = VALUES(aangepaste_sectie_id),
                                document_id = COALESCE(VALUES(document_id), document_id),
                                bron_text = COALESCE(VALUES(bron_text), bron_text),
                                pagina_nummer = COALESCE(VALUES(pagina_nummer), pagina_nummer),
                                coords_json = COALESCE(VALUES(coords_json), coords_json)`,
                            [dossierId, placeholderId, verkoopsovereenkomstId, newAangepasteSectieId, p.currentValue, placeholderStatus, docId, bronText, paginaNummer, finalCoordsStr]
                        );

                        // Write a version-specific snapshot so the diff feature can compare values across versions
                        await pool.query(
                            `INSERT INTO VersiePlaceholder (versie_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer, coords_json)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE
                                ingevulde_waarde = VALUES(ingevulde_waarde),
                                validatiestatus = VALUES(validatiestatus),
                                aangepaste_sectie_id = VALUES(aangepaste_sectie_id),
                                document_id = COALESCE(VALUES(document_id), document_id),
                                bron_text = COALESCE(VALUES(bron_text), bron_text),
                                pagina_nummer = COALESCE(VALUES(pagina_nummer), pagina_nummer),
                                coords_json = COALESCE(VALUES(coords_json), coords_json)`,
                            [newVersieId, placeholderId, newAangepasteSectieId, p.currentValue, placeholderStatus, docId, bronText, paginaNummer, finalCoordsStr]
                        );
                    }
                }
            }

            // Timeline event
            const userName = req.user ? (req.user.naam || req.user.email) : 'Auteur';
            
            // Note: Ideal implementation would extract language from request but since it's hard to refactor all routes, we use generic info
            const timestamp = new Date().toLocaleString('nl-BE', { hour: '2-digit', minute: '2-digit', hour12: false });
            await pool.query('INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name) VALUES (?, ?, ?, ?)', [
                dossierId, 
                "Document handmatig opgeslagen / Document saved", 
                `Versie ${nextNum} werd opgeslagen en als historiek geregistreerd. / Version ${nextNum} saved to history.`, 
                userName || 'Gebruiker'
            ]);

            res.json({ message: 'Nieuwe versie aangemaakt bij opslaan', new_ui_id });
        } catch (error) { 
            console.error(error); 
            res.status(500).json({ error: error.message }); 
        }
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
            await initializeVersionFromTemplate(vResult.insertId, req.body.template_id, dosRows[0].dossier_id, voResult.insertId);
            
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
                await processDossierDocuments(dosRows[0].dossier_id, files, req.body.remarks || null, req.body.template_id, voResult.insertId);
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
                await initializeVersionFromTemplate(vResult.insertId, aggRows[0].template_id, aggRows[0].dossier_id, aggRows[0].verkoopsovereenkomst_id);
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
                await processDossierDocuments(aggRows[0].dossier_id, files, remarks, aggRows[0].template_id, aggRows[0].verkoopsovereenkomst_id);
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
            await pool.query('UPDATE Versie SET source = ? WHERE ui_id = ? OR versie_id = ?', [req.body.name, id, isNaN(id) ? -1 : id]); 
            res.json({ message: 'Versie label aangepast' }); 
        }
        catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    toggleVersionBookmark: async (req, res) => {
        try {
            const id = req.params.id;
            const { isBookmarked } = req.body;
            await pool.query('UPDATE Versie SET is_bookmarked = ? WHERE ui_id = ? OR versie_id = ?', [isBookmarked ? 1 : 0, id, isNaN(id) ? -1 : id]);
            res.json({ message: 'Bookmark status aangepast' });
        } catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
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
        try { 
            for (const item of (req.body.orders || [])) {
                await pool.query(
                    'UPDATE Dossier SET display_order = ?, status = COALESCE(?, status) WHERE ui_id = ?', 
                    [item.order, item.status, item.id]
                );
            } 
            res.json({ message: 'Reordered and status updated' }); 
        }
        catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
    },

    reAnalyzeDossier: async (req, res) => {
        try {
            const { id } = req.params;
            const [dRows] = await pool.query('SELECT dossier_id, template_id, account_id FROM Dossier WHERE ui_id = ? OR dossier_id = ?', [id, isNaN(id) ? -1 : id]);
            if (dRows.length === 0) return res.status(404).json({ error: 'Dossier niet gevonden' });
            
            const dossier_id = dRows[0].dossier_id;
            const template_id = dRows[0].template_id;

            // Fetch current agreement for this dossier to sync with
            const [agRows] = await pool.query('SELECT verkoopsovereenkomst_id FROM Verkoopsovereenkomst WHERE dossier_id = ?', [dossier_id]);
            const verkoopsovereenkomst_id = agRows.length > 0 ? agRows[0].verkoopsovereenkomst_id : null;

            // Fetch documents
            const [docRows] = await pool.query('SELECT document_id as id, bestandsnaam as filename, naam as originalname, bestandstype as mimetype FROM Documenten WHERE dossier_id = ?', [dossier_id]);

            if (docRows.length === 0) {
                return res.status(400).json({ error: 'Geen documenten gevonden in dit dossier om te analyseren.' });
            }

            // Fetch user prompts if available
            const [uRows] = await pool.query('SELECT custom_document_prompt FROM Account WHERE account_id = ?', [dRows[0].account_id]);
            const customPrompt = uRows.length > 0 ? uRows[0].custom_document_prompt : null;

            // Start processing (async - don't await the whole thing for the response)
            console.log(`Manually triggering AI re-analysis for dossier ${dossier_id} with ${docRows.length} files`);
            processDossierDocuments(dossier_id, docRows, customPrompt, template_id, verkoopsovereenkomst_id);

            res.json({ message: 'AI Analyse is gestart. Het systeem verwerkt nu alle documenten (inclusief afbeeldingen) opnieuw.' });
        } catch (error) {
            console.error('reAnalyzeDossier error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    processDossierDocuments
};

module.exports = dossierController;
