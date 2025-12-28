const { pool } = require('./config/db');

async function testDuplicate() {
    try {
        console.log('Testing duplicate insertion into SectiePlaceholder...');

        // 1. Create a dummy template
        const [tResult] = await pool.query('INSERT INTO Template (naam) VALUES (?)', ['Duplicate Test Template']);
        const templateId = tResult.insertId;

        // 2. Create a dummy section
        const [sResult] = await pool.query('INSERT INTO Sectie (template_id, titel) VALUES (?, ?)', [templateId, 'Test Section']);
        const sectieId = sResult.insertId;

        // 3. Get or create a placeholder
        const [pRows] = await pool.query('SELECT id FROM PlaceholderLibrary LIMIT 1');
        const placeholderId = pRows[0].id;

        console.log(`Inserting placeholder ${placeholderId} into section ${sectieId} twice...`);

        // 4. First insert
        await pool.query('INSERT INTO SectiePlaceholder (sectie_id, placeholder_id) VALUES (?, ?)', [sectieId, placeholderId]);
        console.log('First insert success.');

        // 5. Second insert (should fail)
        await pool.query('INSERT INTO SectiePlaceholder (sectie_id, placeholder_id) VALUES (?, ?)', [sectieId, placeholderId]);
        console.log('Second insert success (this is unexpected!).');

        process.exit(0);
    } catch (error) {
        console.error('CAUGHT EXPECTED ERROR:', error.message);
        process.exit(0);
    }
}

testDuplicate();
