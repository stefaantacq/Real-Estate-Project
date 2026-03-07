const fs = require('fs');
const path = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/controllers/dossierController.js';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `            // Create new version
            const new_ui_id = 'ver-' + Date.now();
            await pool.query('UPDATE Versie SET is_current = FALSE WHERE verkoopsovereenkomst_id = ?', [ver.verkoopsovereenkomst_id]);
            const [vResult] = await pool.query('INSERT INTO Versie(ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES(?, ?, ?, ?, ?)', [new_ui_id, ver.verkoopsovereenkomst_id, nextNum, 'Save', true]);
            const newVersieId = vResult.insertId;

            for (const s of (sections || [])) {`;

const newBlock = `            // Create new version
            const new_ui_id = 'ver-' + Date.now();
            await pool.query('UPDATE Versie SET is_current = FALSE WHERE verkoopsovereenkomst_id = ?', [ver.verkoopsovereenkomst_id]);
            const [vResult] = await pool.query('INSERT INTO Versie(ui_id, verkoopsovereenkomst_id, versie_nummer, source, is_current) VALUES(?, ?, ?, ?, ?)', [new_ui_id, ver.verkoopsovereenkomst_id, nextNum, 'Save', true]);
            const newVersieId = vResult.insertId;

            // Pre-scan all sections to collect the best available metadata for each unique placeholder
            const metadataMap = {};
            for (const s of (sections || [])) {
                for (const p of (s.placeholders || [])) {
                    if (p.documentId && !metadataMap[p.id]) {
                        metadataMap[p.id] = {
                            documentId: p.documentId,
                            bronText: p.bronText || p.bron_text,
                            paginaNummer: p.paginaNummer || p.pagina_nummer
                        };
                    }
                }
            }

            for (const s of (sections || [])) {`;

content = content.replace(oldBlock, newBlock);

// Update metadata assignments
const oldMeta = `                        const docId = p.documentId || null;
                        const bronText = p.bronText || null;
                        const paginaNummer = p.paginaNummer || null;`;

const newMeta = `                        const bestMeta = metadataMap[p.id] || {};
                        const docId = p.documentId || p.document_id || bestMeta.documentId || null;
                        const bronText = p.bronText || p.bron_text || bestMeta.bronText || null;
                        const paginaNummer = p.paginaNummer || p.pagina_nummer || bestMeta.paginaNummer || null;`;

content = content.replace(oldMeta, newMeta);

// Update COALESCE for Aangepaste_Placeholder
const oldUpdate = `                                 document_id = VALUES(document_id),
                                 bron_text = VALUES(bron_text),
                                 pagina_nummer = VALUES(pagina_nummer)\`,`;
const newUpdate = `                                document_id = COALESCE(VALUES(document_id), document_id),
                                bron_text = COALESCE(VALUES(bron_text), bron_text),
                                pagina_nummer = COALESCE(VALUES(pagina_nummer), pagina_nummer)\`,`;

content = content.replace(oldUpdate, newUpdate);

// Remove diagnostic logs while at it
content = content.replace(/require\('fs'\)\.appendFileSync\('body_debug\.log'.*?\);\n/g, '');
content = content.replace(/if \(s\.placeholders\.indexOf\(p\) === 0\) require\('fs'\)\.writeFileSync.*?\);\n/g, '');

fs.writeFileSync(path, content);
console.log('Successfully applied consistency fix.');
