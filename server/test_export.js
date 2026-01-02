const exportService = require('./services/exportService');
const fs = require('fs');
const path = require('path');

async function testHelp() {
    try {
        const debugHtmlPath = path.join(__dirname, 'debug_last_export.html');
        if (fs.existsSync(debugHtmlPath)) {
            console.log("Reading real failing HTML from debug_last_export.html...");
            const htmlContent = fs.readFileSync(debugHtmlPath, 'utf8');

            // We need to simulate how the service options are set
            // The service sets options internally, but we're calling generateDocx?
            // Wait, exportService.generateDocx TAKES the sections array, constructs HTML.
            // We want to test the HTML-to-buffer part.
            // We can't easily call exportService.generateDocx with raw HTML because it expects sections. 
            // So we will use HTMLtoDOCX directly here to verify the LIBRARY's behavior with this HTML.

            const HTMLtoDOCX = require('html-to-docx');
            const options = {
                table: { row: { cantSplit: true } },
                margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            };

            console.log("Generating DOCX from debug HTML...");
            const buffer = await HTMLtoDOCX(htmlContent, null, options);
            fs.writeFileSync('test_debug_output.docx', buffer);
            console.log("Saved test_debug_output.docx from real HTML.");
        } else {
            console.log("No debug content found. Running mock test.");
            const mockSections = [
                { title: "Test", content: "<p>Simple text</p>" }
            ];
            await exportService.generateDocx(mockSections, "Test");
        }
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testHelp();
