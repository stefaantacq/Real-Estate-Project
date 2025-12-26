const { pool } = require('../config/db');

async function copy6to7() {
    const sourceVersionId = 6;
    const targetVersionId = 7;
    console.log(`Copying content from Version ${sourceVersionId} to ${targetVersionId}...`);

    try {
        // Clear target just in case
        await pool.query('DELETE FROM AangepastePlaceholder WHERE aangepaste_sectie_id IN (SELECT aangepaste_sectie_id FROM AangepasteSectie WHERE versie_id = ?)', [targetVersionId]);
        await pool.query('DELETE FROM AangepasteSectie WHERE versie_id = ?', [targetVersionId]);

        const [oldSecties] = await pool.query('SELECT * FROM AangepasteSectie WHERE versie_id = ?', [sourceVersionId]);
        for (const os of oldSecties) {
            const [asResult] = await pool.query(
                'INSERT INTO AangepasteSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus) VALUES (?, ?, ?, ?)',
                [targetVersionId, os.sectie_id, os.tekst_inhoud, os.validatiestatus]
            );
            const newAsId = asResult.insertId;

            const [oldPlaceholders] = await pool.query('SELECT * FROM AangepastePlaceholder WHERE aangepaste_sectie_id = ?', [os.aangepaste_sectie_id]);
            for (const op of oldPlaceholders) {
                await pool.query(
                    'INSERT INTO AangepastePlaceholder (aangepaste_sectie_id, placeholder_id, ingevulde_waarde, onzekerheidsscore, correctheid, validatiestatus) VALUES (?, ?, ?, ?, ?, ?)',
                    [newAsId, op.placeholder_id, op.ingevulde_waarde, op.onzekerheidsscore, op.correctheid, op.validatiestatus]
                );
            }
        }
        console.log('Restoration Complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

copy6to7();
