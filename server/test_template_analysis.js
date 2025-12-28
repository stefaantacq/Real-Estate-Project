const { analyzeTemplate } = require('./services/aiService');
const { pool } = require('./config/db');

async function testAnalysis() {
    const mockText = `
        VERKOOPSOVEREENKOMST
        
        Tussen:
        Naam verkoper: Jan Janssens
        
        En:
        Naam koper: Piet Peeters
        
        Het goed is gelegen te: Kerkstraat 1, 9000 Gent.
        De prijs bedraagt: 300.000 Euro.
    `;

    const [placeholders] = await pool.query('SELECT sleutel, beschrijving, type FROM PlaceholderLibrary LIMIT 20');

    console.log("Testing analyzeTemplate with mock text...");
    try {
        const sections = await analyzeTemplate(mockText, placeholders);
        console.log("Analysis Result:");
        console.log(JSON.stringify(sections, null, 2));

        if (sections.length > 0) {
            console.log("SUCCESS: Sections identified.");
        } else {
            console.log("FAILURE: No sections identified.");
        }
    } catch (error) {
        console.error("Analysis failed:", error);
    }
    process.exit(0);
}

testAnalysis();
