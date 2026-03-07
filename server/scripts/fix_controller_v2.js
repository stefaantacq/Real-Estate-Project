const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: initializeVersionFromTemplate mismatched columns
const badInit = "INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',\\n\\s+\\[dossierId, tp.placeholder_id, aangepasteSectieId, '', 'unverified'\\]";
const goodInit = "INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus) VALUES (?, ?, ?, ?, ?)',\\n                    [dossierId, tp.placeholder_id, aangepasteSectieId, '', 'unverified']";

// Fix 2: syncDossierMasterData add pagina_nummer
const oldSyncUpdate = 'UPDATE Aangepaste_Placeholder SET ingevulde_waarde = \\?, validatiestatus = \\?, document_id = \\?, bron_text = \\? WHERE dossier_id = \\? AND placeholder_id = \\?';
const newSyncUpdate = 'UPDATE Aangepaste_Placeholder SET ingevulde_waarde = ?, validatiestatus = ?, document_id = ?, bron_text = ?, pagina_nummer = ? WHERE dossier_id = ? AND placeholder_id = ?';

const oldSyncInsert = 'INSERT INTO Aangepaste_Placeholder \\(dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text\\) VALUES \\(\\?, \\?, \\?, \\?, \\?, \\?\\)';
const newSyncInsert = 'INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer) VALUES (?, ?, ?, ?, ?, ?, ?)';

// Replacement logic
content = content.replace(new RegExp(badInit), goodInit);
content = content.replace(new RegExp(oldSyncUpdate), newSyncUpdate);
content = content.replace(new RegExp(oldSyncInsert), newSyncInsert);

// Also need to update the argument arrays for syncDossierMasterData
content = content.replace('\\[value, \'unverified\', documentId, bronText, dossierId, placeholderId\\]', '[value, \'unverified\', documentId, bronText, null, dossierId, placeholderId]');
content = content.replace('\\[dossierId, placeholderId, value, \'unverified\', documentId, bronText\\]', '[dossierId, placeholderId, value, \'unverified\', documentId, bronText, null]');

fs.writeFileSync(path, content);
console.log('Second fix applied.');
