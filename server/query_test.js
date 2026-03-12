const { pool } = require('./config/db');
async function run() {
  try {
    const [rows] = await pool.query('SELECT sleutel, beschrijving FROM Placeholder_Library WHERE sleutel LIKE "%soil%" OR sleutel LIKE "%bodem%"');
    console.log(JSON.stringify(rows));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
