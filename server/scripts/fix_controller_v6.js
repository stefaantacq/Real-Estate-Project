const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update syncDossierMasterData to track pagina_nummer
const oldSyncData = 'const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null) => {';
const newSyncData = 'const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null, paginaNummer = null) => {';
content = content.replace(oldSyncData, newSyncData);

// Update calls to syncDossierMasterData inside its own implementation (UPDATE/INSERT)
content = content.replace(/pagina_nummer = \? WHERE dossier_id = \? AND placeholder_id = \?',\s+\[value, 'unverified', documentId, bronText, null, dossierId, placeholderId\]/g, "pagina_nummer = ? WHERE dossier_id = ? AND placeholder_id = ?', [value, 'unverified', documentId, bronText, paginaNummer, dossierId, placeholderId]");
content = content.replace(/document_id, bron_text, pagina_nummer\) VALUES \(\?, \?, \?, \?, \?, \?, \?\)',\s+\[dossierId, placeholderId, value, 'unverified', documentId, bronText, null\]/g, "document_id, bron_text, pagina_nummer) VALUES (?, ?, ?, ?, ?, ?, ?)', [dossierId, placeholderId, value, 'unverified', documentId, bronText, paginaNummer]");

// 2. Update processDossierDocuments to extract and pass pagina_nummer
const oldProcessLoop = `                    if (val && typeof val === 'object' && val.waarde !== undefined && val.waarde !== '') {
                        combinedExtractedData[key] = {
                            waarde: val.waarde,
                            bron_text: val.bron_text || null,
                            document_id: file.id || null
                        };`;
const newProcessLoop = `                    if (val && typeof val === 'object' && val.waarde !== undefined && val.waarde !== '') {
                        combinedExtractedData[key] = {
                            waarde: val.waarde,
                            bron_text: val.bron_text || null,
                            document_id: file.id || null,
                            pagina_nummer: val.pagina_nummer || null
                        };`;

content = content.replace(oldProcessLoop, newProcessLoop);

const oldSyncCall = 'await syncDossierMasterData(dossierId, tag, data.waarde.toString(), data.document_id, data.bron_text);';
const newSyncCall = 'await syncDossierMasterData(dossierId, tag, data.waarde.toString(), data.document_id, data.bron_text, data.pagina_nummer);';
content = content.replace(oldSyncCall, newSyncCall);

// 3. Update copyVersionContent to also copy placeholders
const oldCopy = `const copyVersionContent = async (sourceVersionId, targetVersionId) => {
    const [oldSections] = await pool.query('SELECT * FROM VersieSectie WHERE versie_id = ?', [sourceVersionId]);
    for (const os of oldSections) {
        await pool.query(
            'INSERT INTO VersieSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
            [targetVersionId, os.sectie_id, os.tekst_inhoud, os.validatiestatus]
        );
    }
};`;

const newCopy = `const copyVersionContent = async (sourceVersionId, targetVersionId) => {
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
                \`INSERT INTO VersiePlaceholder (versie_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`,
                [targetVersionId, snap.placeholder_id, newAangepasteSectieId, snap.ingevulde_waarde, snap.validatiestatus, snap.document_id, snap.bron_text, snap.pagina_nummer]
            );
        }
    }
};`;

content = content.replace(oldCopy, newCopy);

fs.writeFileSync(path, content);
console.log('Controller updated for full consistency.');
