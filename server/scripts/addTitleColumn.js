const db = require('../config/db');

async function addTitleColumn() {
    try {
        const [columns] = await db.pool.query('SHOW COLUMNS FROM Template');
        const hasTitle = columns.some(col => col.Field === 'title');

        if (!hasTitle) {
            console.log('Adding title column to Template table...');
            await db.pool.query('ALTER TABLE Template ADD COLUMN title VARCHAR(255) AFTER naam');
            // Populate initial title with name for existing records
            await db.pool.query('UPDATE Template SET title = naam WHERE title IS NULL');
            console.log('Title column added and populated.');
        } else {
            console.log('Title column already exists.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error adding title column:', error);
        process.exit(1);
    }
}

addTitleColumn();
