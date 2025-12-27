const { pool } = require('./config/db');

async function checkStatus() {
    try {
        console.log('--- Most Recent Dossier Timeline ---');
        const [dossiers] = await pool.query('SELECT dossier_id, titel FROM Dossier ORDER BY dossier_id DESC LIMIT 1');
        if (dossiers.length === 0) {
            console.log('No dossiers found.');
            process.exit(0);
        }
        const dossierId = dossiers[0].dossier_id;
        console.log(`Dossier: ${dossiers[0].titel} (ID: ${dossierId})`);

        const [events] = await pool.query('SELECT title, description, event_date FROM TimelineEvent WHERE dossier_id = ? ORDER BY event_date ASC', [dossierId]);
        events.forEach(e => console.log(`[${e.event_date}] ${e.title}: ${e.description}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStatus();
