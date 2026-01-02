const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspectList() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [dossiers] = await connection.execute(`SELECT dossier_id FROM Dossier WHERE verkoper_naam LIKE '%Janssens%' OR titel LIKE '%Janssens%'`);
        if (dossiers.length === 0) return console.log("Dossier not found");
        const dossierId = dossiers[0].dossier_id;

        const [agreements] = await connection.execute(`SELECT overeenkomst_id FROM Verkoopsovereenkomst WHERE dossier_id = ?`, [dossierId]);
        const agreementId = agreements[0].overeenkomst_id;

        const [versions] = await connection.execute(`SELECT * FROM Versie WHERE overeenkomst_id = ? ORDER BY created_at DESC LIMIT 1`, [agreementId]);
        const versionId = versions[0].versie_id;
        console.log(`Checking Version ID: ${versionId}`);

        const [rows] = await connection.execute(`
            SELECT tekst_inhoud 
            FROM AangepasteSectie a
            JOIN Sectie s ON a.sectie_id = s.sectie_id
            WHERE a.versie_id = ? AND (s.titel LIKE '%Stedenbouw%' OR a.tekst_inhoud LIKE '%1°%')
        `, [versionId]);

        if (rows.length === 0) {
            console.log("Section not found");
            return;
        }

        const content = rows[0].tekst_inhoud;

        // Find position of "1° bouwen"
        const index = content.indexOf('1° bouwen');
        if (index === -1) {
            console.log("Could not find '1°' in content.");
            console.log("First 200 chars:", content.substring(0, 200));
        } else {
            console.log("--- MARKUP AROUND '1°' ---");
            // Show 100 chars before and 300 after
            const start = Math.max(0, index - 100);
            const end = Math.min(content.length, index + 300);
            console.log(content.substring(start, end));
            console.log("--------------------------");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

inspectList();
