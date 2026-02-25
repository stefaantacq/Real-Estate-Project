const { pool } = require('../config/db');

async function diag() {
    const tables = ['Template', 'Sectie', 'Placeholder', 'Placeholder_Library'];
    for (const table of tables) {
        console.log(\`--- Schema for \${table} ---\`);
        try {
            const [rows] = await pool.query(\`SHOW COLUMNS FROM \${table}\`);
            console.table(rows);
        } catch (e) {
            console.error(\`Error describing \${table}: \${e.message}\`);
        }
    }
    process.exit(0);
}
diag();
