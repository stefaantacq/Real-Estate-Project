const { pool } = require('../config/db');

async function fix() {
    try {
        console.log('Adding verkoopsovereenkomst_id to Aangepaste_Placeholder...');
        
        // 1. Add the column
        await pool.query('ALTER TABLE Aangepaste_Placeholder ADD COLUMN verkoopsovereenkomst_id INT NULL');
        
        // 2. Try to populate it based on aangepaste_sectie_id -> VersieSectie -> Versie -> Verkoopsovereenkomst
        console.log('Populating verkoopsovereenkomst_id from existing links...');
        await pool.query(`
            UPDATE Aangepaste_Placeholder ap
            JOIN VersieSectie vs ON ap.aangepaste_sectie_id = vs.aangepaste_sectie_id
            JOIN Versie v ON vs.versie_id = v.versie_id
            SET ap.verkoopsovereenkomst_id = v.verkoopsovereenkomst_id
            WHERE ap.verkoopsovereenkomst_id IS NULL
        `);

        // 3. For any remaining (e.g. Master records without sections), we'll have to be careful.
        // But usually every placeholder in Aangepaste_Placeholder has a section it belongs to.

        // 4. Update the Unique constraint
        console.log('Updating UNIQUE constraint...');
        // Drop old unique constraint (need to find its name, usually dossier_id or dossier_id_2 depending on index creation)
        const [indexes] = await pool.query('SHOW INDEX FROM Aangepaste_Placeholder');
        const uniqueIndex = indexes.find(idx => idx.Non_unique === 0 && idx.Key_name !== 'PRIMARY');
        
        if (uniqueIndex) {
            console.log(`Dropping existing unique index: ${uniqueIndex.Key_name}`);
            await pool.query(`ALTER TABLE Aangepaste_Placeholder DROP INDEX ${uniqueIndex.Key_name}`);
        }
        
        await pool.query('ALTER TABLE Aangepaste_Placeholder ADD UNIQUE (dossier_id, placeholder_id, verkoopsovereenkomst_id)');
        await pool.query('ALTER TABLE Aangepaste_Placeholder ADD CONSTRAINT fk_ap_agreement FOREIGN KEY (verkoopsovereenkomst_id) REFERENCES Verkoopsovereenkomst(verkoopsovereenkomst_id) ON DELETE CASCADE');

        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
