const { pool } = require('./config/db');
async function run() {
  try {
    const [rows] = await pool.query('SELECT ingevulde_waarde, coords_json FROM Aangepaste_Placeholder WHERE coords_json IS NOT NULL');
    console.log(`Found ${rows.length} placeholders with coordinates.`);
    if (rows.length > 0) {
      console.log('Sample coordinate data:', JSON.stringify(rows[0]));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
