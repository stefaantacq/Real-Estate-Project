const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Versie INSERT has 8 placeholders but only 5 columns in two places
const qOld = "INSERT INTO Versie (ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
const qNew = "INSERT INTO Versie (ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES (?, ?, ?, ?, ?)";

content = content.replace(new RegExp('INSERT INTO Versie \\(ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current\\) VALUES \\(\\?, \\?, \\?, \\?, \\?, \\?, \\?, \\?\\)', 'g'), qNew);

// Fix 2: Add logging to updateVersion to see the incoming documentId format
const logInject = "                for (const p of (s.placeholders || [])) {\n                    // DIAGNOSTIC LOG\n                    require('fs').appendFileSync('body_debug.log', `PH: ${p.id} | docId: ${p.documentId} | doc_id: ${p.document_id}\\n`);";
content = content.replace('for (const p of (s.placeholders || [])) {', logInject);

fs.writeFileSync(path, content);
console.log('Fixed Versie queries and added diagnostic logging.');
