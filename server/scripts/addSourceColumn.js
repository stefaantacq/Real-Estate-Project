const { pool } = require('../config/db');

const addSourceToTemplates = async () => {
    try {
        console.log("🚀 Starting Schema Migration: Adding 'source' to Template...");

        // 1. Add Column
        try {
            await pool.query("ALTER TABLE Template ADD COLUMN source VARCHAR(50) DEFAULT 'Custom'");
            console.log("✅ Column 'source' added.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ Column 'source' already exists.");
            } else {
                throw err;
            }
        }

        // 2. Update CIB Templates
        const cibIds = [
            'verkoop-vlaanderen-2024',
            'verkoop-brussel-2024',
            'verkoop-wallonie-2024'
        ];

        for (const id of cibIds) {
            await pool.query("UPDATE Template SET source = 'CIB' WHERE ui_id = ?", [id]);
        }
        console.log("✅ CIB templates updated to source='CIB'.");

        // 3. Ensure Custom Templates are 'Custom' (if needed)
        // Default is 'Custom', so new inserts will be fine. 
        // We can explicitely update others if we want, but not strictly needed if default worked.

        process.exit(0);

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
};

addSourceToTemplates();
