const db = require('../config/db');

async function migrateToVersioning() {
    try {
        console.log('--- Migration: Multi-Agreement & Versioning ---');

        // 0. Clean start
        console.log('Cleaning up existing tables...');
        await db.pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.pool.query('DROP TABLE IF EXISTS Versie');
        await db.pool.query('DROP TABLE IF EXISTS Verkoopsovereenkomst');
        await db.pool.query('SET FOREIGN_KEY_CHECKS = 1');

        // 1. Create Verkoopsovereenkomst Table
        console.log('Creating Verkoopsovereenkomst table...');
        await db.pool.query(`
            CREATE TABLE IF NOT EXISTS Verkoopsovereenkomst (
                overeenkomst_id INT AUTO_INCREMENT PRIMARY KEY,
                ui_id VARCHAR(50) UNIQUE,
                dossier_id INT NOT NULL,
                template_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dossier_id) REFERENCES Dossier(dossier_id) ON DELETE CASCADE,
                FOREIGN KEY (template_id) REFERENCES Template(template_id) ON DELETE SET NULL
            )
        `);

        // 2. Create Versie Table
        console.log('Creating Versie table...');
        await db.pool.query(`
            CREATE TABLE IF NOT EXISTS Versie (
                versie_id INT AUTO_INCREMENT PRIMARY KEY,
                ui_id VARCHAR(50) UNIQUE,
                overeenkomst_id INT NOT NULL,
                versie_nummer VARCHAR(20) NOT NULL, -- e.g., '1.1'
                sections JSON,
                file_path VARCHAR(512),
                source ENUM('AI', 'Upload', 'Manual') DEFAULT 'Manual',
                is_current BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (overeenkomst_id) REFERENCES Verkoopsovereenkomst(overeenkomst_id) ON DELETE CASCADE
            )
        `);

        // 3. Migrate existing data from Dossier to the new tables
        console.log('Migrating existing dossier data...');
        const [dossiers] = await db.pool.query('SELECT dossier_id, template_id, sections FROM Dossier WHERE template_id IS NOT NULL');

        for (const dos of dossiers) {
            const ouvUiId = `ouv-${Date.now()}-${dos.dossier_id}`;
            const [ouvResult] = await db.pool.query(
                'INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id) VALUES (?, ?, ?)',
                [ouvUiId, dos.dossier_id, dos.template_id]
            );

            const verUiId = `ver-${Date.now()}-${dos.dossier_id}-1.1`;
            await db.pool.query(
                'INSERT INTO Versie (ui_id, overeenkomst_id, versie_nummer, sections, source, is_current) VALUES (?, ?, ?, ?, ?, ?)',
                [verUiId, ouvResult.insertId, '1.1', JSON.stringify(dos.sections || []), 'Manual', true]
            );
            console.log(`Migrated Dossier ${dos.dossier_id} to Agreement and Version 1.1`);
        }

        // 4. Remove columns from Dossier
        console.log('Updating Dossier table structure...');
        const [cols] = await db.pool.query('SHOW COLUMNS FROM Dossier');
        if (cols.some(c => c.Field === 'sections')) {
            await db.pool.query('ALTER TABLE Dossier DROP COLUMN sections');
        }
        if (cols.some(c => c.Field === 'template_id')) {
            // Keep template_id or remove? User said Version has sections, but Agreement has template_id.
            // I'll drop template_id from Dossier since it's now in Verkoopsovereenkomst.
            await db.pool.query('ALTER TABLE Dossier DROP COLUMN template_id');
        }

        console.log('--- Migration Success ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateToVersioning();
