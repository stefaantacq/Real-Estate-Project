const { pool } = require('../config/db');

async function debug() {
    try {
        const [null_ap] = await pool.query('SELECT COUNT(*) as cnt FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id IS NULL');
        console.log('Aangepaste_Placeholder with NULL agreement_id:', null_ap[0].cnt);

        const [total_ap] = await pool.query('SELECT COUNT(*) as cnt FROM Aangepaste_Placeholder');
        console.log('Total Aangepaste_Placeholder:', total_ap[0].cnt);

        const [sample] = await pool.query(`
            SELECT ap.aangepaste_placeholder_id, ap.dossier_id, ap.verkoopsovereenkomst_id, pl.sleutel, ap.ingevulde_waarde 
            FROM Aangepaste_Placeholder ap
            JOIN Placeholder_Library pl ON ap.placeholder_id = pl.placeholder_id
            LIMIT 10
        `);
        console.table(sample);

        const [versions] = await pool.query('SELECT versie_id, verkoopsovereenkomst_id, versie_nummer FROM Versie ORDER BY created_at DESC LIMIT 10');
        console.log('\n--- Recent Versions ---');
        console.table(versions);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
