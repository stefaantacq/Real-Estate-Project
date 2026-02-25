require('dotenv').config({ path: './server/.env' });
const { pool } = require('./server/config/db');
async function test() {
    try {
        const [versions] = await pool.query('SELECT v.versie_id, vo.template_id FROM Versie v JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id ORDER BY v.created_at DESC LIMIT 1');
        if (versions.length > 0) {
            const vid = versions[0].versie_id;
            console.log("Latest Version ID:", vid, "Template ID:", versions[0].template_id);
            const [sects] = await pool.query('SELECT COUNT(*) as c FROM VersieSectie WHERE versie_id = ?', [vid]);
            console.log("Sections count:", sects[0].c);
            const [aps] = await pool.query('SELECT COUNT(*) as c FROM Aangepaste_Placeholder ap JOIN VersieSectie vs ON ap.aangepaste_sectie_id = vs.aangepaste_sectie_id WHERE vs.versie_id = ?', [vid]);
            console.log("Placeholders filled:", aps[0].c);
        } else {
            console.log("No versions found");
        }
    } catch(e) { console.error(e); }
    process.exit(0);
}
test();
