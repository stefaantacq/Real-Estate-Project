const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the syntax error in updateVersion (INSERT INTO VersiePlaceholder had 9 '?' for 8 columns)
content = content.replace(
    'INSERT INTO VersiePlaceholder (versie_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer)\n                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    'INSERT INTO VersiePlaceholder (versie_id, placeholder_id, aangepaste_sectie_id, ingevulde_waarde, validatiestatus, document_id, bron_text, pagina_nummer)\n                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

// Actually, looking at the code I wrote in fix_controller_v8.js, I might have used a different string.
// Let's do a more robust regex replacement for the 9 ? issue.
content = content.replace(
    /VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?\)\n\s+\[newVersieId, placeholderId, newAangepasteSectieId, p\.currentValue, placeholderStatus, docId, bronText, paginaNummer\]/g,
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n                              [newVersieId, placeholderId, newAangepasteSectieId, p.currentValue, placeholderStatus, docId, bronText, paginaNummer]"
);

// 2. Ensure fetchFullVersionContent is retrieving the right fields and logging debug info
content = content.replace(
    'placeholders = rows;',
    "placeholders = rows; console.log(`[FETCH] Version ${versie_id} Section ${section.aangepaste_sectie_id} found ${rows.length} placeholders with snapshot. First metadata:`, rows[0] ? { name: rows[0].name, doc_id: rows[0].document_id } : 'none');"
);

content = content.replace(
    'placeholders = rows;\n        }',
    "placeholders = rows; console.log(`[FETCH] Version ${versie_id} Section ${section.aangepaste_sectie_id} found ${rows.length} placeholders in FALLBACK. First metadata:`, rows[0] ? { name: rows[0].name, doc_id: rows[0].document_id } : 'none');\n        }"
);

// 3. Fix metadata join in snapshot mode to be even more robust
const robustSnapshotSelect = `                SELECT 
                    pl.placeholder_id,
                    pl.sleutel as name,
                    pl.type,
                    p.pdf_label,
                    vp.ingevulde_waarde as value,
                    vp.validatiestatus as placeholder_validation_status,
                    COALESCE(vp.document_id, ap.document_id) as document_id,
                    COALESCE(vp.bron_text, ap.bron_text) as bron_text,
                    COALESCE(vp.pagina_nummer, ap.pagina_nummer) as pagina_nummer,
                    COALESCE(d1.bestand_pad, d2.bestand_pad, '/uploads/') as document_pad,
                    COALESCE(d1.bestandsnaam, d2.bestandsnaam, 'Bestand niet gevonden') as document_naam
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

// Check if I correctly placed the params for this query
content = content.replace(/COALESCE\(d1.bestand_pad, d2.bestand_pad\) as document_pad/g, "COALESCE(d1.bestand_pad, d2.bestand_pad) as document_pad");
// Actually, it should already be there from fix_controller_v8.js.

fs.writeFileSync(path, content);
console.log('Fixed syntax error and added diagnostic logging.');
