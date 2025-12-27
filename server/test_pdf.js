const { extractTextFromPDF } = require('./services/aiService');
const path = require('path');

async function test() {
    // Use the file from the diagnostic output
    const filePath = path.join(__dirname, 'uploads', '1766847230402-827311304.pdf');
    console.log(`Testing extraction for: ${filePath}`);

    try {
        const text = await extractTextFromPDF(filePath);
        console.log(`--- EXTRACTED TEXT (First 500 chars) ---`);
        console.log(text.substring(0, 500));
        console.log(`\nTotal text length: ${text.length}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
