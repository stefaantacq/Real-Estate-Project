/**
 * Migration: Add VersiePlaceholder table
 *
 * This table stores a per-version snapshot of each placeholder value.
 * When a version is saved (updateVersion), the current placeholder values
 * are written here, indexed by (versie_id, placeholder_id).
 *
 * This allows the diff feature to compare placeholder values between versions,
 * even after later saves have overwritten Aangepaste_Placeholder.
 */

const { pool } = require('../config/db');

async function run() {
    try {
        console.log('[Migration] Creating VersiePlaceholder table...');

        // Create the snapshot table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS VersiePlaceholder (
                versie_placeholder_id INT AUTO_INCREMENT PRIMARY KEY,
                versie_id INT NOT NULL,
                placeholder_id INT NOT NULL,
                aangepaste_sectie_id INT NOT NULL,
                ingevulde_waarde TEXT,
                validatiestatus VARCHAR(50),
                UNIQUE KEY uq_versie_placeholder (versie_id, placeholder_id),
                FOREIGN KEY (versie_id) REFERENCES Versie(versie_id) ON DELETE CASCADE,
                FOREIGN KEY (placeholder_id) REFERENCES Placeholder_Library(placeholder_id) ON DELETE CASCADE,
                FOREIGN KEY (aangepaste_sectie_id) REFERENCES VersieSectie(aangepaste_sectie_id) ON DELETE CASCADE
            )
        `);

        console.log('[Migration] VersiePlaceholder table created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('[Migration] Error:', err);
        process.exit(1);
    }
}

run();
