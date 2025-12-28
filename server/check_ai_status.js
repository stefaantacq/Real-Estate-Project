const { pool } = require('./config/db');

async function checkStatus() {
    try {
        console.log('--- Most Recent Dossier ---');
        const [dossiers] = await pool.query('SELECT dossier_id, titel, last_modified FROM Dossier ORDER BY dossier_id DESC LIMIT 1');
        if (dossiers.length === 0) {
            console.log('No dossiers found.');
            process.exit(0);
        }
        const dossierId = dossiers[0].dossier_id;
        console.log(`Dossier: ${dossiers[0].titel} (ID: ${dossierId}) Created: ${dossiers[0].created_at}`);

        console.log('\n--- Documents for this Dossier ---');
        const [docs] = await pool.query('SELECT naam, bestand_pad FROM Documenten WHERE dossier_id = ?', [dossierId]);
        docs.forEach(d => console.log(`- ${d.naam} (${d.bestand_pad})`));

        console.log('\n--- Timeline Events ---');
        const [events] = await pool.query('SELECT title, description, event_date FROM TimelineEvent WHERE dossier_id = ? ORDER BY event_date ASC', [dossierId]);
        events.forEach(e => console.log(`[${e.event_date}] ${e.title}: ${e.description}`));

        console.log('\n--- Placeholders with Values (Non-empty) ---');
        const [placeholders] = await pool.query(`
            SELECT pl.sleutel as naam, ap.ingevulde_waarde
            FROM AangepastePlaceholder ap
            JOIN PlaceholderLibrary pl ON ap.placeholder_id = pl.id
            WHERE ap.dossier_id = ? AND ap.ingevulde_waarde IS NOT NULL AND ap.ingevulde_waarde != ''
        `, [dossierId]);
        placeholders.forEach(p => console.log(`- ${p.naam}: ${p.ingevulde_waarde}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStatus();
