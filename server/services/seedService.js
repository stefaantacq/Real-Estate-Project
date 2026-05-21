const fs = require('fs');
const path = require('path');

const DEMO_ACCOUNT_ID = parseInt(process.env.DEMO_ACCOUNT_ID || '1', 10);
const uploadDir = path.join(__dirname, '../uploads');

async function seedDemoData(newAccountId) {
    const { pool } = require('../config/db');
    console.log(`[Seed] Starting seed for account ${newAccountId} from demo account ${DEMO_ACCOUNT_ID}`);

    // ── Templates ──────────────────────────────────────────────────────────────
    const templateIdMap = {};

    const [demoTemplates] = await pool.query(
        `SELECT * FROM Template WHERE account_id = ? AND source = 'Custom'`,
        [DEMO_ACCOUNT_ID]
    );
    console.log(`[Seed] Found ${demoTemplates.length} template(s) to copy`);

    for (const tmpl of demoTemplates) {
        try {
            const [tRes] = await pool.query(
                `INSERT INTO Template (naam, titel, beschrijving, source, account_id,
                 is_ai_suggested, is_archived, type, created_at)
                 VALUES (?, ?, ?, 'Custom', ?, ?, ?, ?, NOW())`,
                [tmpl.naam, tmpl.titel, tmpl.beschrijving, newAccountId,
                 tmpl.is_ai_suggested || false, tmpl.is_archived || false, tmpl.type || 'House']
            );
            const newTemplateId = tRes.insertId;
            templateIdMap[tmpl.template_id] = newTemplateId;

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
                const [placeholders] = await pool.query(
                    'SELECT * FROM Placeholder WHERE sectie_id = ?',
                    [sec.sectie_id]
                );
                for (const ph of placeholders) {
                    await pool.query(
                        `INSERT INTO Placeholder (sectie_id, placeholder_id, pdf_label)
                         VALUES (?, ?, ?)`,
                        [sRes.insertId, ph.placeholder_id, ph.pdf_label]
                    ).catch(err => console.warn(`[Seed] Placeholder insert skip: ${err.message}`));
                }
            }
            console.log(`[Seed] Copied template "${tmpl.naam}" (${sections.length} sections)`);
        } catch (err) {
            console.error(`[Seed] Failed to copy template ${tmpl.template_id}: ${err.message}`);
        }
    }

    // ── Dossiers ───────────────────────────────────────────────────────────────
    const [demoDossiers] = await pool.query(
        'SELECT * FROM Dossier WHERE account_id = ?',
        [DEMO_ACCOUNT_ID]
    );
    console.log(`[Seed] Found ${demoDossiers.length} dossier(s) to copy`);

    if (demoDossiers.length === 0) {
        console.log('[Seed] No demo dossiers found, skipping dossier seed.');
        return;
    }

    for (const dos of demoDossiers) {
        try {
            const [dRes] = await pool.query(
                `INSERT INTO Dossier (ui_id, account_id, titel, verkoper_naam, adres,
                 status, type, remarks, display_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [uid('dos'), newAccountId, dos.titel, dos.verkoper_naam, dos.adres,
                 dos.status || 'draft', dos.type || 'House', dos.remarks, dos.display_order]
            );
            const newDossierId = dRes.insertId;
            console.log(`[Seed] Created dossier "${dos.titel}" → id ${newDossierId}`);

            // ── Documenten ──────────────────────────────────────────────────────
            const docIdMap = {};
            const [docs] = await pool.query(
                'SELECT * FROM Documenten WHERE dossier_id = ?',
                [dos.dossier_id]
            );
            for (const doc of docs) {
                try {
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
                } catch (err) {
                    console.error(`[Seed] Failed to copy document ${doc.document_id}: ${err.message}`);
                }
            }

            // ── TimelineEvent ────────────────────────────────────────────────────
            const [events] = await pool.query(
                'SELECT * FROM TimelineEvent WHERE dossier_id = ? ORDER BY event_id ASC',
                [dos.dossier_id]
            );
            for (const ev of events) {
                await pool.query(
                    `INSERT INTO TimelineEvent (dossier_id, titel, beschrijving, user_name)
                     VALUES (?, ?, ?, ?)`,
                    [newDossierId, ev.titel, ev.beschrijving, ev.user_name]
                ).catch(err => console.warn(`[Seed] TimelineEvent skip: ${err.message}`));
            }

            // ── Overeenkomsten ───────────────────────────────────────────────────
            const [agreements] = await pool.query(
                'SELECT * FROM Verkoopsovereenkomst WHERE dossier_id = ?',
                [dos.dossier_id]
            );
            for (const agr of agreements) {
                try {
                    const newTemplateId = templateIdMap[agr.template_id] || agr.template_id;

                    const [aRes] = await pool.query(
                        `INSERT INTO Verkoopsovereenkomst (ui_id, dossier_id, template_id, created_at)
                         VALUES (?, ?, ?, NOW())`,
                        [uid('agr'), newDossierId, newTemplateId]
                    );
                    const newAgrId = aRes.insertId;

                    // ── Aangepaste_Placeholder ────────────────────────────────────
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
                        ).catch(err => console.warn(`[Seed] AP skip: ${err.message}`));
                    }

                    // ── Versies ───────────────────────────────────────────────────
                    const [versions] = await pool.query(
                        'SELECT * FROM Versie WHERE verkoopsovereenkomst_id = ?',
                        [agr.verkoopsovereenkomst_id]
                    );
                    for (const ver of versions) {
                        try {
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

                            // ── VersieSectie ──────────────────────────────────────
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
                                ).catch(err => {
                                    console.warn(`[Seed] VersieSectie skip: ${err.message}`);
                                    return [{ insertId: null }];
                                });
                                if (vsRes.insertId) vSectieIdMap[vs.aangepaste_sectie_id] = vsRes.insertId;
                            }

                            // ── VersiePlaceholder ─────────────────────────────────
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
                                ).catch(err => console.warn(`[Seed] VersiePlaceholder skip: ${err.message}`));
                            }
                        } catch (err) {
                            console.error(`[Seed] Failed to copy versie ${ver.versie_id}: ${err.message}`);
                        }
                    }
                } catch (err) {
                    console.error(`[Seed] Failed to copy agreement ${agr.verkoopsovereenkomst_id}: ${err.message}`);
                }
            }
        } catch (err) {
            console.error(`[Seed] Failed to copy dossier ${dos.dossier_id}: ${err.stack}`);
        }
    }

    console.log(`[Seed] Done seeding for account ${newAccountId}`);
}

function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

module.exports = { seedDemoData };
