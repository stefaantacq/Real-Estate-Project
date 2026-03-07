const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// Add more debug to fallback mode
content = content.replace(
    'placeholders = rows;\n        }',
    "placeholders = rows; console.log(`[DEBUG-FALLBACK] Version ${versie_id} Section ${section.aangepaste_sectie_id} Agreement ${verkoopsovereenkomstId} Found ${rows.length} rows. Mapping IDs:`, rows.map(r => r.name).slice(0, 3));\n        }"
);

fs.writeFileSync(path, content);
console.log('Added more diagnostic logs for fallback mode.');
