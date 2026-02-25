require('dotenv').config({ path: '/Users/stefaantacq/Downloads/Real-Estate-Project/server/.env' });
const mysql = require('mysql2/promise');

async function test() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [versions] = await pool.query('SELECT v.versie_id, v.ui_id, vo.template_id FROM Versie v JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id ORDER BY v.created_at DESC LIMIT 1');
        if (versions.length > 0) {
            const vid = versions[0].versie_id;
            console.log("Latest Version ID:", vid, "ui_id:", versions[0].ui_id, "Template ID:", versions[0].template_id);
            const [sects] = await pool.query('SELECT vs.*, s.titel FROM VersieSectie vs JOIN Sectie s ON vs.sectie_id = s.sectie_id WHERE vs.versie_id = ? ORDER BY s.volgorde ASC', [vid]);
            console.log("Sections count:", sects.length);
            for(let s of sects) {
                console.log(`Section ${s.titel} content length:`, s.tekst_inhoud ? s.tekst_inhoud.length : 'null');
            }
        } else {
            console.log("No versions found");
        }
    } catch(e) { console.error(e); }
    process.exit(0);
}
test();
