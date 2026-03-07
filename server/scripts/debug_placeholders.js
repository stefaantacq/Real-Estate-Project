const { pool } = require('../config/db');

async function debug() {
    try {
        const [versions] = await pool.query('SELECT versie_id, ui_id, versie_nummer, source FROM Versie ORDER BY created_at DESC LIMIT 5');
        const v31 = versions.find(v => v.versie_nummer === '3.1');
        if (v31) {
            console.log(`\n--- VersiePlaceholder for ${v31.versie_nummer} (ID: ${v31.versie_id}) ---`);
            const [vp] = await pool.query(`
                SELECT pl.sleutel, vp.document_id, vp.bron_text, vp.ingevulde_waarde
                FROM VersiePlaceholder vp
                JOIN Placeholder_Library pl ON vp.placeholder_id = pl.placeholder_id
                WHERE vp.versie_id = ?
            `, [v31.versie_id]);
            vp.forEach(p => console.log(`${p.sleutel}: Doc=${p.document_id}, Text=${p.bron_text?.substring(0,15)}, Val=${p.ingevulde_waarde}`));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
