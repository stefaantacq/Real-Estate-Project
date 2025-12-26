const db = require('./config/db');

async function checkData() {
    try {
        console.log('--- Data Integrity Check ---');

        const [dossiers] = await db.pool.query('SELECT dossier_id, titel FROM Dossier');
        console.log('\nDossiers:');
        console.table(dossiers);

        const [agreements] = await db.pool.query('SELECT overeenkomst_id, dossier_id, ui_id, template_id FROM Verkoopsovereenkomst');
        console.log('\nAgreements (Verkoopsovereenkomst):');
        console.table(agreements);

        const [versions] = await db.pool.query('SELECT versie_id, overeenkomst_id, ui_id, versie_nummer FROM Versie');
        console.log('\nVersions (Versie):');
        console.table(versions);

        process.exit(0);
    } catch (error) {
        console.error('Failed to check data:', error);
        process.exit(1);
    }
}

checkData();
