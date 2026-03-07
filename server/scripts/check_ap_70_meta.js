const { pool } = require('../config/db');

async function debug() {
    try {
        const [ap] = await pool.query('SELECT aangepaste_placeholder_id, placeholder_id, document_id, bron_text FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = 70');
        console.table(ap);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
