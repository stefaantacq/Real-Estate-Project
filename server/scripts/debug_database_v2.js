const { pool } = require('../config/db');

async function debug() {
    try {
        const [ap] = await pool.query('DESCRIBE Aangepaste_Placeholder');
        console.log('--- Aangepaste_Placeholder ---');
        console.table(ap);

        const [vp] = await pool.query('DESCRIBE VersiePlaceholder');
        console.log('\n--- VersiePlaceholder ---');
        console.table(vp);

        const [ap_data] = await pool.query('SELECT aangepaste_placeholder_id, dossier_id, verkoopsovereenkomst_id, placeholder_id, ingevulde_waarde FROM Aangepaste_Placeholder ORDER BY aangepaste_placeholder_id DESC LIMIT 20');
        console.log('\n--- Aangepaste_Placeholder Data ---');
        console.table(ap_data);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
