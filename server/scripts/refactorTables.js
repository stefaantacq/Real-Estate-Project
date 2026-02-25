const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    path.join(__dirname, '../controllers/dossierController.js'),
    path.join(__dirname, '../controllers/templateController.js'),
    path.join(__dirname, '../scripts/seedTemplates.js'),
    path.join(__dirname, '../scripts/seedAuth.js')
];

for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');

    // Table names
    content = content.replace(/AangepasteSectie/g, 'VersieSectie');
    content = content.replace(/AangepastePlaceholder/g, 'Aangepaste_Placeholder');
    content = content.replace(/PlaceholderLibrary/g, 'Placeholder_Library');
    content = content.replace(/SectiePlaceholder/g, 'Placeholder');
    content = content.replace(/FROM unions /gi, 'FROM unions '); // Example of nothing
    
    // Column ids
    content = content.replace(/pl\.id/g, 'pl.placeholder_id');
    // `SELECT id FROM Placeholder_Library`
    content = content.replace(/SELECT id FROM/g, 'SELECT placeholder_id FROM');
    // `WHERE id = ` -> Wait, there might be other generic id usages.
    // Let's replace only known `Placeholder_Library` contexts.
    content = content.replace(/pl\.id/g, 'pl.placeholder_id');
    
    // Verkoopsovereenkomst pk rename handle
    // Actually init_schema_v2.js has both `overeenkomst_id` and `verkoopsovereenkomst_id` columns, so it will work either way.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
}
