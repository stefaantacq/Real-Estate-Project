const { pool } = require('./config/db');
const { extractTextFromPDF, analyzeDocument } = require('./services/aiService');
const path = require('path');

async function test() {
    try {
        const filePath = path.join(__dirname, 'uploads', '1766925109577-500490637.pdf');

        console.log('--- 1. Extracting Text ---');
        const text = await extractTextFromPDF(filePath);
        console.log(`Extracted ${text.length} characters.`);
        console.log('Text Sample:', text.substring(0, 500));

        console.log('\n--- 2. Getting Tags ---');
        const [pRows] = await pool.query(`
            SELECT pl.sleutel as naam, pl.type, s.titel as section_title
            FROM PlaceholderLibrary pl
            LEFT JOIN SectiePlaceholder sp ON pl.id = sp.placeholder_id
            LEFT JOIN Sectie s ON sp.sectie_id = s.sectie_id
        `);
        const tagsToExtract = Array.from(new Set(pRows.map(r => r.naam)));
        const fieldContexts = pRows.map(r => ({
            naam: r.naam,
            type: r.type,
            section: r.section_title
        }));
        console.log(`Total tags to extract: ${tagsToExtract.length}`);

        console.log('\n--- 3. Running Gemini Analysis ---');
        const result = await analyzeDocument(text, tagsToExtract, null, fieldContexts);

        console.log('\n--- 4. Results ---');
        console.log(JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
