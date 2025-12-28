const { pool } = require('./config/db');

async function check() {
    try {
        const [rows] = await pool.query('SELECT template_id, title, sections FROM Template');
        const allPlaceholders = [];

        for (const row of rows) {
            console.log(`\nTemplate: ${row.title} (ID: ${row.template_id})`);
            const sections = typeof row.sections === 'string' ? JSON.parse(row.sections) : row.sections;
            if (sections) {
                for (const s of sections) {
                    if (s.placeholders) {
                        for (const p of s.placeholders) {
                            console.log(`- ${p.label || p.id} (ID: ${p.id})`);
                            allPlaceholders.push(p.id);
                        }
                    }
                }
            }
        }

        console.log('\n--- Unique Placeholder IDs in Templates ---');
        console.log(JSON.stringify([...new Set(allPlaceholders)], null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
