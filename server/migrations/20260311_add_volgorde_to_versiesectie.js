const { pool } = require('../config/db');

async function migrate() {
  try {
    console.log("Adding 'volgorde' column to VersieSectie...");
    await pool.query("ALTER TABLE VersieSectie ADD COLUMN volgorde INT DEFAULT 0");
    console.log("Migration successful!");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column 'volgorde' already exists, skipping...");
      process.exit(0);
    }
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
