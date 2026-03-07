const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// Fix the initializeVersionFromTemplate mismatched columns (5 columns, 8 placeholders)
const oldInitStr = "INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',\n                    [dossierId, tp.placeholder_id, aangepasteSectieId, '', 'unverified']";
const newInitStr = "INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?, ?)',\n                    [dossierId, tp.placeholder_id, aangepasteSectieId, '', 'unverified']";

if (content.includes(oldInitStr)) {
    content = content.replace(oldInitStr, newInitStr);
    console.log('Fixed initializeVersionFromTemplate.');
} else {
    console.log('Did not find init pattern.');
}

// Fix syncDossierMasterData to include pagina_nummer (null fallback)
const oldSyncUpdate = 'UPDATE Aangepaste_Placeholder SET ingevulde_waarde = ?, validatiestatus = ?, document_id = ?, bron_text = ? WHERE dossier_id = ? AND placeholder_id = ?';
const newSyncUpdate = 'UPDATE Aangepaste_Placeholder SET ingevulde_waarde = ?, validatiestatus = ?, document_id = ?, bron_text = ?, pagina_nummer = ? WHERE dossier_id = ? AND placeholder_id = ?';

const oldSyncInsert = 'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text) VALUES (?, ?, ?, ?, ?, ?)';
const newSyncInsert = 'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer) VALUES (?, ?, ?, ?, ?, ?, ?)';

content = content.replace(oldSyncUpdate, newSyncUpdate);
content = content.replace(oldSyncInsert, newSyncInsert);
content = content.replace("[value, 'unverified', documentId, bronText, dossierId, placeholderId]", "[value, 'unverified', documentId, bronText, null, dossierId, placeholderId]");
content = content.replace("[dossierId, placeholderId, value, 'unverified', documentId, bronText]", "[dossierId, placeholderId, value, 'unverified', documentId, bronText, null]");

fs.writeFileSync(path, content);
console.log('Finished.');
