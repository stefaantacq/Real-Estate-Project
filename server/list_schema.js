const db = require('./config/db');

async function listSchema() {
    try {
        const [tables] = await db.pool.query('SHOW TABLES');
        const dbName = 'compromAIs'; // Based on check_db.js
        const tableKey = `Tables_in_${dbName}`;
        
        for (const tableRow of tables) {
            const tableName = tableRow[tableKey] || Object.values(tableRow)[0];
            console.log(`\nTable: ${tableName}`);
            const [columns] = await db.pool.query(`SHOW COLUMNS FROM ${tableName}`);
            console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key, Default: c.Default, Extra: c.Extra })));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Failed to list schema:', error);
        process.exit(1);
    }
}

listSchema();
