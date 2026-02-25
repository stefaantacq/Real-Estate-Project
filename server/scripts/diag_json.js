const { pool } = require('../config/db');

async function diag() {
    const tables = ['Template', 'Sectie', 'Placeholder', 'Placeholder_Library'];
    const result = {};
    for (const table of tables) {
        try {
            const [rows] = await pool.query(\`SHOW COLUMNS FROM \${table}\`);
            result[table] = rows.map(r => r.Field);
        } catch (e) {
            result[table] = { error: e.message };
        }
    }
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
diag();
