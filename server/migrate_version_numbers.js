const { pool } = require('./config/db');

async function migrate() {
    try {
        console.log('--- Starting Version Number Migration ---');

        // 1. Get all dossiers
        const [dossiers] = await pool.query('SELECT dossier_id FROM Dossier');
        console.log(`Found ${dossiers.length} dossiers.`);

        for (const dossier of dossiers) {
            console.log(`Processing Dossier ID: ${dossier.dossier_id}`);

            // 2. Get all agreements for this dossier, ordered by creation
            const [agreements] = await pool.query(
                'SELECT overeenkomst_id FROM Verkoopsovereenkomst WHERE dossier_id = ? ORDER BY overeenkomst_id ASC',
                [dossier.dossier_id]
            );

            for (let i = 0; i < agreements.length; i++) {
                const agg = agreements[i];
                const aggIndex = i + 1; // 1, 2, 3...

                // 3. Get all versions for this agreement, ordered by creation
                const [versions] = await pool.query(
                    'SELECT versie_id FROM Versie WHERE overeenkomst_id = ? ORDER BY created_at ASC',
                    [agg.overeenkomst_id]
                );

                console.log(`  Agreement ${agg.overeenkomst_id} (Index ${aggIndex}): ${versions.length} versions.`);

                for (let j = 0; j < versions.length; j++) {
                    const ver = versions[j];
                    const verNum = `${aggIndex}.${j}`; // 1.0, 1.1, 2.0, 2.1...

                    await pool.query(
                        'UPDATE Versie SET versie_nummer = ? WHERE versie_id = ?',
                        [verNum, ver.versie_id]
                    );
                    console.log(`    Updated Version ${ver.versie_id} to ${verNum}`);
                }
            }
        }

        console.log('--- Migration Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
