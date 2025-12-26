const { pool } = require('../config/db');

async function inspect() {
    try {
        const versions = [3, 6, 7];
        for (const vid of versions) {
            console.log(`\n--- Version ${vid} ---`);
            const [sections] = await pool.query('SELECT a.aangepaste_sectie_id, a.tekst_inhoud, s.titel FROM AangepasteSectie a LEFT JOIN Sectie s ON a.sectie_id = s.sectie_id WHERE a.versie_id = ?', [vid]);

            for (const s of sections) {
                if (s.tekst_inhoud.includes('seller_lastname')) {
                    console.log(`Section "${s.titel}" (ID: ${s.aangepaste_sectie_id}) contains seller_lastname`);
                    // Find the context
                    const index = s.tekst_inhoud.indexOf('seller_lastname');
                    console.log('Context:', s.tekst_inhoud.substring(index - 20, index + 40));
                }
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

inspect();
