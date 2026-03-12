const { pool } = require('./config/db');
async function run() {
  try {
    const [rows] = await pool.query(`
        SELECT pl.sleutel, p.pdf_label, s.titel as section
        FROM Placeholder_Library pl
        JOIN Placeholder p ON pl.placeholder_id = p.placeholder_id
        JOIN Sectie s ON p.sectie_id = s.sectie_id
        WHERE pl.sleutel LIKE "%soil%" OR pl.sleutel LIKE "%bodem%"
    `);
    console.log(JSON.stringify(rows));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
