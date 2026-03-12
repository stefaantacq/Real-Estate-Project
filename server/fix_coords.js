const { pool } = require('./config/db');
async function run() {
  try {
    await pool.query('UPDATE Aangepaste_Placeholder SET coords_json = "[923,591,945,672]" WHERE ingevulde_waarde LIKE "6.250%"');
    await pool.query('UPDATE VersiePlaceholder SET coords_json = "[923,591,945,672]" WHERE ingevulde_waarde LIKE "6.250%"');
    console.log('Fixed coords in DB');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
