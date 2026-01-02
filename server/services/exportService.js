const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// User confirmed IP for Collabora
const COLLABORA_HOST = process.env.COLLABORA_HOST || 'http://localhost:9980';
const CONVERT_URL_PDF = `${COLLABORA_HOST}/lool/convert-to/pdf`;
const CONVERT_URL_DOCX = `${COLLABORA_HOST}/lool/convert-to/docx`;

/**
 * Generates DOCX by sending HTML to Collabora.
 * This replaces the buggy 'html-to-docx' library.
 */
exports.generateDocx = async (sections, title = 'Document') => {
    // 1. Construct HTML
    // Collabora (LibreOffice) handles full HTML documents well.
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { font-family: 'Arial', sans-serif; font-size: 11pt; }
                h1 { font-size: 16pt; font-weight: bold; margin-bottom: 12pt; }
                p { margin-bottom: 10pt; }

            </style>
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

    // 2. Send to Collabora
    try {
        console.log(`Sending HTML to Collabora for DOCX (${htmlContent.length} bytes)...`);
        const form = new FormData();
        form.append('data', Buffer.from(htmlContent, 'utf-8'), { filename: 'index.html', contentType: 'text/html' });

        const response = await axios.post(CONVERT_URL_DOCX, form, {
            headers: { ...form.getHeaders() },
            responseType: 'arraybuffer'
        });

        console.log("Collabora DOCX generation successful.");
        return response.data; // This is the valid DOCX buffer
    } catch (error) {
        console.error("Collabora DOCX Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            try { console.error("Body:", error.response.data.toString()) } catch (e) { }
        }
        throw new Error("Failed to generate DOCX via Collabora");
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
