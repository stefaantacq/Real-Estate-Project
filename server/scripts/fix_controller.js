const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

const q1_old = '`INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus)';
const q1_new = '`INSERT INTO Aangepaste_Placeholder (dossier_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer)';

const q2_old = '`INSERT INTO VersiePlaceholder (versie_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus)';
const q2_new = '`INSERT INTO VersiePlaceholder (versie_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer)';

const val_old = 'VALUES (?, ?, ?, ?, ?)';
const val_new = 'VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

const dup_old = 'aangepaste_sectie_id = VALUES(aangepaste_sectie_id)`';
const dup_new = 'aangepaste_sectie_id = VALUES(aangepaste_sectie_id),\\n                                document_id = VALUES(document_id),\\n                                bron_text = VALUES(bron_text),\\n                                pagina_nummer = VALUES(pagina_nummer)`';

const args1_old = '[dossierId, placeholderId, newAangepasteSectieId, p.currentValue, placeholderStatus]';
const args1_new = '[dossierId, placeholderId, newAangepasteSectieId, p.currentValue, placeholderStatus, docId, bronText, paginaNummer]';

const args2_old = '[newVersieId, placeholderId, newAangepasteSectieId, p.currentValue, placeholderStatus]';
const args2_new = '[newVersieId, placeholderId, newAangepasteSectieId, p.currentValue, placeholderStatus, docId, bronText, paginaNummer]';

// Simple direct replacements
content = content.replace(q1_old, q1_new);
content = content.replace(q2_old, q2_new);
// Use regex for multiple occurrences of VALUES (?, ?, ?, ?, ?)
content = content.replace(new RegExp('VALUES \\(\\?, \\?, \\?, \\?, \\?\\)', 'g'), val_new);
// Be very careful with the backtick in dup_old
content = content.replace(/aangepaste_sectie_id = VALUES\(aangepaste_sectie_id\)`/g, (match) => {
    return 'aangepaste_sectie_id = VALUES(aangepaste_sectie_id),\n                                document_id = VALUES(document_id),\n                                bron_text = VALUES(bron_text),\n                                pagina_nummer = VALUES(pagina_nummer)`';
});
content = content.replace(args1_old, args1_new);
content = content.replace(args2_old, args2_new);

fs.writeFileSync(path, content);
console.log('Done.');
