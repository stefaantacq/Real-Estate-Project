const { pool } = require('../config/db');

const verifyTemplates = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM Template');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyTemplates();
