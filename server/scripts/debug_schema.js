const { pool } = require('../config/db');

async function debug() {
    try {
        const [rows] = await pool.query('SHOW CREATE TABLE Aangepaste_Placeholder');
        console.log(rows[0]['Create Table']);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
