const { pool } = require('../config/db');

async function debug() {
    try {
        const [vo] = await pool.query('SELECT dossier_id FROM Verkoopsovereenkomst WHERE verkoopsovereenkomst_id = 70');
        console.log('Dossier ID for agreement 70:', vo[0].dossier_id);

        const dossierId = vo[0].dossier_id;
        const [ap] = await pool.query('SELECT aangepaste_placeholder_id, placeholder_id, verkoopsovereenkomst_id, ingevulde_waarde FROM Aangepaste_Placeholder WHERE dossier_id = ?', [dossierId]);
        console.log(`Found ${ap.length} placeholders in Aangepaste_Placeholder for dossier ${dossierId}`);
        console.table(ap.slice(0, 10));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
