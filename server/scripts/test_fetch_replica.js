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
        let placeholders;
        if (hasSnapshots) {
            const [rows] = await pool.query(`
                SELECT 
                    pl.placeholder_id,
                    pl.sleutel as name,
                    pl.type,
                    p.pdf_label,
                    vp.ingevulde_waarde as value,
                    vp.validatiestatus as placeholder_validation_status,
                    COALESCE(vp.document_id, ap.document_id) as document_id,
                    COALESCE(vp.bron_text, ap.bron_text) as bron_text,
                    COALESCE(vp.pagina_nummer, ap.pagina_nummer) as pagina_nummer,
                    COALESCE(d1.bestand_pad, d2.bestand_pad) as document_pad,
                    COALESCE(d1.bestandsnaam, d2.bestandsnaam) as document_naam
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN VersiePlaceholder vp
                    ON pl.placeholder_id = vp.placeholder_id
                    AND vp.versie_id = ?
                    AND vp.aangepaste_sectie_id = ?
                LEFT JOIN Aangepaste_Placeholder ap 
                    ON pl.placeholder_id = ap.placeholder_id 
                    AND ap.verkoopsovereenkomst_id = ?
                LEFT JOIN Documenten d1 ON vp.document_id = d1.document_id
                LEFT JOIN Documenten d2 ON ap.document_id = d2.document_id
                WHERE p.sectie_id = ?
            `, [versie_id, section.aangepaste_sectie_id, verkoopsovereenkomstId, section.sectie_id]);
            placeholders = rows;
        } else {
            const [rows] = await pool.query(`
                SELECT 
                    pl.placeholder_id, 
                    pl.sleutel as name, 
                    pl.type, 
                    p.pdf_label,
                    ap.ingevulde_waarde as value,
                    ap.validatiestatus as placeholder_validation_status,
                    ap.document_id,
                    ap.bron_text,
                    ap.pagina_nummer,
                    d.bestand_pad as document_pad,
                    d.bestandsnaam as document_naam
                FROM Placeholder p
                JOIN Placeholder_Library pl ON p.placeholder_id = pl.placeholder_id
                LEFT JOIN Aangepaste_Placeholder ap ON pl.placeholder_id = ap.placeholder_id AND ap.verkoopsovereenkomst_id = ?
                LEFT JOIN Documenten d ON ap.document_id = d.document_id
                WHERE p.sectie_id = ?
            `, [verkoopsovereenkomstId, section.sectie_id]);
            placeholders = rows;
        }

        const mapped = placeholders.map(p => ({
            id: p.name,
            currentValue: p.value || '',
            documentId: p.document_id || null,
            documentPad: p.document_pad || null
        }));

        console.log(`Section ${section.title}: ${mapped.length} placeholders`);
        if (mapped.length > 0) {
            console.table(mapped.filter(m => m.id.includes('VERKOPER') || m.id.includes('KOPER')).slice(0, 5));
        }
    }
}

async function run() {
    await testFetch(94); // v3.0
    await testFetch(98); // v3.1
    process.exit(0);
}

run();
