const { pool } = require('../config/db');
const axios = require('axios');

async function testSave() {
    try {
        const v30_ui_id = 'ver-1772803865309';
        
        // 1. Get the current sections of v3.0
        // We'll mimic the frontend logic
        console.log(`Fetching version ${v30_ui_id}...`);
        
        // Use the internal function to get sections
        const [rows] = await pool.query('SELECT versie_id FROM Versie WHERE ui_id = ?', [v30_ui_id]);
        const versieId = rows[0].versie_id;
        
        // Using a manual query because I can't easily import fetchFullVersionContent
        const [sections] = await pool.query(`
            SELECT vs.*, s.titel as title
            FROM VersieSectie vs
            JOIN Sectie s ON vs.sectie_id = s.sectie_id
            WHERE vs.versie_id = ?
        `, [versieId]);

        for (let s of sections) {
             const [placeholders] = await pool.query(`
                SELECT pl.sleutel as name, ap.ingevulde_waarde, ap.document_id, ap.bron_text
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN Aangepaste_Placeholder ap ON pl.placeholder_id = ap.placeholder_id
                WHERE p.sectie_id = ?
            `, [s.sectie_id]);
            s.placeholders = placeholders.map(p => ({
                id: p.name,
                currentValue: p.ingevulde_waarde || '',
                documentId: p.document_id,   // Frontend uses camelCase
                bronText: p.bron_text
            }));
            s.content = s.tekst_inhoud;
        }

        console.log('--- Sample Placeholder before save ---');
        console.log(sections[0]?.placeholders[0]);

        // 2. Call the updateVersion API (via axios to local server)
        // Note: We need a VALID JWT token for req.user access.
        // Actually, we can call the controller function DIRECTLY in JS!
        
        const req = {
            params: { id: v30_ui_id },
            body: sections,
            user: { id: 1, naam: 'Test User' } // Mock user
        };
        const res = {
            status: (code) => ({ json: (data) => console.log(`[Response ${code}]`, data) }),
            json: (data) => console.log('[Response 200]', data)
        };

        const dossierController = require('../controllers/dossierController');
        console.log('\nCalling updateVersion...');
        await dossierController.updateVersion(req, res);

        console.log('\n--- Checking metadata in newest version ---');
        const [newest] = await pool.query('SELECT versie_id, versie_nummer FROM Versie ORDER BY created_at DESC LIMIT 1');
        const [vp] = await pool.query(`
            SELECT pl.sleutel, vp.document_id, vp.bron_text
            FROM VersiePlaceholder vp
            JOIN Placeholder_Library pl ON vp.placeholder_id = pl.placeholder_id
            WHERE vp.versie_id = ?
        `, [newest.versie_id]);
        
        console.log(`Version ${newest.versie_nummer} metadata:`);
        vp.slice(0, 5).forEach(p => console.log(`${p.sleutel}: Doc=${p.document_id}, Text=${p.bron_text?.substring(0,15)}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testSave();
