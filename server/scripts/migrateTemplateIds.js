const db = require('../config/db');

async function migrateTemplateIds() {
    try {
        console.log('--- Migrating Dossier.template_id from string to int ---');

        // 1. Get all templates to build a mapping
        const [templates] = await db.pool.query('SELECT template_id, ui_id FROM Template');
        const mapping = {};
        templates.forEach(t => {
            if (t.ui_id) mapping[t.ui_id] = t.template_id;
        });

        console.log('Template mapping:', mapping);

        // 2. Get all dossiers
        const [dossiers] = await db.pool.query('SELECT dossier_id, template_id FROM Dossier');

        for (const dossier of dossiers) {
            const currentTid = dossier.template_id;
            if (currentTid && isNaN(currentTid)) {
                const newTid = mapping[currentTid];
                if (newTid) {
                    console.log(`Updating Dossier ${dossier.dossier_id}: ${currentTid} -> ${newTid}`);
                    await db.pool.query('UPDATE Dossier SET template_id = ? WHERE dossier_id = ?', [newTid, dossier.dossier_id]);
                } else {
                    console.warn(`No mapping found for template string "${currentTid}" in Dossier ${dossier.dossier_id}`);
                    await db.pool.query('UPDATE Dossier SET template_id = NULL WHERE dossier_id = ?', [dossier.dossier_id]);
                }
            }
        }

        // 3. Change column type to INT
        console.log('Changing Dossier.template_id type to INT...');
        await db.pool.query('ALTER TABLE Dossier MODIFY COLUMN template_id INT');

        console.log('--- Migration Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateTemplateIds();
