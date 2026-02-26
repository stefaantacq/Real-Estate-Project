const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Kapers4v',
    database: process.env.DB_NAME || 'AI_Real_Estate_App',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function check() {
    try {
        const [rows] = await pool.query('SELECT dossier_id, placeholder_id, ingevulde_waarde, document_id, bron_text FROM Aangepaste_Placeholder ORDER BY last_updated DESC LIMIT 10;');
        console.log("LAST 10 ROW RESULTS:\n", rows);
    } catch(err){
        console.error("ERROR:", err);
    } finally {
        pool.end();
    }
}
check();
