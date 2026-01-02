const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const COLLABORA_URL = 'http://192.168.0.111:9980/lool/convert-to/docx';

async function testCollabora() {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
        <h1>Hello from Collabora</h1>
        <p>This DOCX was generated directly from HTML by LibreOffice.</p>
    </body>
    </html>`;

    try {
        const form = new FormData();
        // sending 'index.html' filename hints to LibreOffice that it is HTML
        form.append('data', Buffer.from(htmlContent, 'utf-8'), { filename: 'index.html', contentType: 'text/html' });

        console.log(`Sending HTML to ${COLLABORA_URL}...`);
        const response = await axios.post(COLLABORA_URL, form, {
            headers: { ...form.getHeaders() },
            responseType: 'arraybuffer'
        });

        console.log("Response received. Length:", response.data.length);
        fs.writeFileSync('collabora_test.docx', response.data);
        console.log("Saved collabora_test.docx");

    } catch (e) {
        console.error("Collabora Error:", e);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data.toString());
        }
    }
}

testCollabora();
