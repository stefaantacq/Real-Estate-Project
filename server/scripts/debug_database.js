const { pool } = require('../config/db');

async function debug() {
    try {
        console.log('--- Aangepaste_Placeholder (Master Data) ---');
        const [ap] = await pool.query('SELECT aangepaste_placeholder_id, dossier_id, verkoopsovereenkomst_id, placeholder_id, ingevulde_waarde, document_id FROM Aangepaste_Placeholder ORDER BY aangepaste_placeholder_id DESC LIMIT 10');
        console.table(ap);

        console.log('\n--- Versie (Most recent) ---');
        const [versions] = await pool.query('SELECT versie_id, verkoopsovereenkomst_id, versie_nummer, created_at FROM Versie ORDER BY created_at DESC LIMIT 5');
        console.table(versions);

        if (versions.length > 0) {
            const vid = versions[0].versie_id;
            console.log(`\n--- VersiePlaceholder for Versie ${vid} ---`);
            const [vp] = await pool.query('SELECT vp_id, versie_id, placeholder_id, document_id, ingevulde_waarde FROM VersiePlaceholder WHERE versie_id = ? LIMIT 5', [vid]);
            console.table(vp);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
