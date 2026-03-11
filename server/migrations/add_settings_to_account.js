const { pool } = require('../config/db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Adding settings columns to Account table...');
        
        // Add custom_document_prompt
        try {
            await pool.query('ALTER TABLE Account ADD COLUMN custom_document_prompt TEXT DEFAULT NULL');
            console.log('Added custom_document_prompt to Account table');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME' || e.code === 'ER_DUP_FIELDNAME') {
                console.log('custom_document_prompt column already exists');
            } else {
                throw e;
            }
        }

        // Add custom_template_prompt
        try {
            await pool.query('ALTER TABLE Account ADD COLUMN custom_template_prompt TEXT DEFAULT NULL');
            console.log('Added custom_template_prompt to Account table');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME' || e.code === 'ER_DUP_FIELDNAME') {
                console.log('custom_template_prompt column already exists');
            } else {
                throw e;
            }
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
