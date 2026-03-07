const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

const oldSyncBody = `const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null, paginaNummer = null) => {
    try {
        const [pDef] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ? LIMIT 1', [tag]);
        if (pDef.length > 0) {
            const placeholderId = pDef[0].placeholder_id;
            const [existing] = await pool.query('SELECT 1 FROM Aangepaste_Placeholder WHERE dossier_id = ? AND placeholder_id = ?', [dossierId, placeholderId]);
            if (existing.length > 0) {
                await pool.query(
                    'UPDATE Aangepaste_Placeholder SET ingevulde_waarde = ?, validatiestatus = ?, document_id = ?, bron_text = ?, pagina_nummer = ? WHERE dossier_id = ? AND placeholder_id = ?', [value, 'unverified', documentId, bronText, paginaNummer, dossierId, placeholderId]
                );
            } else {
                await pool.query(
                    'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer) VALUES (?, ?, ?, ?, ?, ?, ?)', [dossierId, placeholderId, value, 'unverified', documentId, bronText, paginaNummer]
                );
            }
        }
        if (['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_street', 'property_municipality', 'property_address'].includes(tag)) {
            if (value && value.trim()) await pool.query('UPDATE Dossier SET adres = ? WHERE dossier_id = ?', [value, dossierId]);
        }
    } catch (err) { console.error('Error in syncDossierMasterData:', err); }
};`;

const newSyncBody = `const syncDossierMasterData = async (dossierId, tag, value, documentId = null, bronText = null, paginaNummer = null) => {
    try {
        const [pDef] = await pool.query('SELECT placeholder_id FROM Placeholder_Library WHERE sleutel = ? LIMIT 1', [tag]);
        if (pDef.length === 0) return;
        
        const placeholderId = pDef[0].placeholder_id;

        // 1. Update the global Master Data table (Aangepaste_Placeholder)
        const [existing] = await pool.query('SELECT 1 FROM Aangepaste_Placeholder WHERE dossier_id = ? AND placeholder_id = ?', [dossierId, placeholderId]);
        if (existing.length > 0) {
            await pool.query(
                'UPDATE Aangepaste_Placeholder SET ingevulde_waarde = ?, validatiestatus = ?, document_id = ?, bron_text = ?, pagina_nummer = ? WHERE dossier_id = ? AND placeholder_id = ?', 
                [value, 'unverified', documentId, bronText, paginaNummer, dossierId, placeholderId]
            );
        } else {
            await pool.query(
                'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                [dossierId, placeholderId, value, 'unverified', documentId, bronText, paginaNummer]
            );
        }

        // 2. Also PROPGATE the findings to the CURRENT (active) version's snapshots if they exist
        // This ensures the user sees the latest AI data even if they've already saved a version.
        const [versionRows] = await pool.query(\`
            SELECT v.versie_id 
            FROM Versie v 
            JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id
            WHERE vo.dossier_id = ? AND v.is_current = TRUE
        \`, [dossierId]);

        if (versionRows.length > 0) {
            const currentVersieId = versionRows[0].versie_id;
            // Check if snapshots exist for this placeholder in the current version
            const [snapshotRows] = await pool.query('SELECT 1 FROM VersiePlaceholder WHERE versie_id = ? AND placeholder_id = ?', [currentVersieId, placeholderId]);
            if (snapshotRows.length > 0) {
                await pool.query(
                    'UPDATE VersiePlaceholder SET ingevulde_waarde = ?, document_id = ?, bron_text = ?, pagina_nummer = ? WHERE versie_id = ? AND placeholder_id = ?',
                    [value, documentId, bronText, paginaNummer, currentVersieId, placeholderId]
                );
            }
        }

        if (['adres_eigendom', 'ligging', 'ligging_eigendom', 'ObjectAdres', 'property_street', 'property_municipality', 'property_address'].includes(tag)) {
            if (value && value.trim()) await pool.query('UPDATE Dossier SET adres = ? WHERE dossier_id = ?', [value, dossierId]);
        }
    } catch (err) { console.error('Error in syncDossierMasterData:', err); }
};`;

content = content.replace(oldSyncBody, newSyncBody);

fs.writeFileSync(path, content);
console.log('Controller synchronized.');
