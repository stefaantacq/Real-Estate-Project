const { pool } = require('./config/db');
async function run() {
  try {
    const [result] = await pool.query('UPDATE Aangepaste_Placeholder SET coords_json = "[300,300,400,400]" WHERE ingevulde_waarde LIKE "6.250%"');
    console.log('Updated', result.affectedRows, 'rows');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
