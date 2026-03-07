const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// Fix the typo in initializeVersionFromTemplate where dossier_id was passed instead of verkoopsovereenkomstId
content = content.replace(
    'const [existing] = await pool.query(\'SELECT 1 FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?\', [dossier_id, tp.placeholder_id]);',
    'const [existing] = await pool.query(\'SELECT 1 FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?\', [verkoopsovereenkomstId, tp.placeholder_id]);'
);

// Fix the typo in syncDossierMasterData where dossierId was passed instead of verkoopsovereenkomstId
content = content.replace(
    'const [existing] = await pool.query(\'SELECT 1 FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?\', [dossierId, placeholderId]);',
    'const [existing] = await pool.query(\'SELECT 1 FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?\', [verkoopsovereenkomstId, placeholderId]);'
);

// Also check the UPDATE in syncDossierMasterData
content = content.replace(
    "WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [value, 'unverified', documentId, bronText, paginaNummer, verkoopsovereenkomstId, placeholderId]",
    "WHERE verkoopsovereenkomst_id = ? AND placeholder_id = ?', [value, 'unverified', documentId, bronText, paginaNummer, verkoopsovereenkomstId, placeholderId]"
); // Actually it looks okay but let's be sure about the variable names.

// One more check on initializeVersionFromTemplate INSERT
content = content.replace(
    "[dossier_id, tp.placeholder_id, verkoopsovereenkomstId, aangepasteSectieId, '', 'unverified']",
    "[dossier_id, tp.placeholder_id, verkoopsovereenkomstId, aangepasteSectieId, '', 'unverified']"
);

fs.writeFileSync(path, content);
console.log('Final typo fixes applied.');
