const { pool } = require('./server/config/db');
require('dotenv').config({ path: './server/.env' });

async function check() {
    try {
        const [vo] = await pool.query('SELECT * FROM Verkoopsovereenkomst ORDER BY created_at DESC LIMIT 1');
        console.log("Last Agreement:", vo);
        if (vo.length > 0) {
            const tempId = vo[0].template_id;
            const [sects] = await pool.query('SELECT * FROM Sectie WHERE template_id = ?', [tempId]);
            console.log("Template Secties count:", sects.length);
            
            const [ver] = await pool.query('SELECT * FROM Versie WHERE verkoopsovereenkomst_id = ?', [vo[0].verkoopsovereenkomst_id]);
            console.log("Versies for this agreement:", ver.length);
            
            if (ver.length > 0) {
                const [vs] = await pool.query('SELECT * FROM VersieSectie WHERE versie_id = ?', [ver[0].versie_id]);
                console.log("VersieSecties count:", vs.length);
            }
        }
    } catch (e) { console.error(e); }
    process.exit();
}
check();
