const { pool } = require('./server/config/db');

async function check() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM Dossier');
        console.log('Dossiers count:', rows[0].count);

        const [users] = await pool.query('SELECT User, Host FROM mysql.user WHERE User = ?', [process.env.DB_USER || 'willem']);
        console.log('User Host permissions:');
        console.table(users);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
