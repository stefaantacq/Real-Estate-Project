const { pool } = require('../config/db');

async function fix() {
    try {
        console.log('Modifying Aangepaste_Placeholder for Agreement isolation...');
        
        // 1. Drop existing FKs that use the unique index as a target or are just in the way
        // In MySQL, dropping a unique index that is used by a constraint can be tricky.
        // But here 'unique_dossier_placeholder' seems to be used by 'Aangepaste_Placeholder_ibfk_1'? 
        // No, ibfk_1 is for dossier_id.
        // The error said "needed in a foreign key constraint". 
        // Let's drop and recreate all FKs and the Index.

        await pool.query('ALTER TABLE Aangepaste_Placeholder DROP FOREIGN KEY Aangepaste_Placeholder_ibfk_1');
        await pool.query('ALTER TABLE Aangepaste_Placeholder DROP FOREIGN KEY Aangepaste_Placeholder_ibfk_2');

        // Now drop index
        await pool.query('ALTER TABLE Aangepaste_Placeholder DROP INDEX unique_dossier_placeholder');

        // Add verkoopsovereenkomst_id if not exists (already added by failed previous attempt, let's check)
        // Actually I'll just try AND suppress error if column exists.
        try {
            await pool.query('ALTER TABLE Aangepaste_Placeholder ADD COLUMN verkoopsovereenkomst_id INT NULL');
        } catch(e) {}

        // Populate it
        console.log('Populating verkoopsovereenkomst_id...');
        await pool.query(`
            UPDATE Aangepaste_Placeholder ap
            JOIN VersieSectie vs ON ap.aangepaste_sectie_id = vs.aangepaste_sectie_id
            JOIN Versie v ON vs.versie_id = v.versie_id
            SET ap.verkoopsovereenkomst_id = v.verkoopsovereenkomst_id
            WHERE ap.verkoopsovereenkomst_id IS NULL
        `);

        // Add new UNIQUE index
        console.log('Adding new per-agreement unique index...');
        await pool.query('ALTER TABLE Aangepaste_Placeholder ADD UNIQUE KEY unique_agreement_placeholder (verkoopsovereenkomst_id, placeholder_id)');

        // Re-add FKs
        await pool.query('ALTER TABLE Aangepaste_Placeholder ADD CONSTRAINT Aangepaste_Placeholder_ibfk_1 FOREIGN KEY (dossier_id) REFERENCES Dossier(dossier_id) ON DELETE CASCADE');
        await pool.query('ALTER TABLE Aangepaste_Placeholder ADD CONSTRAINT Aangepaste_Placeholder_ibfk_2 FOREIGN KEY (placeholder_id) REFERENCES Placeholder_Library(placeholder_id) ON DELETE CASCADE');
        await pool.query('ALTER TABLE Aangepaste_Placeholder ADD CONSTRAINT fk_ap_agreement FOREIGN KEY (verkoopsovereenkomst_id) REFERENCES Verkoopsovereenkomst(verkoopsovereenkomst_id) ON DELETE CASCADE');

        console.log('Success.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
