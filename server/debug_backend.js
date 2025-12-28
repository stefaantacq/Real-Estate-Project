const { pool } = require('./config/db');
const { extractTextFromPDF, analyzeTemplate } = require('./services/aiService');
const path = require('path');

async function debugCreate() {
    const fileName = '1766926043172-743999837.pdf'; // Latest PDF
    const filePath = path.join(__dirname, 'uploads', fileName);

    console.log('--- DEBUG START ---');
    console.log(`Processing: ${fileName}`);

    try {
        const text = await extractTextFromPDF(filePath);
        console.log(`Extracted text length: ${text?.length || 0}`);

        if (!text || text.trim().length === 0) {
            console.error('Text extraction FAILED');
            return;
        }

        console.log('Fetching library placeholders...');
        const [libraryPlaceholders] = await pool.query('SELECT sleutel, beschrijving, type FROM PlaceholderLibrary');
        console.log(`Found ${libraryPlaceholders.length} placeholders.`);

        console.log('Calling Gemini (analyzeTemplate)...');
        const aiSections = await analyzeTemplate(text, libraryPlaceholders);
        console.log(`AI Result Type: ${typeof aiSections}`);
        console.log(`AI identified ${aiSections?.length || 0} sections.`);

        if (aiSections && aiSections.length > 0) {
            console.log('SUCCESS: Sections found.');
            console.log('First Section Title:', aiSections[0].title);
        } else {
            console.log('FAILURE: AI returned no sections.');
        }

    } catch (error) {
        console.error('CRITICAL ERROR DURING DEBUG:', error);
    }
    process.exit(0);
}

debugCreate();
