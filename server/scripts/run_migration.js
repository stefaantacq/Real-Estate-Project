const { pool } = require("../config/db");

async function runMigration() {
  try {
    console.log("Applying document_id migration to Aangepaste_Placeholder...");
    
    await pool.query(`
      ALTER TABLE Aangepaste_Placeholder 
      ADD COLUMN document_id INT NULL,
      ADD COLUMN bron_text TEXT NULL,
      ADD COLUMN pagina_nummer INT NULL,
      ADD CONSTRAINT fk_aangepaste_placeholder_document
      FOREIGN KEY (document_id) REFERENCES Documenten(document_id) ON DELETE SET NULL;
    `);

    console.log("Migration successful!");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist, skipping.");
      process.exit(0);
    }
    console.error("Error running migration:", err);
    process.exit(1);
  }
}

runMigration();
