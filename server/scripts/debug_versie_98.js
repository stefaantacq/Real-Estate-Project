const { pool } = require('../config/db');

async function debug() {
    try {
        console.log('--- VersiePlaceholder for Versie 98 (v3.1) ---');
        const [vp] = await pool.query('SELECT versie_placeholder_id, placeholder_id, ingevulde_waarde, document_id, bron_text FROM VersiePlaceholder WHERE versie_id = 98');
        console.table(vp);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
