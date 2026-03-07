const { pool } = require('../config/db');

async function debug() {
    try {
        console.log('--- Aangepaste_Placeholder for Agreement 70 ---');
        const [ap] = await pool.query('SELECT aangepaste_placeholder_id, placeholder_id, ingevulde_waarde, document_id FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = 70');
        console.table(ap);

        console.log('\n--- Versie (Most recent for Aggr 70) ---');
        const [versions] = await pool.query('SELECT versie_id, verkoopsovereenkomst_id, versie_nummer FROM Versie WHERE verkoopsovereenkomst_id = 70 ORDER BY created_at DESC');
        console.table(versions);

        if (versions.length > 0) {
            for (const v of versions) {
                const [vp] = await pool.query('SELECT count(*) as cnt FROM VersiePlaceholder WHERE versie_id = ?', [v.versie_id]);
                console.log(`Versie ${v.versie_nummer} (ID ${v.versie_id}) has ${vp[0].cnt} snapshots.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
