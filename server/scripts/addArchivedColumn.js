
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // scripts/../.env = server/.env

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'compromAIs',
    port: process.env.DB_PORT || 3306
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Template' AND COLUMN_NAME = 'is_archived'
        `, [dbConfig.database]);

        if (columns.length === 0) {
            console.log('Adding is_archived column to Template table...');
            await connection.query(`
                ALTER TABLE Template
                ADD COLUMN is_archived BOOLEAN DEFAULT FALSE
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Column is_archived already exists.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
