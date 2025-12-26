const db = require('./config/db');

async function checkConstraints() {
    try {
        const [engines] = await db.pool.query(`
            SELECT TABLE_NAME, ENGINE
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'compromAIs';
        `);
        console.log('Storage Engines:');
        console.table(engines);

        const [vRows] = await db.pool.query(`
            SELECT COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'compromAIs' AND TABLE_NAME = 'Versie' AND REFERENCED_TABLE_NAME IS NOT NULL;
        `);
        console.log('Foreign Keys for Versie:');
        console.table(vRows);

        const [aRows] = await db.pool.query(`
            SELECT COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'compromAIs' AND TABLE_NAME = 'Verkoopsovereenkomst' AND REFERENCED_TABLE_NAME IS NOT NULL;
        `);
        console.log('Foreign Keys for Verkoopsovereenkomst:');
        console.table(aRows);

        process.exit(0);
    } catch (error) {
        console.error('Failed to check constraints:', error);
        process.exit(1);
    }
}

checkConstraints();
