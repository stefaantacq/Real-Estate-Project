require('dotenv').config({ path: '../.env' });
const pool = require('../config/db').pool;

async function migrate() {
    try {
        await pool.query('ALTER TABLE Versie ADD COLUMN is_bookmarked BOOLEAN DEFAULT FALSE');
        console.log('Added is_bookmarked to Versie table');
    } catch(e) {
        if(e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error(e);
        }
    }
    process.exit();
}

migrate();
