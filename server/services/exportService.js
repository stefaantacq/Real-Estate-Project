const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');

// User confirmed IP for Collabora
const COLLABORA_HOST = process.env.COLLABORA_HOST || 'http://localhost:9980';
const CONVERT_URL_PDF = `${COLLABORA_HOST}/lool/convert-to/pdf`;

/**
 * Generates DOCX via Pandoc using a reference stylesheet
 */
exports.generateDocx = async (sections, title = 'Document') => {
    // 1. Construct HTML
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
        </head>
        <body>
            <h1>${title}</h1>
    `;

    sections.forEach(section => {
        if (section.title) htmlContent += `<h2>${section.title}</h2>`;

        let content = section.content || '';

        // Replace placeholders with actual values
        if (section.placeholders && section.placeholders.length > 0) {
            section.placeholders.forEach(p => {
                const regex = new RegExp(`\\[placeholder:${p.id}\\]`, 'g');
                // Use currentValue, or fallback to empty string if missing
                const val = p.currentValue || '';
                content = content.replace(regex, val);
            });
        }

        // Cleanup any remaining unresolved placeholders (remove the tag syntax)
        content = content.replace(/\[placeholder:[^\]]+\]/g, '_______');

        // Handle Plain Text newlines for list items
        if (!content.trim().startsWith('<p') && !content.trim().startsWith('<h')) {
            // Convert newlines to breaks to preserve lists
            content = content.replace(/\n/g, '<br/>');
            content = `<p>${content}</p>`;
        }

        htmlContent += content;
        htmlContent += `<br/>`;
    });

    htmlContent += `</body></html>`;

    // 2. Setup paths for temp files and template
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const tempHtmlPath = path.join(os.tmpdir(), `temp_docx_${uniqueId}.html`);
    const tempDocxPath = path.join(os.tmpdir(), `temp_docx_${uniqueId}.docx`);
    
    // Path to the reference docx template
    const templatePath = path.join(__dirname, '..', 'templates', 'CIB_Stylesheet.docx');

    try {
        // 3. Write temp HTML
        await fsPromises.writeFile(tempHtmlPath, htmlContent, 'utf-8');

        // 4. Call Pandoc
        // We check if the template file exists. If so, apply it, else run without
        let command = `pandoc "${tempHtmlPath}" -f html -t docx -o "${tempDocxPath}"`;
        try {
            await fsPromises.access(templatePath);
            // Template exists, use it!
            command += ` --reference-doc="${templatePath}"`;
            console.log("Using Pandoc WITH reference template:", templatePath);
        } catch (err) {
            console.log("Using Pandoc WITHOUT reference template. File not found at:", templatePath);
        }

        await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("Pandoc Execution Error:", stderr);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // 5. Read the resulting DOCX buffer
        const docxBuffer = await fsPromises.readFile(tempDocxPath);
        console.log("Pandoc DOCX generation successful.");
        return docxBuffer;

    } catch (error) {
        console.error("Failed to generate DOCX via Pandoc:", error.message);
        throw new Error("Failed to generate DOCX via Pandoc");
    } finally {
        // 6. Cleanup temp files
        try { await fsPromises.unlink(tempHtmlPath); } catch (e) { }
        try { await fsPromises.unlink(tempDocxPath); } catch (e) { }
    }
};

/**
 * Converts DOCX buffer to PDF via Collabora
 */
exports.convertToPdf = async (docxBuffer) => {
    try {
        console.log("Sending DOCX to Collabora for PDF...");
        const form = new FormData();
        form.append('data', docxBuffer, { filename: 'document.docx' });

        const response = await axios.post(CONVERT_URL_PDF, form, {
            headers: { ...form.getHeaders() },
            responseType: 'arraybuffer'
        });

        console.log("Collabora PDF generation successful.");
        return response.data;
    } catch (error) {
        console.error("Collabora PDF Error:", error.message);
        throw new Error("Failed to generate PDF via Collabora");
    }
};
