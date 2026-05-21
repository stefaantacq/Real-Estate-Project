const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
    const { pool } = require('./config/db');

    // ── Initial schema import (fresh database) ─────────────────────────────────
    try {
        await pool.query('SELECT 1 FROM Account LIMIT 1');
        console.log('[Migration] Schema already exists, skipping initial import.');
    } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') throw err;

        console.log('[Migration] No schema found. Importing initial database...');

        const sqlPath = path.join(__dirname, '../Docker/compromAIs.sql');
        if (!fs.existsSync(sqlPath)) {
            console.error('[Migration] SQL file not found at:', sqlPath);
            throw new Error('Initial migration SQL file missing');
        }

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

    const { pool: p } = require('./config/db');

    // ── Schema normalisation (idempotent, safe to run on every startup) ─────────
    // Each step checks current state via INFORMATION_SCHEMA before acting.

    // 1. Account: wachtwoord_hash → password_hash
    await renameColumnIfExists(p, 'Account', 'wachtwoord_hash', 'password_hash');

    // 2. Fix seed user — the SQL dump inserts password_hash = 'hash' which is not
    //    a real bcrypt hash. Replace it with a real hash so login works out-of-box.
    await fixPlaceholderPasswords(p);

    // 3. Account: add optional prompt columns
    await addColumnIfMissing(p, 'Account', 'custom_document_prompt',
        'ALTER TABLE Account ADD COLUMN custom_document_prompt TEXT DEFAULT NULL');
    await addColumnIfMissing(p, 'Account', 'custom_template_prompt',
        'ALTER TABLE Account ADD COLUMN custom_template_prompt TEXT DEFAULT NULL');

    // 4. PlaceholderLibrary → Placeholder_Library (rename parent first so child FKs auto-update)
    await renameTableIfExists(p, 'PlaceholderLibrary', 'Placeholder_Library');

    // 5. Placeholder_Library.id → placeholder_id (FK refs in child tables auto-update in MySQL 8+)
    await renameColumnIfExists(p, 'Placeholder_Library', 'id', 'placeholder_id');

    // 6. AangepasteSectie → VersieSectie
    await renameTableIfExists(p, 'AangepasteSectie', 'VersieSectie');

    // 7. AangepastePlaceholder → Aangepaste_Placeholder
    await renameTableIfExists(p, 'AangepastePlaceholder', 'Aangepaste_Placeholder');

    // 8. Aangepaste_Placeholder: add columns required by current codebase
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'verkoopsovereenkomst_id',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN verkoopsovereenkomst_id INT DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'aangepaste_sectie_id',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN aangepaste_sectie_id INT DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'document_id',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN document_id INT DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'bron_text',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN bron_text TEXT DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'pagina_nummer',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN pagina_nummer INT DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'coords_json',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN coords_json JSON DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'confidence_score',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN confidence_score DECIMAL(5,4) DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'confidence_reasoning',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN confidence_reasoning TEXT DEFAULT NULL');
    await addColumnIfMissing(p, 'Aangepaste_Placeholder', 'conflicting_sources',
        'ALTER TABLE Aangepaste_Placeholder ADD COLUMN conflicting_sources JSON DEFAULT NULL');

    // 9. Verkoopsovereenkomst.overeenkomst_id → verkoopsovereenkomst_id
    //    MySQL 8.0+ automatically updates FK refs in child tables (Versie).
    await renameColumnIfExists(p, 'Verkoopsovereenkomst', 'overeenkomst_id', 'verkoopsovereenkomst_id');

    // 10. Versie.overeenkomst_id → verkoopsovereenkomst_id (the FK column itself)
    await renameColumnIfExists(p, 'Versie', 'overeenkomst_id', 'verkoopsovereenkomst_id');

    // 11. Dossier: add display_order for manual sort
    await addColumnIfMissing(p, 'Dossier', 'display_order',
        'ALTER TABLE Dossier ADD COLUMN display_order INT DEFAULT NULL');

    // 12. Versie: add is_bookmarked
    await addColumnIfMissing(p, 'Versie', 'is_bookmarked',
        'ALTER TABLE Versie ADD COLUMN is_bookmarked BOOLEAN DEFAULT FALSE');

    // 13. VersiePlaceholder: new table for per-version placeholder snapshots
    await createTableIfMissing(p, 'VersiePlaceholder', `
        CREATE TABLE VersiePlaceholder (
            id INT NOT NULL AUTO_INCREMENT,
            versie_id INT NOT NULL,
            placeholder_id INT NOT NULL,
            aangepaste_sectie_id INT DEFAULT NULL,
            ingevulde_waarde TEXT,
            validatiestatus VARCHAR(50) DEFAULT 'pending',
            document_id INT DEFAULT NULL,
            bron_text TEXT DEFAULT NULL,
            pagina_nummer INT DEFAULT NULL,
            coords_json JSON DEFAULT NULL,
            confidence_score DECIMAL(5,4) DEFAULT NULL,
            confidence_reasoning TEXT DEFAULT NULL,
            conflicting_sources JSON DEFAULT NULL,
            PRIMARY KEY (id),
            KEY versie_id (versie_id),
            KEY placeholder_id (placeholder_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('[Migration] All migrations complete.');
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function renameColumnIfExists(pool, table, oldCol, newCol) {
    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [table, oldCol]
        );
        if (rows[0].cnt > 0) {
            await pool.query(`ALTER TABLE \`${table}\` RENAME COLUMN \`${oldCol}\` TO \`${newCol}\``);
            console.log(`[Migration] Renamed ${table}.${oldCol} → ${newCol}`);
        }
    } catch (err) {
        console.warn(`[Migration] Could not rename ${table}.${oldCol}:`, err.message);
    }
}

async function renameTableIfExists(pool, oldName, newName) {
    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
            [oldName]
        );
        if (rows[0].cnt > 0) {
            await pool.query(`RENAME TABLE \`${oldName}\` TO \`${newName}\``);
            console.log(`[Migration] Renamed table ${oldName} → ${newName}`);
        }
    } catch (err) {
        console.warn(`[Migration] Could not rename table ${oldName}:`, err.message);
    }
}

async function addColumnIfMissing(pool, table, column, alterSql) {
    try {
        await pool.query(alterSql);
        console.log(`[Migration] Added ${table}.${column}`);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
            // already exists — nothing to do
        } else {
            console.warn(`[Migration] Could not add ${table}.${column}:`, err.message);
        }
    }
}

async function createTableIfMissing(pool, tableName, createSql) {
    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
            [tableName]
        );
        if (rows[0].cnt === 0) {
            await pool.query(createSql);
            console.log(`[Migration] Created table ${tableName}`);
        }
    } catch (err) {
        console.warn(`[Migration] Could not create ${tableName}:`, err.message);
    }
}

async function fixPlaceholderPasswords(pool) {
    try {
        const [rows] = await pool.query(
            `SELECT account_id FROM Account WHERE password_hash = 'hash' OR password_hash = '' LIMIT 10`
        );
        if (rows.length === 0) return;
        const hash = await bcrypt.hash('admin', 10);
        for (const row of rows) {
            await pool.query('UPDATE Account SET password_hash = ? WHERE account_id = ?', [hash, row.account_id]);
        }
        console.log(`[Migration] Fixed placeholder password for ${rows.length} account(s). Default password: admin`);
    } catch (err) {
        console.warn('[Migration] Could not fix placeholder passwords:', err.message);
    }
}

module.exports = { runMigrations };
