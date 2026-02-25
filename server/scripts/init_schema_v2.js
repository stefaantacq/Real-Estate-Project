const { pool } = require("../config/db");

async function initSchema() {
  try {
    console.log("Dropping existing tables to apply the new consistent 4-tier schema...");

    await pool.query("SET FOREIGN_KEY_CHECKS = 0");

    const tables = [
      "Waarde",
      "Aangepaste_Placeholder",
      "VersieSectie",
      "Versie",
      "Verkoopsovereenkomst",
      "Documenten",
      "Placeholder",
      "Sectie",
      "Template",
      "Placeholder_Library",
      "Dossier",
      "Provider",
      "Account",
      "TimelineEvent"
    ];

    for (const table of tables) {
      await pool.query(`DROP TABLE IF EXISTS ${table}`);
    }

    console.log("Creating new tables...");

    await pool.query(`
        CREATE TABLE Account (
            account_id INT AUTO_INCREMENT PRIMARY KEY,
            naam VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password_hash VARCHAR(255),
            rol VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE Provider (
            provider_id INT AUTO_INCREMENT PRIMARY KEY,
            naam VARCHAR(255),
            api_key VARCHAR(255),
            support_email VARCHAR(255)
        )
    `);

    await pool.query(`
        CREATE TABLE Template (
            template_id INT AUTO_INCREMENT PRIMARY KEY,
            naam VARCHAR(255),
            titel VARCHAR(255),
            auteur VARCHAR(255),
            rating DECIMAL(3,2),
            beschrijving TEXT,
            sections_json JSON,
            is_ai_suggested BOOLEAN DEFAULT FALSE,
            is_archived BOOLEAN DEFAULT FALSE,
            source VARCHAR(50) DEFAULT 'Custom',
            type VARCHAR(50) DEFAULT 'House',
            ui_id VARCHAR(50) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE Placeholder_Library (
            placeholder_id INT AUTO_INCREMENT PRIMARY KEY,
            sleutel VARCHAR(100) UNIQUE,
            beschrijving TEXT,
            type VARCHAR(50)
        )
    `);

    await pool.query(`
        CREATE TABLE Dossier (
            dossier_id INT AUTO_INCREMENT PRIMARY KEY,
            ui_id VARCHAR(50) UNIQUE,
            account_id INT,
            titel VARCHAR(255),
            verkoper_naam VARCHAR(255),
            adres VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'draft',
            type VARCHAR(50) DEFAULT 'House',
            remarks TEXT,
            last_opened TIMESTAMP NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            display_order INT DEFAULT 0,
            FOREIGN KEY (account_id) REFERENCES Account(account_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE Sectie (
            sectie_id INT AUTO_INCREMENT PRIMARY KEY,
            template_id INT,
            titel VARCHAR(255),
            tekst_content TEXT,
            volgorde INT DEFAULT 0,
            FOREIGN KEY (template_id) REFERENCES Template(template_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE TimelineEvent (
            timeline_event_id INT AUTO_INCREMENT PRIMARY KEY,
            ui_id VARCHAR(50) UNIQUE,
            dossier_id INT NOT NULL,
            event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            titel VARCHAR(255),
            beschrijving TEXT,
            user_name VARCHAR(255),
            FOREIGN KEY (dossier_id) REFERENCES Dossier(dossier_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE Documenten (
            document_id INT AUTO_INCREMENT PRIMARY KEY,
            ui_id VARCHAR(50) UNIQUE,
            dossier_id INT,
            naam VARCHAR(255),
            bestandsnaam VARCHAR(255),
            bestand_pad VARCHAR(500),
            bestandstype VARCHAR(100),
            document_type VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dossier_id) REFERENCES Dossier(dossier_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE Verkoopsovereenkomst (
            verkoopsovereenkomst_id INT AUTO_INCREMENT PRIMARY KEY,
            ui_id VARCHAR(50) UNIQUE,
            dossier_id INT,
            template_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dossier_id) REFERENCES Dossier(dossier_id) ON DELETE CASCADE,
            FOREIGN KEY (template_id) REFERENCES Template(template_id) ON DELETE SET NULL
        )
    `);

    await pool.query(`
        CREATE TABLE Placeholder (
            placeholder_link_id INT AUTO_INCREMENT PRIMARY KEY,
            sectie_id INT,
            placeholder_id INT,
            pdf_label VARCHAR(255),
            FOREIGN KEY (sectie_id) REFERENCES Sectie(sectie_id) ON DELETE CASCADE,
            FOREIGN KEY (placeholder_id) REFERENCES Placeholder_Library(placeholder_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE Versie (
            versie_id INT AUTO_INCREMENT PRIMARY KEY,
            ui_id VARCHAR(50) UNIQUE,
            verkoopsovereenkomst_id INT,
            versie_nummer VARCHAR(50),
            file_path VARCHAR(255),
            is_current BOOLEAN DEFAULT TRUE,
            source VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (verkoopsovereenkomst_id) REFERENCES Verkoopsovereenkomst(verkoopsovereenkomst_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE VersieSectie (
            aangepaste_sectie_id INT AUTO_INCREMENT PRIMARY KEY,
            versie_id INT,
            sectie_id INT,
            tekst_inhoud TEXT,
            validatiestatus VARCHAR(50),
            FOREIGN KEY (versie_id) REFERENCES Versie(versie_id) ON DELETE CASCADE,
            FOREIGN KEY (sectie_id) REFERENCES Sectie(sectie_id) ON DELETE SET NULL
        )
    `);

    await pool.query(`
        CREATE TABLE Aangepaste_Placeholder (
            aangepaste_placeholder_id INT AUTO_INCREMENT PRIMARY KEY,
            dossier_id INT,
            placeholder_id INT,
            aangepaste_sectie_id INT,
            ingevulde_waarde TEXT,
            validatiestatus VARCHAR(50),
            FOREIGN KEY (dossier_id) REFERENCES Dossier(dossier_id) ON DELETE CASCADE,
            FOREIGN KEY (placeholder_id) REFERENCES Placeholder_Library(placeholder_id) ON DELETE CASCADE,
            FOREIGN KEY (aangepaste_sectie_id) REFERENCES VersieSectie(aangepaste_sectie_id) ON DELETE CASCADE
        )
    `);

    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Database schema successfully applying!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating schema:", err);
    process.exit(1);
  }
}

initSchema();
