const { pool } = require('./config/db');

async function debug() {
    try {
        const [allTags] = await pool.query('SELECT sleutel FROM PlaceholderLibrary ORDER BY sleutel ASC');
        const keys = allTags.map(t => t.sleutel);

        console.log(`\nTotal tags in Library: ${keys.length}`);

        const dutchTags = ['naam', 'adres', 'prijs', 'datum', 'koper', 'verkoper', 'eigendom', 'ligging'];
        const foundDutch = keys.filter(k => dutchTags.some(d => k.toLowerCase().includes(d)));
        console.log(`\nDutch-looking tags in Library (${foundDutch.length}):`);
        console.log(foundDutch.join(', '));

        console.log('\n--- Checking Old Placeholder Table ---');
        const [oldP] = await pool.query('SELECT COUNT(*) as count FROM Placeholder');
        console.log(`Entries in old Placeholder table: ${oldP[0].count}`);
        if (oldP[0].count > 0) {
            const [sampleOld] = await pool.query('SELECT naam FROM Placeholder LIMIT 20');
            console.log('Sample old tags:', sampleOld.map(p => p.naam).join(', '));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
