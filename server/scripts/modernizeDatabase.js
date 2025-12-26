const db = require('../config/db');

async function modernizeDatabase() {
    try {
        console.log('--- Modernizing Dossier Table ---');
        const [dossierCols] = await db.pool.query('SHOW COLUMNS FROM Dossier');

        const addColumnIfMissing = async (tableName, columnDef, after) => {
            const hasCol = dossierCols.some(col => col.Field === columnDef.split(' ')[0]);
            if (!hasCol) {
                console.log(`Adding ${columnDef.split(' ')[0]} to ${tableName}...`);
                await db.pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef} ${after ? 'AFTER ' + after : ''}`);
            }
        };

        await addColumnIfMissing('Dossier', 'ui_id VARCHAR(50)', 'dossier_id');
        await addColumnIfMissing('Dossier', 'status VARCHAR(50) DEFAULT "draft"', 'archiefstatus');
        await addColumnIfMissing('Dossier', 'type VARCHAR(50) DEFAULT "House"', 'status');
        await addColumnIfMissing('Dossier', 'sections JSON', 'type');
        await addColumnIfMissing('Dossier', 'remarks TEXT', 'sections');
        await addColumnIfMissing('Dossier', 'last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'remarks');
        await addColumnIfMissing('Dossier', 'template_id INT', 'account_id');

        console.log('--- Creating TimelineEvent Table ---');
        await db.pool.query(`
            CREATE TABLE IF NOT EXISTS TimelineEvent (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ui_id VARCHAR(50),
                dossier_id INT NOT NULL,
                event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                title VARCHAR(255),
                description TEXT,
                user_name VARCHAR(255),
                FOREIGN KEY (dossier_id) REFERENCES Dossier(dossier_id) ON DELETE CASCADE
            )
        `);

        console.log('--- Updating Documenten Table ---');
        const [docCols] = await db.pool.query('SHOW COLUMNS FROM Documenten');
        if (!docCols.some(col => col.Field === 'ui_id')) {
            await db.pool.query('ALTER TABLE Documenten ADD COLUMN ui_id VARCHAR(50) AFTER document_id');
        }

        console.log('Database modernization complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error modernizing database:', error);
        process.exit(1);
    }
}

modernizeDatabase();
