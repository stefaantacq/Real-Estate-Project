const { pool } = require('../config/db');

async function debug() {
    try {
        const [ap] = await pool.query('SELECT aangepaste_placeholder_id, placeholder_id, ingevulde_waarde, document_id, verkoopsovereenkomst_id FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = 70 LIMIT 10');
        console.log('--- Aangepaste_Placeholder for Agreement 70 ---');
        console.table(ap);

        const [vp] = await pool.query('SELECT vp_id, placeholder_id, ingevulde_waarde, document_id FROM VersiePlaceholder WHERE versie_id = 94');
        console.log('\n--- VersiePlaceholder for Versie 94 (v3.0) ---');
        console.table(vp);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
