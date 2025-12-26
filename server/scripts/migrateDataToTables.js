const { pool } = require('../config/db');

async function migrate() {
    try {
        console.log('--- Starting Migration ---');

        // 1. Cleanup existing normalized data (Optional/Dev only)
        console.log('Cleaning up existing data...');
        await pool.query('DELETE FROM AangepastePlaceholder');
        await pool.query('DELETE FROM AangepasteSectie');
        await pool.query('DELETE FROM Placeholder');
        await pool.query('DELETE FROM Sectie');

        // 2. Migrate Templates
        console.log('Migrating Templates...');
        const [templates] = await pool.query('SELECT template_id, sections FROM Template');

        for (const template of templates) {
            let sections = [];
            try {
                sections = typeof template.sections === 'string' ? JSON.parse(template.sections) : (template.sections || []);
            } catch (e) {
                console.warn(`Warning: Failed to parse sections for template ${template.template_id}`);
                continue;
            }

            if (!Array.isArray(sections)) continue;

            for (let i = 0; i < sections.length; i++) {
                const s = sections[i];
                const [sectieResult] = await pool.query(
                    'INSERT INTO Sectie (template_id, titel, tekst_content, volgorde) VALUES (?, ?, ?, ?)',
                    [template.template_id, s.title, s.content, i]
                );
                const newSectieId = sectieResult.insertId;

                if (Array.isArray(s.placeholders)) {
                    for (const p of s.placeholders) {
                        await pool.query(
                            'INSERT INTO Placeholder (sectie_id, naam, type) VALUES (?, ?, ?)',
                            [newSectieId, p.id || p.label, p.type || 'text']
                        );
                    }
                }
            }
        }

        // 3. Migrate Versions
        console.log('Migrating Versions...');
        const [versions] = await pool.query('SELECT versie_id, sections FROM Versie');

        for (const version of versions) {
            let sections = [];
            try {
                sections = typeof version.sections === 'string' ? JSON.parse(version.sections) : (version.sections || []);
            } catch (e) {
                console.warn(`Warning: Failed to parse sections for version ${version.versie_id}`);
                continue;
            }

            if (!Array.isArray(sections)) continue;

            for (const s of sections) {
                // Find the corresponding Sectie (this might be tricky if we don't have a reliable mapping)
                // In the prototype, we can try to match by title or just use the first/next one.
                // However, a better way is to check if Template has a matching section.
                // For migration, we'll try to find a Sectie that belongs to the Template of this Version's Agreement.

                const [aggRows] = await pool.query(
                    'SELECT template_id FROM Verkoopsovereenkomst v JOIN Versie ver ON v.overeenkomst_id = ver.overeenkomst_id WHERE ver.versie_id = ?',
                    [version.versie_id]
                );
                const templateId = aggRows[0]?.template_id;

                let sectieId = null;
                if (templateId) {
                    const [rows] = await pool.query('SELECT sectie_id FROM Sectie WHERE template_id = ? AND titel = ?', [templateId, s.title]);
                    sectieId = rows[0]?.sectie_id;
                }

                const [customSectieResult] = await pool.query(
                    'INSERT INTO AangepasteSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
                    [version.versie_id, sectieId, s.content, s.isApproved ? 'approved' : 'pending']
                );
                const newCustomSectieId = customSectieResult.insertId;

                if (Array.isArray(s.placeholders)) {
                    for (const p of s.placeholders) {
                        // Find matching Placeholder definition
                        let placeholderId = null;
                        if (sectieId) {
                            const [pRows] = await pool.query('SELECT placeholder_id FROM Placeholder WHERE sectie_id = ? AND naam = ?', [sectieId, p.id || p.label]);
                            placeholderId = pRows[0]?.placeholder_id;
                        }

                        await pool.query(
                            'INSERT INTO AangepastePlaceholder (aangepaste_sectie_id, placeholder_id, ingevulde_waarde, onzekerheidsscore, correctheid, validatiestatus) VALUES (?, ?, ?, ?, ?, ?)',
                            [
                                newCustomSectieId,
                                placeholderId,
                                p.currentValue,
                                p.confidence === 'High' ? 1.0 : (p.confidence === 'Medium' ? 0.7 : 0.4),
                                p.isApproved ? 1 : 0,
                                p.isApproved ? 'approved' : 'pending'
                            ]
                        );
                    }
                }
            }
        }

        console.log('--- Migration Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
