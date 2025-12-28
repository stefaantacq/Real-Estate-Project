const { pool } = require('./config/db');
const { extractTextFromPDF, analyzeDocument } = require('./services/aiService');
const path = require('path');

async function test() {
    try {
        const filePath = path.join(__dirname, 'uploads', '1766925109577-500490637.pdf');

        console.log('--- 1. Extracting Text ---');
        const text = await extractTextFromPDF(filePath);
        console.log(`Extracted ${text.length} characters.`);

        console.log('\n--- 2. Getting Tags with Consolidation ---');
        const [pRows] = await pool.query(`
            SELECT pl.sleutel as naam, pl.type, s.titel as section_title, sp.pdf_label
            FROM PlaceholderLibrary pl
            LEFT JOIN SectiePlaceholder sp ON pl.id = sp.placeholder_id
            LEFT JOIN Sectie s ON sp.sectie_id = s.sectie_id
        `);

        const consolidatedMap = {};
        for (const row of pRows) {
            if (!consolidatedMap[row.naam]) {
                consolidatedMap[row.naam] = {
                    naam: row.naam,
                    type: row.type,
                    labels: new Set(),
                    sections: new Set()
                };
            }
            if (row.pdf_label) consolidatedMap[row.naam].labels.add(row.pdf_label);
            if (row.section_title) consolidatedMap[row.naam].sections.add(row.section_title);
        }

        const tagsToExtract = Object.keys(consolidatedMap);
        const fieldContexts = Object.values(consolidatedMap).map(ctx => ({
            naam: ctx.naam,
            type: ctx.type,
            label: Array.from(ctx.labels).join(', ') || ctx.naam,
            sections: Array.from(ctx.sections).join(', ') || 'General'
        }));

        console.log(`Total unique tags to extract: ${tagsToExtract.length}`);

        console.log('\n--- 3. Running Gemini Analysis ---');
        const result = await analyzeDocument(text, tagsToExtract, null, fieldContexts);

        console.log('\n--- 4. Results (Non-empty only) ---');
        const found = Object.fromEntries(Object.entries(result).filter(([k, v]) => v && v !== ''));
        console.log(JSON.stringify(found, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
