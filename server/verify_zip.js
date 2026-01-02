const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const filesToCheck = [
    'debug_server_export_ver-1767186942682.docx',
    'test_debug_output.docx',
    'curl_test.docx' // Added this
];

filesToCheck.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    console.log(`\nChecking: ${filename}`);

    if (!fs.existsSync(filePath)) {
        console.log("File not found.");
        return;
    }

    try {
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();
        console.log(`- Valid ZIP: Yes (Entries: ${zipEntries.length})`);

        let foundDocXml = false;
        zipEntries.forEach(entry => {
            if (entry.entryName === "word/document.xml") {
                foundDocXml = true;
                console.log("- Found word/document.xml: Yes");
            }
        });

        if (!foundDocXml) {
            console.error("! Critical: word/document.xml missing!");
        } else {
            console.log("Structure seems OK.");
        }

    } catch (e) {
        console.error(`! Invalid ZIP file or corrupt structure: ${e.message}`);
    }
});
