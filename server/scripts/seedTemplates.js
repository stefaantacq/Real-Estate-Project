const { pool } = require('../config/db');

const seedTemplates = async () => {
    try {
        console.log("🚀 Starting Template Seed (Robust Mode)...");

        const templates = [
            {
                ui_id: 'verkoop-vlaanderen-2024',
                naam: 'Standaard Verkoopsovereenkomst (Vlaanderen)',
                titel: 'Standaard Verkoopsovereenkomst (Vlaanderen)',
                beschrijving: 'Geschikt voor residentiële verkoop in het Vlaamse Gewest.',
                sections_json: JSON.stringify([]),
                is_ai_suggested: true
            },
            {
                ui_id: 'verkoop-brussel-2024',
                naam: 'Compromis de Vente (Bruxelles)',
                titel: 'Compromis de Vente (Bruxelles)',
                beschrijving: 'Modeldocument voor verkoop in Brussel (Franstalig).',
                sections_json: JSON.stringify([]),
                is_ai_suggested: false
            },
            {
                ui_id: 'verkoop-wallonie-2024',
                naam: 'Compromis de Vente (Wallonie)',
                titel: 'Compromis de Vente (Wallonie)',
                beschrijving: 'Modeldocument voor verkoop in Wallonië.',
                sections_json: JSON.stringify([]),
                is_ai_suggested: false
            }
        ];

        for (const t of templates) {
            const [existing] = await pool.query("SELECT template_id FROM Template WHERE ui_id = ?", [t.ui_id]);

            if (existing.length > 0) {
                await pool.query(`
                    UPDATE Template 
                    SET naam = ?, titel = ?, beschrijving = ?, sections_json = ?, is_ai_suggested = ?
                    WHERE ui_id = ?
                `, [t.naam, t.titel, t.beschrijving, t.sections_json, t.is_ai_suggested, t.ui_id]);
            } else {
                await pool.query(`
                    INSERT INTO Template (naam, titel, beschrijving, sections_json, is_ai_suggested, ui_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [t.naam, t.titel, t.beschrijving, t.sections_json, t.is_ai_suggested, t.ui_id]);
            }
        }

        console.log(`✅ Seeded ${templates.length} templates successfully.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedTemplates();
