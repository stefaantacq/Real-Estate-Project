const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update fetchFullVersionContent
const oldFetchQuery = `        SELECT vo.dossier_id 
        FROM Versie v 
        JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id 
        WHERE v.versie_id = ?`;

const newFetchQuery = `        SELECT vo.dossier_id, vo.verkoopsovereenkomst_id
        FROM Versie v 
        JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id 
        WHERE v.versie_id = ?`;

content = content.replace(oldFetchQuery, newFetchQuery);

// Add the verkoopsovereenkomstId variable
content = content.replace('const dossierId = verRows[0].dossier_id;', 'const dossierId = verRows[0].dossier_id;\n    const verkoopsovereenkomstId = verRows[0].verkoopsovereenkomst_id;');

// Update the snapshot query inside fetchFullVersionContent with COALESCE fallbacks
const oldSnapshotSelect = `                SELECT 
                    pl.placeholder_id,
                    pl.sleutel as name,
                    pl.type,
                    p.pdf_label,
                    vp.ingevulde_waarde as value,
                    vp.validatiestatus as placeholder_validation_status,
                    vp.document_id,
                    vp.bron_text,
                    vp.pagina_nummer,
                    d.bestand_pad as document_pad,
                    d.bestandsnaam as document_naam
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN VersiePlaceholder vp
                    ON pl.placeholder_id = vp.placeholder_id
                    AND vp.versie_id = ?
                    AND vp.aangepaste_sectie_id = ?
                LEFT JOIN Documenten d ON vp.document_id = d.document_id
                WHERE p.sectie_id = ?`;

const newSnapshotSelect = `                SELECT 
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
                WHERE p.sectie_id = ?`;

content = content.replace(oldSnapshotSelect, newSnapshotSelect);
content = content.replace('`, [versie_id, section.aangepaste_sectie_id, section.sectie_id]);', '`, [versie_id, section.aangepaste_sectie_id, verkoopsovereenkomstId, section.sectie_id]);');

// Update the non-snapshot fallback query
const oldFallbackSelect = `                LEFT JOIN Aangepaste_Placeholder ap ON pl.placeholder_id = ap.placeholder_id AND ap.dossier_id = ?`;
const newFallbackSelect = `                LEFT JOIN Aangepaste_Placeholder ap ON pl.placeholder_id = ap.placeholder_id AND ap.verkoopsovereenkomst_id = ?`;
content = content.replace(oldFallbackSelect, newFallbackSelect);
content = content.replace('`, [dossierId, section.sectie_id]);', '`, [verkoopsovereenkomstId, section.sectie_id]);');

// 2. Update initializeVersionFromTemplate to use verkoopsovereenkomst_id
content = content.replace('const initializeVersionFromTemplate = async (versie_id, template_id, dossier_id) => {', 'const initializeVersionFromTemplate = async (versie_id, template_id, dossier_id, verkoopsovereenkomstId = null) => {');
content = content.replace(/FROM Aangepaste_Placeholder WHERE dossier_id = \? AND placeholder_id = \?/g, 'FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?');
content = content.replace(/WHERE dossier_id = \? AND placeholder_id = \?\'\,\n\s+\[aangepasteSectieId, dossier_id, tp.placeholder_id\]/g, "WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [aangepasteSectieId, verkoopsovereenkomstId, tp.placeholder_id]");
content = content.replace(/INSERT INTO Aangepaste_Placeholder \(dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus\) VALUES \(\?, \?, \?, \?, \?\)/g, 'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, verkoopsovereenkomst_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?, ?, ?)');
content = content.replace(/\[dossier_id, tp.placeholder_id, aangepasteSectieId, \'\', \'unverified\'\]/g, "[dossier_id, tp.placeholder_id, verkoopsovereenkomstId, aangepasteSectieId, '', 'unverified']");

// Update calls to initializeVersionFromTemplate
content = content.replace(/await initializeVersionFromTemplate\(vResult.insertId, req.body.template_id, dosRows\[0\].dossier_id\);/g, 'await initializeVersionFromTemplate(vResult.insertId, req.body.template_id, dosRows[0].dossier_id, voResult.insertId);');
content = content.replace(/await initializeVersionFromTemplate\(vResult.insertId, aggRows\[0\].template_id, aggRows\[0\].dossier_id\);/g, 'await initializeVersionFromTemplate(vResult.insertId, aggRows[0].template_id, aggRows[0].dossier_id, aggRows[0].verkoopsovereenkomst_id);');

// 3. Update updateVersion
content = content.replace('const ver = verRows[0];', 'const ver = verRows[0];\n            const verkoopsovereenkomstId = ver.verkoopsovereenkomst_id;');
content = content.replace(/INSERT INTO Aangepaste_Placeholder \(dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus,/g, 'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, verkoopsovereenkomst_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus,');
content = content.replace(/VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)/g, 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
content = content.replace(/\[dossierId, placeholderId, newAangepasteSectieId, p.currentValue, placeholderStatus,/g, '[dossierId, placeholderId, verkoopsovereenkomstId, newAangepasteSectieId, p.currentValue, placeholderStatus,');

// 4. Update syncDossierMasterData
content = content.replace('const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null, paginaNummer = null) => {', 'const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null, paginaNummer = null, verkoopsovereenkomstId = null) => {');
content = content.replace(/FROM Aangepaste_Placeholder WHERE dossier_id = \? AND placeholder_id = \?/g, 'FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?');
content = content.replace(/WHERE dossier_id = \? AND placeholder_id = \?\'\, \n                \[value, \'unverified\', documentId, bronText, paginaNummer, dossierId, placeholderId\]/g, "WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [value, 'unverified', documentId, bronText, paginaNummer, verkoopsovereenkomstId, placeholderId]");
content = content.replace(/INSERT INTO Aangepaste_Placeholder \(dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer\) VALUES \(\?, \?, \?, \?, \?, \?, \?\)/g, 'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, verkoopsovereenkomst_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
content = content.replace(/\[dossierId, placeholderId, value, \'unverified\', documentId, bronText, paginaNummer\]/g, '[dossierId, placeholderId, verkoopsovereenkomstId, value, \'unverified\', documentId, bronText, paginaNummer]');

// Update propagation logic in syncDossierMasterData to use the specific agreement
content = content.replace(/WHERE vo.dossier_id = \? AND v.is_current = TRUE/g, 'WHERE vo.verkoopsovereenkomst_id = ? AND v.is_current = TRUE');
content = content.replace(/\[dossierId\]/g, '[verkoopsovereenkomstId]');

// 5. Update processDossierDocuments
content = content.replace('const processDossierDocuments = async (dossierId, files, customPrompt = null, templateId = null) => {', 'const processDossierDocuments = async (dossierId, files, customPrompt = null, templateId = null, verkoopsovereenkomstId = null) => {');
content = content.replace('await syncDossierMasterData(dossierId, tag, data.waarde.toString(), data.document_id, data.bron_text, data.pagina_nummer);', 'await syncDossierMasterData(dossierId, tag, data.waarde.toString(), data.document_id, data.bron_text, data.pagina_nummer, verkoopsovereenkomstId);');

// Update calls to processDossierDocuments
content = content.replace(/await processDossierDocuments\(dosRows\[0\].dossier_id, files, req.body.remarks \|\| null, req.body.template_id\);/g, 'await processDossierDocuments(dosRows[0].dossier_id, files, req.body.remarks || null, req.body.template_id, voResult.insertId);');
content = content.replace(/await processDossierDocuments\(aggRows\[0\].dossier_id, files, remarks, aggRows\[0\].template_id\);/g, 'await processDossierDocuments(aggRows[0].dossier_id, files, remarks, aggRows[0].template_id, aggRows[0].verkoopsovereenkomst_id);');

fs.writeFileSync(path, content);
console.log('Successfully completed full isolation and metadata fix.');
