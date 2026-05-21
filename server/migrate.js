const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
    const { pool } = require('./config/db');

    // Check if schema already exists
    try {
        await pool.query('SELECT 1 FROM Account LIMIT 1');
        console.log('[Migration] Schema already exists, skipping initial migration.');
    } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') throw err;

        console.log('[Migration] No schema found. Importing initial database...');

        const sqlPath = path.join(__dirname, '../Docker/compromAIs.sql');
        if (!fs.existsSync(sqlPath)) {
            console.error('[Migration] SQL file not found at:', sqlPath);
            throw new Error('Initial migration SQL file missing');
        }

        // Need a separate connection with multipleStatements enabled
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT) || 3306,
            multipleStatements: true,
        });

        try {
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await conn.query(sql);
            console.log('[Migration] Initial schema and data imported successfully.');
        } finally {
            await conn.end();
        }
    }

    // Always run JS migrations (they are idempotent)
    const { pool: p } = require('./config/db');
    await runAlterIfMissing(p, 'Account', 'custom_document_prompt',
        'ALTER TABLE Account ADD COLUMN custom_document_prompt TEXT DEFAULT NULL');
    await runAlterIfMissing(p, 'Account', 'custom_template_prompt',
        'ALTER TABLE Account ADD COLUMN custom_template_prompt TEXT DEFAULT NULL');
    await runAlterIfMissing(p, 'Versie', 'is_bookmarked',
        'ALTER TABLE Versie ADD COLUMN is_bookmarked BOOLEAN DEFAULT FALSE');

    console.log('[Migration] All migrations complete.');
}

async function runAlterIfMissing(pool, table, column, alterSql) {
    try {
        await pool.query(alterSql);
        console.log(`[Migration] Added column ${column} to ${table}.`);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
            // Column already exists, nothing to do
        } else {
            console.warn(`[Migration] Could not alter ${table}.${column}:`, err.message);
        }
    }
}

module.exports = { runMigrations };
