const { pool } = require('../config/db');

async function fixVersion3() {
    try {
        const versionId = 3;
        console.log(`Fixing Version ${versionId}...`);

        const [vRows] = await pool.query('SELECT sections FROM Versie WHERE versie_id = ?', [versionId]);
        let sections = vRows[0].sections;
        if (typeof sections === 'string') {
            sections = JSON.parse(sections);
        }

        if (!Array.isArray(sections)) {
            console.error('No sections found in JSON');
            process.exit(1);
        }

        // Delete current corrupted AangepasteSectie/Placeholder for this version
        await pool.query('DELETE FROM AangepastePlaceholder WHERE aangepaste_sectie_id IN (SELECT aangepaste_sectie_id FROM AangepasteSectie WHERE versie_id = ?)', [versionId]);
        await pool.query('DELETE FROM AangepasteSectie WHERE versie_id = ?', [versionId]);

        // Re-insert from JSON
        for (const s of sections) {
            // Find Sectie ID from Template
            const [aggRows] = await pool.query(
                'SELECT template_id FROM Verkoopsovereenkomst v JOIN Versie ver ON v.overeenkomst_id = ver.overeenkomst_id WHERE ver.versie_id = ?',
                [versionId]
            );
            const templateId = aggRows[0]?.template_id;

            let sectieId = null;
            if (templateId) {
                const [rows] = await pool.query('SELECT sectie_id FROM Sectie WHERE template_id = ? AND titel = ?', [templateId, s.title]);
                sectieId = rows[0]?.sectie_id;
            }

            const [asResult] = await pool.query(
                'INSERT INTO AangepasteSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
                [versionId, sectieId, s.content, s.isApproved ? 'approved' : 'pending']
            );
            const asId = asResult.insertId;

            if (Array.isArray(s.placeholders)) {
                for (const p of s.placeholders) {
                    let placeholderId = null;
                    if (sectieId) {
                        const [pRows] = await pool.query('SELECT placeholder_id FROM Placeholder WHERE sectie_id = ? AND naam = ?', [sectieId, p.id || p.label]);
                        placeholderId = pRows[0]?.placeholder_id;
                    }

                    await pool.query(
                        'INSERT INTO AangepastePlaceholder (aangepaste_sectie_id, placeholder_id, ingevulde_waarde, onzekerheidsscore, correctheid, validatiestatus) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            asId,
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

        console.log('Restoration of Version 3 Complete');
        process.exit(0);
    } catch (error) {
        console.error('Failed to fix version 3:', error);
        process.exit(1);
    }
}

fixVersion3();
