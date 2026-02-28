const { pool } = require("./config/db");

async function migrate() {
    try {
        console.log("Starting migration: adding account_id to Template table...");
        
        // 1. Add account_id column
        await pool.query("ALTER TABLE Template ADD COLUMN account_id INT AFTER template_id");
        
        // 2. Add foreign key index
        await pool.query("ALTER TABLE Template ADD CONSTRAINT fk_template_account FOREIGN KEY (account_id) REFERENCES Account(account_id) ON DELETE CASCADE");
        
        console.log("Migration successful!");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("account_id column already exists.");
            process.exit(0);
        }
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
