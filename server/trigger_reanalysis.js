const { pool } = require('./config/db');
const { processDossierDocuments } = require('./controllers/dossierController');

async function run() {
  const dossierId = 27;
  try {
    const [agRows] = await pool.query('SELECT template_id, verkoopsovereenkomst_id FROM Verkoopsovereenkomst WHERE dossier_id = ?', [dossierId]);
    if (agRows.length === 0) throw new Error('Agreement not found for this dossier');
    
    const template_id = agRows[0].template_id;
    const verkoopsovereenkomst_id = agRows[0].verkoopsovereenkomst_id;

    const [docRows] = await pool.query('SELECT document_id as id, bestandsnaam as filename, naam as originalname, bestandstype as mimetype FROM Documenten WHERE dossier_id = ?', [dossierId]);
    
    console.log(`Starting background re-analysis for dossier ${dossierId} with ${docRows.length} files...`);
    // Note: processDossierDocuments handles the loop and Gemini calls
    await processDossierDocuments(dossierId, docRows, null, template_id, verkoopsovereenkomst_id);
    
    console.log('Re-analysis complete. Coordinates should now be in the database.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
