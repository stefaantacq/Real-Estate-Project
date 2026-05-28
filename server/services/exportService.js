const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// User confirmed IP for Collabora
const COLLABORA_HOST = process.env.COLLABORA_HOST || 'http://localhost:9980';
const CONVERT_URL_PDF = `${COLLABORA_HOST}/lool/convert-to/pdf`;

/**
 * Generates DOCX via html-to-docx from section content with filled placeholder values.
 */
exports.generateDocx = async (sections, title = 'Document') => {
    const HTMLtoDOCX = require('html-to-docx');

    let htmlContent = `<h1>${title}</h1>`;

    sections.forEach(section => {
        if (section.title) htmlContent += `<h2>${section.title}</h2>`;

        let content = section.content || '';

        if (section.placeholders && section.placeholders.length > 0) {
            section.placeholders.forEach(p => {
                const regex = new RegExp(`\\[placeholder:${p.id}\\]`, 'g');
                const val = p.currentValue || '';
                content = content.replace(regex, val);
            });
        }

        content = content.replace(/\[placeholder:[^\]]+\]/g, '_______');

        if (!content.trim().startsWith('<p') && !content.trim().startsWith('<h')) {
            content = content.replace(/\n/g, '<br/>');
            content = `<p>${content}</p>`;
        }

        htmlContent += content + '<p></p>';
    });

    const docxBuffer = await HTMLtoDOCX(htmlContent, null, {
        title,
        lang: 'nl-BE',
        orientation: 'portrait',
    });

    console.log('html-to-docx generation successful.');
    return docxBuffer;
};

/**
 * Patches a DOCX file by replacing AI-identified original_text values with {sleutel} tags.
 *
 * Two-tier strategy:
 *   Tier 1 — unique original_text: safe to replace globally (all occurrences at once).
 *   Tier 2 — shared original_text (same text maps to multiple ids, e.g. both parties share a name):
 *             use left-context from section.content + a per-id cursor to match the right paragraph.
 *
 * @param {string} docxPath  - absolute path to the .docx file to patch (modified in place)
 * @param {Array}  sections  - AI section array: [{ content, placeholders: [{ id, original_text }] }]
 */
exports.patchDocxWithPlaceholders = async (docxPath, sections) => {
    const AdmZip = require('adm-zip');

    function xmlEncode(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }
    function escapeRegex(str) {
        return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    }
    function extractParaText(paraXml) {
        return (paraXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [])
            .map(m => m.replace(/<[^>]+>/g, '')).join('');
    }
    function replaceFirstInParaXml(paraXml, xmlEncOriginal, id) {
        const tag = '{' + id + '}';
        const pattern = new RegExp(
            '(<w:t[^>]*>)([^<]*?)(' + escapeRegex(xmlEncOriginal) + ')([^<]*?)(<\\/w:t>)'
        );
        return paraXml.replace(pattern, (_, open, before, _found, after, close) =>
            open + before + tag + after + close
        );
    }

    const zip = new AdmZip(docxPath);
    const entry = zip.getEntry('word/document.xml');
    if (!entry) throw new Error('word/document.xml not found in DOCX');
    let xml = entry.getData().toString('utf8');

    // Build map: original_text → Set<id> to detect uniqueness
    const textToIds = new Map();
    for (const section of sections) {
        for (const { id, original_text } of (section.placeholders || [])) {
            if (!id || !original_text?.trim()) continue;
            const key = original_text.trim();
            if (!textToIds.has(key)) textToIds.set(key, new Set());
            textToIds.get(key).add(id);
        }
    }

    // --- TIER 1: unique original_text → global replace (all occurrences at once) ---
    // Minimum 4 characters: single letters/digits appear inside other words and corrupt the document.
    const handledGlobally = new Set();
    for (const [key, ids] of textToIds) {
        if (ids.size !== 1) continue;
        if (key.length < 4) continue; // too short → handle via Tier 2 with context
        const [id] = [...ids];
        const xmlEncOriginal = xmlEncode(key);
        const escaped = escapeRegex(xmlEncOriginal);
        xml = xml.replace(
            new RegExp('(<w:t[^>]*>[^<]*?)' + escaped + '([^<]*?<\\/w:t>)', 'g'),
            (_, before, after) => before + '{' + id + '}' + after
        );
        handledGlobally.add(key);
    }

    // --- TIER 2: shared original_text → context + per-id cursor ---
    const paragraphs = xml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];
    const scanCursors = {};
    let applied = 0, skippedNoMatch = 0, skippedSplitRun = 0;

    for (const section of sections) {
        for (const { id, original_text } of (section.placeholders || [])) {
            if (!id || !original_text?.trim()) continue;
            const trimmed = original_text.trim();
            if (handledGlobally.has(trimmed)) continue;

            const xmlEncOriginal = xmlEncode(trimmed);
            const tagMarker = '[placeholder:' + id + ']';
            const tagIndex = (section.content || '').indexOf(tagMarker);
            let leftContext = '';
            if (tagIndex > 0) {
                const before = section.content.slice(0, tagIndex)
                    .replace(/\[placeholder:[^\]]+\]/g, '');
                leftContext = before.slice(-20);
            }

            const startIdx = (scanCursors[id] ?? -1) + 1;
            let matched = false;

            for (let i = startIdx; i < paragraphs.length; i++) {
                const paraText = extractParaText(paragraphs[i]);
                const hit = leftContext
                    ? paraText.includes(leftContext + trimmed)
                    : paraText.includes(trimmed);
                if (!hit) continue;

                const patched = replaceFirstInParaXml(paragraphs[i], xmlEncOriginal, id);
                if (patched === paragraphs[i]) {
                    console.warn(`[DOCX PATCH] Split-run voor "${id}": "${trimmed}"`);
                    skippedSplitRun++;
                } else {
                    xml = xml.replace(paragraphs[i], patched);
                    paragraphs[i] = patched;
                    scanCursors[id] = i;
                    applied++;
                }
                matched = true;
                break;
            }
            if (!matched) {
                console.warn(`[DOCX PATCH] Geen match voor "${id}": "${trimmed}" (context: "${leftContext}")`);
                skippedNoMatch++;
            }
        }
    }

    zip.updateFile('word/document.xml', Buffer.from(xml, 'utf8'));
    zip.writeZip(docxPath);
    console.log(`[DOCX PATCH] Klaar. Globaal: ${handledGlobally.size} unieke teksten, Context+cursor: applied=${applied}, noMatch=${skippedNoMatch}, splitRun=${skippedSplitRun}`);
};

/**
 * Fills placeholders directly in an uploaded DOCX template using docxtemplater.
 * The Word document must contain tags like {sleutel} where sleutel matches the placeholder key.
 * @param {string} templateFilePath - absolute path to the original .docx template
 * @param {Object} values - key/value map of placeholder keys to their filled values
 */
exports.fillDocxTemplate = async (templateFilePath, values) => {
    const content = await fsPromises.readFile(templateFilePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => '',
        // Don't throw on unknown tags — just leave them blank
        errorLogging: false,
    });
    try {
        doc.render(values);
    } catch (err) {
        // Docxtemplater throws a multi-error with details per problematic tag
        if (err.properties && err.properties.errors) {
            console.error('[DOCX FILL] Template errors:');
            err.properties.errors.forEach(e => console.error(' -', e.properties?.explanation || e.message));
        } else {
            console.error('[DOCX FILL] Render error:', err.message);
        }
        throw new Error(`Docxtemplater render mislukt: ${err.message}`);
    }
    return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
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
