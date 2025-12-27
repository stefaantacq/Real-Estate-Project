const { pool } = require('./config/db');

async function check() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM Placeholder');
        console.log(`Placeholder count: ${rows[0].count}`);
        const [templates] = await pool.query('SELECT template_id, naam FROM Template');
        console.log(`Templates:`, templates);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
