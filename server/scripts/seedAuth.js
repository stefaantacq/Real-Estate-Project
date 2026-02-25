const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAuth = async () => {
    try {
        console.log('Seeding authentication data...');

        // 1. Clear existing accounts (optional, maybe better to just INSERT IGNORE or UPDATE)
        // For development, we'll just ensure our test users exist

        const testUsers = [
            { name: 'Admin User', email: 'admin@test.be', password: 'password123' },
            { name: 'Willem Verelst', email: 'willemverelst@hotmail.com', password: 'testtest' },
            { name: 'Vincent De Wit', email: 'vincent.dewit@student.kuleuven.be', password: 'testtest' },
            { name: 'Stefaan Tacq', email: 'stefaan.tacq@student.kuleuven.be', password: 'testtest' }
        ];

        for (const user of testUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            // Check if user exists
            const [existing] = await pool.query('SELECT account_id FROM Account WHERE email = ?', [user.email]);

            if (existing.length > 0) {
                console.log(`Updating existing user: ${user.email}`);
                await pool.query(
                    'UPDATE Account SET naam = ?, password_hash = ? WHERE email = ?',
                    [user.name, hashedPassword, user.email]
                );
            } else {
                console.log(`Creating new user: ${user.email}`);
                await pool.query(
                    'INSERT INTO Account (naam, email, password_hash) VALUES (?, ?, ?)',
                    [user.name, user.email, hashedPassword]
                );
            }
        }

        // 2. Migrate existing dossiers from account_id 1 to the new admin account
        const [adminRows] = await pool.query('SELECT account_id FROM Account WHERE email = ?', ['admin@test.be']);
        if (adminRows.length > 0) {
            const adminId = adminRows[0].account_id;
            console.log(`Migrating dossiers from account 1 to admin account (${adminId})...`);
            await pool.query('UPDATE Dossier SET account_id = ? WHERE account_id = 1', [adminId]);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedAuth();
