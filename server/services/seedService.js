const fs = require('fs');
const path = require('path');

const DEMO_ACCOUNT_ID = 1;
const uploadDir = path.join(__dirname, '../uploads');

async function seedDemoData(newAccountId) {
    const { pool } = require('../config/db');

    // ── Templates ──────────────────────────────────────────────────────────────
    // Copy all Custom templates from the demo account to the new account,
    // including their sections and placeholders.
    const templateIdMap = {}; // old template_id → new template_id

    const [demoTemplates] = await pool.query(
        `SELECT * FROM Template WHERE account_id = ? AND source = 'Custom'`,
        [DEMO_ACCOUNT_ID]
    );

    for (const tmpl of demoTemplates) {
        const [tRes] = await pool.query(
            `INSERT INTO Template (naam, titel, beschrijving, source, account_id,
             is_ai_suggested, is_archived, type, created_at)
             VALUES (?, ?, ?, 'Custom', ?, ?, ?, ?, NOW())`,
            [tmpl.naam, tmpl.titel, tmpl.beschrijving, newAccountId,
             tmpl.is_ai_suggested || false, tmpl.is_archived || false, tmpl.type || 'House']
        );
        const newTemplateId = tRes.insertId;
        templateIdMap[tmpl.template_id] = newTemplateId;

        const sectieIdMap = {};
        const [sections] = await pool.query(
            'SELECT * FROM Sectie WHERE template_id = ? ORDER BY volgorde ASC',
            [tmpl.template_id]
        );
        for (const sec of sections) {
            const [sRes] = await pool.query(
                `INSERT INTO Sectie (template_id, titel, tekst_content, volgorde)
                 VALUES (?, ?, ?, ?)`,
                [newTemplateId, sec.titel, sec.tekst_content, sec.volgorde]
            );
            sectieIdMap[sec.sectie_id] = sRes.insertId;

            const [placeholders] = await pool.query(
                'SELECT * FROM Placeholder WHERE sectie_id = ?',
                [sec.sectie_id]
            );
            for (const ph of placeholders) {
                await pool.query(
                    `INSERT INTO Placeholder (sectie_id, placeholder_id, pdf_label)
                     VALUES (?, ?, ?)`,
                    [sRes.insertId, ph.placeholder_id, ph.pdf_label]
                );
            }
        }
    }

    console.log(`[Seed] Copied ${demoTemplates.length} template(s) for account ${newAccountId}`);

    // ── Dossiers ───────────────────────────────────────────────────────────────
    const [demoDossiers] = await pool.query(
        'SELECT * FROM Dossier WHERE account_id = ?',
        [DEMO_ACCOUNT_ID]
    );

    if (demoDossiers.length === 0) {
        console.log('[Seed] No demo dossiers found, skipping.');
        return;
    }

    for (const dos of demoDossiers) {
        const [dRes] = await pool.query(
            `INSERT INTO Dossier (ui_id, account_id, titel, verkoper_naam, adres,
             datum_aanmaak, archiefstatus, status, type, remarks, display_order)
             VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
            [uid('dos'), newAccountId, dos.titel, dos.verkoper_naam, dos.adres,
             dos.archiefstatus, dos.status, dos.type, dos.remarks, dos.display_order]
        );
        const newDossierId = dRes.insertId;

        // ── Documenten ─────────────────────────────────────────────────────────
        const docIdMap = {};
        const [docs] = await pool.query(
            'SELECT * FROM Documenten WHERE dossier_id = ?',
            [dos.dossier_id]
        );
        for (const doc of docs) {
            const oldFilename = path.basename(doc.bestand_pad || '');
            let newBestandPad = doc.bestand_pad;
            let newBestandsnaam = doc.bestandsnaam || oldFilename;

            if (oldFilename) {
                const src = path.join(uploadDir, oldFilename);
                if (fs.existsSync(src)) {
                    const ext = path.extname(oldFilename);
                    const newFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
                    fs.copyFileSync(src, path.join(uploadDir, newFilename));
                    newBestandPad = `/uploads/${newFilename}`;
                    newBestandsnaam = newFilename;
                }
            }

            const [docRes] = await pool.query(
                `INSERT INTO Documenten (ui_id, dossier_id, naam, bestandsnaam,
                 bestand_pad, bestandstype, document_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [uid('doc'), newDossierId, doc.naam, newBestandsnaam,
                 newBestandPad, doc.bestandstype, doc.document_type]
            );
            docIdMap[doc.document_id] = docRes.insertId;
        }

        // ── TimelineEvent ──────────────────────────────────────────────────────
        const [events] = await pool.query(
            'SELECT * FROM TimelineEvent WHERE dossier_id = ? ORDER BY event_id ASC',
            [dos.dossier_id]
        );
        for (const ev of events) {
            await pool.query(
                `INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name)
                 VALUES (?, ?, ?, ?)`,
                [newDossierId, ev.titel, ev.beschrijving, ev.user_name]
            ).catch(() => {});
        }

        // ── Overeenkomsten ─────────────────────────────────────────────────────
        const [agreements] = await pool.query(
            'SELECT * FROM Verkoopsovereenkomst WHERE dossier_id = ?',
            [dos.dossier_id]
        );
        for (const agr of agreements) {
            // Use the new template copy if one was seeded, otherwise keep original
            const newTemplateId = templateIdMap[agr.template_id] || agr.template_id;

            const [aRes] = await pool.query(
                `INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id, created_at)
                 VALUES (?, ?, ?, NOW())`,
                [uid('agr'), newDossierId, newTemplateId]
            );
            const newAgrId = aRes.insertId;

            // ── Aangepaste_Placeholder ──────────────────────────────────────────
            // INSERT IGNORE: unique constraint is (dossier_id, placeholder_id)
            const [aps] = await pool.query(
                'SELECT * FROM Aangepaste_Placeholder WHERE verkoopsovereenkomst_id = ?',
                [agr.verkoopsovereenkomst_id]
            );
            for (const ap of aps) {
                await pool.query(
                    `INSERT IGNORE INTO Aangepaste_Placeholder
                     (dossier_id, placeholder_id, verkoopsovereenkomst_id,
                      ingevulde_waarde, validatiestatus, document_id, bron_text,
                      pagina_nummer, coords_json, confidence_score,
                      confidence_reasoning, conflicting_sources)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [newDossierId, ap.placeholder_id, newAgrId,
                     ap.ingevulde_waarde, ap.validatiestatus,
                     ap.document_id ? (docIdMap[ap.document_id] || null) : null,
                     ap.bron_text, ap.pagina_nummer, ap.coords_json,
                     ap.confidence_score, ap.confidence_reasoning, ap.conflicting_sources]
                );
            }

            // ── Versies ─────────────────────────────────────────────────────────
            const [versions] = await pool.query(
                'SELECT * FROM Versie WHERE verkoopsovereenkomst_id = ?',
                [agr.verkoopsovereenkomst_id]
            );
            for (const ver of versions) {
                let newFilePath = null;
                if (ver.file_path) {
                    const oldFn = path.basename(ver.file_path);
                    const src = path.join(uploadDir, oldFn);
                    if (fs.existsSync(src)) {
                        const ext = path.extname(oldFn);
                        const newFn = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
                        fs.copyFileSync(src, path.join(uploadDir, newFn));
                        newFilePath = `/uploads/${newFn}`;
                    }
                }

                const [vRes] = await pool.query(
                    `INSERT INTO Versie (ui_id, verkoopsovereenkomst_id, versie_nummer,
                     sections, file_path, source, is_current, is_bookmarked, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [uid('ver'), newAgrId, ver.versie_nummer, ver.sections,
                     newFilePath, ver.source, ver.is_current, ver.is_bookmarked || false]
                );
                const newVerId = vRes.insertId;

                // ── VersieSectie ────────────────────────────────────────────────
                const vSectieIdMap = {};
                const [vSections] = await pool.query(
                    'SELECT * FROM VersieSectie WHERE versie_id = ?',
                    [ver.versie_id]
                );
                for (const vs of vSections) {
                    const [vsRes] = await pool.query(
                        `INSERT INTO VersieSectie (versie_id, sectie_id, tekst_inhoud, validatiestatus)
                         VALUES (?, ?, ?, ?)`,
                        [newVerId, vs.sectie_id, vs.tekst_inhoud, vs.validatiestatus]
                    );
                    vSectieIdMap[vs.aangepaste_sectie_id] = vsRes.insertId;
                }

                // ── VersiePlaceholder ───────────────────────────────────────────
                const [vPhs] = await pool.query(
                    'SELECT * FROM VersiePlaceholder WHERE versie_id = ?',
                    [ver.versie_id]
                );
                for (const vp of vPhs) {
                    await pool.query(
                        `INSERT INTO VersiePlaceholder
                         (versie_id, placeholder_id, aangepaste_sectie_id,
                          ingevulde_waarde, validatiestatus, document_id, bron_text,
                          pagina_nummer, coords_json, confidence_score,
                          confidence_reasoning, conflicting_sources)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [newVerId, vp.placeholder_id,
                         vSectieIdMap[vp.aangepaste_sectie_id] || null,
                         vp.ingevulde_waarde, vp.validatiestatus,
                         vp.document_id ? (docIdMap[vp.document_id] || null) : null,
                         vp.bron_text, vp.pagina_nummer, vp.coords_json,
                         vp.confidence_score, vp.confidence_reasoning, vp.conflicting_sources]
                    );
                }
            }
        }
    }

    console.log(`[Seed] Demo data seeded for account ${newAccountId}`);
}

function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

module.exports = { seedDemoData };
