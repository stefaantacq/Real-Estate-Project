const { pool } = require('./config/db');
const { fetchFullVersionContent } = require('./controllers/dossierController');

async function test() {
    console.log("Fetching version 98 (has NULL in VersiePlaceholder)");
    const v98 = await fetchFullVersionContent(98);
    console.log("v98 first placeholder doc ID:", v98[0]?.placeholders[0]);
    
    console.log("Fetching version 99");
    const v99 = await fetchFullVersionContent(99);
    console.log("v99 first placeholder doc ID:", v99[0]?.placeholders[0]);
    
    process.exit(0);
}
test();
