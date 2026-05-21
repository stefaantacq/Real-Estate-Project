const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Surface pool-level errors (e.g. lost connections) instead of crashing silently
pool.on('connection', (connection) => {
    connection.on('error', (err) => {
        console.error('[DB] Connection error:', err.code, err.message);
    });
});

/**
 * Verify the pool can reach the database.
 * Retries up to `retries` times with an exponential back-off before giving up.
 */
async function testConnection(retries = 5, delayMs = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const conn = await pool.getConnection();
            await conn.ping();
            conn.release();
            console.log('[DB] Connected to MySQL successfully');
            return true;
        } catch (err) {
            console.error(
                `[DB] Connection attempt ${attempt}/${retries} failed: ${err.code || ''} ${err.message}`
            );
            console.error('[DB] Config — host:', process.env.DB_HOST, '| port:', process.env.DB_PORT || 3306, '| user:', process.env.DB_USER, '| database:', process.env.DB_NAME);
            if (attempt < retries) {
                const wait = delayMs * attempt;
                console.log(`[DB] Retrying in ${wait / 1000}s…`);
                await new Promise((resolve) => setTimeout(resolve, wait));
            } else {
                console.error('[DB] All connection attempts exhausted. Giving up.');
                throw err;
            }
        }
    }
}

module.exports = { pool, testConnection };
