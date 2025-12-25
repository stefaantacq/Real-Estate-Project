const { pool } = require('../config/db');

const seedTemplates = async () => {
    try {
        console.log("🚀 Starting Template Seed (Robust Mode)...");

        // 1. Ensure Table Exists (Hybrid Schema: INT PK for FKs, ui_id for generic access)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Template (
                template_id INT AUTO_INCREMENT PRIMARY KEY,
                naam VARCHAR(255) NOT NULL,
                description TEXT,
                sections JSON,
                is_ai_suggested BOOLEAN DEFAULT FALSE,
                ui_id VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Table 'Template' ensured.");

        // 2. Add missing columns (Safe ALTER) - In case table existed but old schema
        const columnsToAdd = [
            "ADD COLUMN IF NOT EXISTS description TEXT",
            "ADD COLUMN IF NOT EXISTS sections JSON",
            "ADD COLUMN IF NOT EXISTS is_ai_suggested BOOLEAN DEFAULT FALSE",
            "ADD COLUMN IF NOT EXISTS ui_id VARCHAR(50) UNIQUE" // To store our string ID
        ];

        for (const colSql of columnsToAdd) {
            try {
                // MariaDB/MySQL 8 support IF NOT EXISTS in ALTER, but verifying via catch is safer for older versions if unsure.
                // However, standard MySQL syntax for ADD COLUMN doesn't always support IF NOT EXISTS directly in all versions.
                // A safer way is to try-catch the error "Duplicate column name".
                await pool.query(`ALTER TABLE Template ${colSql.replace('IF NOT EXISTS', '')}`);
            } catch (err) {
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    console.warn(`⚠️ Warning altering table: ${err.message}`);
                }
            }
        }
        console.log("✅ Schema updated (columns ensured).");

        // 2. Mock Data
        const templates = [
            {
                ui_id: 'verkoop-vlaanderen-2024',
                name: 'Standaard Verkoopsovereenkomst (Vlaanderen)',
                description: 'Geschikt voor residentiële verkoop in het Vlaamse Gewest.',
                sections: JSON.stringify([]),
                is_ai_suggested: true
            },
            {
                ui_id: 'verkoop-brussel-2024',
                name: 'Compromis de Vente (Bruxelles)',
                description: 'Modeldocument voor verkoop in Brussel (Franstalig).',
                sections: JSON.stringify([]),
                is_ai_suggested: false
            },
            {
                ui_id: 'verkoop-wallonie-2024',
                name: 'Compromis de Vente (Wallonie)',
                description: 'Modeldocument voor verkoop in Wallonië.',
                sections: JSON.stringify([]),
                is_ai_suggested: false
            }
        ];

        // 3. Upsert Data
        // We look up by ui_id. If matches, we update. If not, we insert.
        for (const t of templates) {
            // Check if exists
            const [existing] = await pool.query("SELECT template_id FROM Template WHERE ui_id = ?", [t.ui_id]);

            if (existing.length > 0) {
                // Update
                await pool.query(`
                    UPDATE Template 
                    SET naam = ?, description = ?, sections = ?, is_ai_suggested = ?
                    WHERE ui_id = ?
                `, [t.name, t.description, t.sections, t.is_ai_suggested, t.ui_id]);
            } else {
                // Insert
                await pool.query(`
                    INSERT INTO Template (naam, description, sections, is_ai_suggested, ui_id)
                    VALUES (?, ?, ?, ?, ?)
                `, [t.name, t.description, t.sections, t.is_ai_suggested, t.ui_id]);
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
