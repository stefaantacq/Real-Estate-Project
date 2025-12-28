const { pool } = require('./server/config/db');

async function debug() {
    try {
        console.log('--- PlaceholderLibrary Sample ---');
        const [lib] = await pool.query('SELECT * FROM PlaceholderLibrary LIMIT 10');
        console.table(lib);

        console.log('\n--- SectiePlaceholder Sample ---');
        const [sp] = await pool.query('SELECT * FROM SectiePlaceholder LIMIT 10');
        console.table(sp);

        console.log('\n--- AI Extraction Query Test ---');
        const [pRows] = await pool.query(`
            SELECT pl.sleutel as naam, pl.type, s.titel as section_title
            FROM PlaceholderLibrary pl
            JOIN SectiePlaceholder sp ON pl.id = sp.placeholder_id
            JOIN Sectie s ON sp.sectie_id = s.sectie_id
        `);
        console.log(`Found ${pRows.length} placeholder links.`);
        if (pRows.length > 0) {
            console.log('Sample tags:', pRows.slice(0, 5).map(r => r.naam).join(', '));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
