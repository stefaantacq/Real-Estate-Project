/**
 * Migration: Add metadata columns to VersiePlaceholder
 */
const { pool } = require('../config/db');

async function run() {
    try {
        console.log('[Migration] Adding metadata columns to VersiePlaceholder...');

        await pool.query(`
            ALTER TABLE VersiePlaceholder 
            ADD COLUMN document_id INT NULL,
            ADD COLUMN bron_text TEXT NULL,
            ADD COLUMN pagina_nummer INT NULL,
            ADD CONSTRAINT fk_vp_document FOREIGN KEY (document_id) REFERENCES Documenten(document_id) ON DELETE SET NULL
        `);

        console.log('[Migration] Columns added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('[Migration] Error:', err);
        process.exit(1);
    }
}

run();
