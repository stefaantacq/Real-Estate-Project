const { pool } = require('../config/db');

async function testFetch(versie_id) {
    console.log(`\n--- Testing fetch for Version ID: ${versie_id} ---`);
    const [verRows] = await pool.query(`
        SELECT vo.dossier_id, vo.verkoopsovereenkomst_id
        FROM Versie v 
        JOIN Verkoopsovereenkomst vo ON v.verkoopsovereenkomst_id = vo.verkoopsovereenkomst_id 
        WHERE v.versie_id = ?
    `, [versie_id]);

    if (verRows.length === 0) {
        console.log('Version not found.');
        return;
    }

    const dossierId = verRows[0].dossier_id;
    const verkoopsovereenkomstId = verRows[0].verkoopsovereenkomst_id;
    console.log(`Dossier: ${dossierId}, Agreement: ${verkoopsovereenkomstId}`);

    const [sections] = await pool.query(`
        SELECT vs.*, s.titel as title
        FROM VersieSectie vs
        JOIN Sectie s ON vs.sectie_id = s.sectie_id
        WHERE vs.versie_id = ?
        ORDER BY s.volgorde ASC
    `, [versie_id]);

    const [snapshotCheck] = await pool.query(
        'SELECT COUNT(*) as cnt FROM VersiePlaceholder WHERE versie_id = ?',
        [versie_id]
    );
    const hasSnapshots = snapshotCheck[0].cnt > 0;
    console.log(`Has Snapshots: ${hasSnapshots}`);

    for (let section of sections) {
        if (hasSnapshots) {
            const [rows] = await pool.query(`
                SELECT 
                    pl.placeholder_id,
                    pl.sleutel as name,
                    vp.ingevulde_waarde as value,
                    COALESCE(vp.document_id, ap.document_id) as doc_id,
                    COALESCE(vp.bron_text, ap.bron_text) as b_text
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN VersiePlaceholder vp
                    ON pl.placeholder_id = vp.placeholder_id
                    AND vp.versie_id = ?
                    AND vp.aangepaste_sectie_id = ?
                LEFT JOIN Aangepaste_Placeholder ap 
                    ON pl.placeholder_id = ap.placeholder_id 
                    AND ap.verkoopsovereenkomst_id = ?
                WHERE p.sectie_id = ?
            `, [versie_id, section.aangepaste_sectie_id, verkoopsovereenkomstId, section.sectie_id]);
            console.log(`Section ${section.title}: ${rows.length} placeholders (Snapshot mode)`);
            if (rows.length > 0) console.table(rows.slice(0, 3));
        } else {
            const [rows] = await pool.query(`
                SELECT 
                    pl.placeholder_id, 
                    pl.sleutel as name, 
                    ap.ingevulde_waarde as value,
                    ap.document_id as doc_id,
                    ap.bron_text as b_text
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN Aangepaste_Placeholder ap ON pl.placeholder_id = ap.placeholder_id AND ap.verkoopsovereenkomst_id = ?
                WHERE p.sectie_id = ?
            `, [verkoopsovereenkomstId, section.sectie_id]);
            console.log(`Section ${section.title}: ${rows.length} placeholders (Fallback mode)`);
            if (rows.length > 0) console.table(rows.slice(0, 3));
        }
    }
}

async function run() {
    await testFetch(94); // v3.0
    await testFetch(98); // v3.1
    process.exit(0);
}

run();
