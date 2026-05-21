const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: {
        maxOutputTokens: 32000,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
    }
});

// A separate model instance for text-only/fallback without JSON enforcement if needed
const textModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: {
        maxOutputTokens: 16000,
        thinkingConfig: { thinkingBudget: 0 }
    }
});

/**
 * Extracts raw text from a PDF file.
 * Automatically falls back to Vision OCR for scanned PDFs.
 */
const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        
        // If extracted text is very short (e.g. < 50 chars) but the file is large, it's likely a scan.
        if (data.text && data.text.trim().length > 50) {
            return data.text;
        }

        console.log(`PDF text extraction yielded very little content (${data.text?.length || 0} chars). Falling back to Vision OCR...`);
        return await extractTextFromImage(filePath, 'application/pdf');
    } catch (error) {
        console.error(`Error extracting text from PDF (${filePath}):`, error);
        // Fallback to vision if pdf-parse fails completely
        try {
            return await extractTextFromImage(filePath, 'application/pdf');
        } catch (e) {
            return '';
        }
    }
};

/**
 * Extracts raw text from a DOCX file.
 */
const extractTextFromDOCX = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value; // The generated raw text
    } catch (error) {
        console.error(`Error extracting text from DOCX (${filePath}):`, error);
        return '';
    }
};

/**
 * Extracts text from an image using Gemini vision.
 */
const extractTextFromImage = async (filePath, mimeType) => {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const imageBase64 = imageBuffer.toString('base64');

        const prompt = "Analyseer deze afbeelding van een vastgoeddocument. Extraheer alle tekst die je ziet, inclusief namen, data, bedragen en omschrijvingen. Probeer de structuur van het document te behouden in de tekst.";
        
        const result = await textModel.generateContent([
            { text: prompt },
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            }
        ]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Error extracting text from image (${filePath}):`, error);
        return '';
    }
};

/**
 * Helper to call Gemini with exponential backoff retry logic and per-call timeout.
 */
const GEMINI_CALL_TIMEOUT_MS = 120000; // 120 seconds per call

const withTimeout = (promise, ms) => {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Gemini call timed out after ${ms}ms`)), ms);
        })
    ]).finally(() => clearTimeout(timer));
};

const callGeminiWithRetry = async (contents, maxRetries = 3, targetModel = model) => {
    let lastError;
    const input = typeof contents === 'string' ? contents : contents; 
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            if (i > 0) {
                const delay = Math.pow(2, i + 1) * 1000 + Math.random() * 1000;
                console.log(`Retry ${i}/${maxRetries} for Gemini call. Waiting ${Math.round(delay)}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }
            const result = await withTimeout(targetModel.generateContent(input), GEMINI_CALL_TIMEOUT_MS);
            return result;
        } catch (error) {
            lastError = error;
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('Resource exhausted');
            const isTimeout = error.message?.includes('timed out');
            
            if (isTimeout && i < maxRetries) {
                console.warn(`Gemini call timed out. Retrying... (${i + 1}/${maxRetries})`);
                continue;
            }
            if (!isRateLimit || i === maxRetries) {
                throw error;
            }
            console.warn(`Gemini Rate Limit hit (429). Retrying... (${i + 1}/${maxRetries})`);
        }
    }
    throw lastError;
};

/**
 * Validates extracted AI results: rejects values that look like placeholder names.
 * Returns a cleaned copy of the parsed data.
 */
const validateExtractedValues = (parsed, fieldNames) => {
    const normalize = (s) => (s || '').toLowerCase().replace(/[\.\_\-\s\[\]\(\):]+/g, '').trim();
    const fieldNameSet = new Set(fieldNames.map(normalize));
    
    for (const [key, val] of Object.entries(parsed)) {
        if (!val || typeof val !== 'object' || !val.waarde) continue;
        const rawValue = val.waarde.toString().trim();
        if (!rawValue) continue;
        
        const normValue = normalize(rawValue);
        const normKey = normalize(key);
        
        // Reject if value matches or contains its own key name (min 3 chars to avoid false positives like "A")
        if (normValue === normKey || (normValue.length >= 3 && (normValue.includes(normKey) || normKey.includes(normValue)))) {
            console.warn(`[VALIDATION] Rejected value for "${key}": "${rawValue}" (matches key name)`);
            parsed[key].waarde = '';
            parsed[key].bron_text = '';
            continue;
        }
        
        // Reject if value matches ANY other placeholder key name
        if (fieldNameSet.has(normValue)) {
            console.warn(`[VALIDATION] Rejected value for "${key}": "${rawValue}" (matches another placeholder key)`);
            parsed[key].waarde = '';
            parsed[key].bron_text = '';
            continue;
        }
        
        // Reject if value contains dotted lines or placeholder markers
        if (/^[\.]{3,}/.test(rawValue) || /\[placeholder:/.test(rawValue) || /^_{3,}$/.test(rawValue)) {
            console.warn(`[VALIDATION] Rejected value for "${key}": "${rawValue}" (contains placeholder pattern)`);
            parsed[key].waarde = '';
            parsed[key].bron_text = '';
            continue;
        }
        
        // Reject if value looks like a template variable (e.g. "SELLER_NAME", "......naam......")
        if (/^\.{2,}.*\.{2,}$/.test(rawValue) || /^[A-Z_]{4,}$/.test(rawValue)) {
            console.warn(`[VALIDATION] Rejected value for "${key}": "${rawValue}" (looks like template variable)`);
            parsed[key].waarde = '';
            parsed[key].bron_text = '';
            continue;
        }
    }
    return parsed;
};

/**
 * Analyzes document text to extract real estate data.
 */
const _analyzeDocumentSingleCall = async (text, fieldNames, customPrompt = null, fieldContexts = []) => {
    const contextStr = fieldContexts.length > 0
        ? `\nCONTEXT FOR DATA FIELDS:\n${fieldContexts.map(ctx => 
            `- Key: "${ctx.naam}" | Labels: "${ctx.label}" | Sections: "${ctx.sections}"`
          ).join('\n')}`
        : '';

    const userInstruction = customPrompt
        ? `\nADDITIONAL USER INSTRUCTION: ${customPrompt}\n`
        : '';

    const prompt = `You are an expert AI assistant specializing in Belgian Real Estate (Vastgoed/Immobilier).
Your task is to extract REAL DATA VALUES from uploaded Belgian real estate documents (in Dutch, French, or English).

CRITICAL RULES:
1. NEVER confuse Buyer (Koper) and Seller (Verkoper). They are always distinct parties.
   - The Seller is the person/entity transferring ownership.
   - The Buyer is the person/entity acquiring ownership.
   - A "lasthebber" or "gevolmachtigde" acts ON BEHALF of another party — do not confuse them with that party.
2. Extract values EXACTLY as they appear in the source documents. Do not reformat dates, names, or numbers.
3. If the same field could match multiple values (e.g. two addresses), prefer the one matching the role (Koper/Verkoper) described in the field key/label.
4. If a value is NOT present in the documents, return "" for waarde. NEVER invent or infer values.
5. If a value appears in multiple documents, prefer the most official source.
6. For addresses: include street, number, bus (if any), postcode, and city as one complete string.
7. For names: include first name AND last name in full.
8. All keys must be present in the output JSON, even if the value is "".
9. For "contract_special_conditions": Extract ALL special conditions, clauses, and agreements found in the documents VERBATIM and in their entirety. Do NOT summarize them.

CRITICAL — WHAT TO EXTRACT:
- You MUST extract the ACTUAL DATA from the source documents (real names, real dates, real addresses, real amounts).
- Example: if the key is "naam_verkoper", you must find the seller's actual name in the documents (e.g. "Jan Peeters").
- NEVER return the key name itself, a placeholder pattern, or a template variable as the value.

FORBIDDEN VALUES (never return these as waarde):
- The placeholder key name itself (e.g. "naam_verkoper" for key naam_verkoper) ❌
- Dotted lines like "......" or "............" ❌
- Template variables like "SELLER_NAME", "BUYER_ADDRESS" ❌
- Bracketed placeholders like "[naam]" or "[placeholder:xyz]" ❌
- Underscore patterns like "__________" ❌
If you cannot find the real value in the documents, return "" — never guess or echo the key name.

OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown, no explanation.
Each key maps to an object with:
- "waarde": extracted real value as string ("" if not found)
- "bron_text": the surrounding context/paragraph (20-50 words) from the source document proving this value ("" if not found)
- "pagina_nummer": page number as integer (null if not applicable)
- "score_bron": Quality of the source document for this specific field. Use exactly these values:
    - 1.0: Official document (akte, bodemattest, kadastraal uittreksel)
    - 0.8: Filled-in form from a reliable source
    - 0.5: Informal source (messages, email, photo, informal note)
    - 0.0: Not found or extremely unreliable
- "score_context": How well does the extracted value fit the expected context of the field? (Value between 0.0 and 1.0)
- "score_volledigheid": How complete is the extracted information? (e.g., for an address, does it have street, number, city?) (Value between 0.0 and 1.0)
- "reden": Brief explanation of your decision (e.g., "Found on page 2 of the sales agreement," "Conflicting values in documents X and Y," "Incomplete address").
${contextStr}
${userInstruction}
KEYS TO EXTRACT: ${fieldNames.join(', ')}
`;

    console.log(`Sending dynamic prompt to Gemini (JSON mode)...`);
    
    let contents = [];
    // If text is actually a file path (starts with / or has common image extensions) and file exists
    const isFilePath = typeof text === 'string' && (text.startsWith('/') || text.includes('uploads/')) && fs.existsSync(text);
    
    if (isFilePath) {
        let mimeType = 'application/pdf';
        if (text.toLowerCase().endsWith('.png')) mimeType = 'image/png';
        else if (text.toLowerCase().endsWith('.jpg') || text.toLowerCase().endsWith('.jpeg')) mimeType = 'image/jpeg';
        else if (!text.toLowerCase().endsWith('.pdf')) mimeType = 'image/jpeg'; // Default for other potential images
        
        contents = [
            { text: prompt },
            {
                inlineData: {
                    data: fs.readFileSync(text).toString('base64'),
                    mimeType: mimeType
                }
            }
        ];
    } else {
        contents = [
            { text: prompt + "\n\nTEXT TO ANALYZE:\n" + text }
        ];
    }

    const result = await callGeminiWithRetry(contents);
    const response = await result.response;
    const textResponse = response.text();

    console.log('--- GEMINI RESPONSE RECEIVED ---');
    console.log('Text Response Segment:', textResponse.substring(0, 100));

    let jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }
    let parsed = JSON.parse(jsonText);
    // Validate: reject values that look like placeholder names
    parsed = validateExtractedValues(parsed, fieldNames);
    const keysWithCoords = Object.keys(parsed).filter(k => parsed[k]?.coords);
    const keysWithValues = Object.keys(parsed).filter(k => parsed[k]?.waarde && parsed[k].waarde.toString().trim());
    console.log(`AI extracted ${Object.keys(parsed).length} keys, ${keysWithValues.length} with values. Coords for: ${keysWithCoords.join(', ') || 'NONE'}`);
    return parsed;
};

const _analyzeDocumentRecursive = async (text, fieldNames, customPrompt = null, fieldContexts = []) => {
    if (!fieldNames || fieldNames.length === 0) return {};
    try {
        return await _analyzeDocumentSingleCall(text, fieldNames, customPrompt, fieldContexts);
    } catch (error) {
        console.error('Error analyzing document with Gemini:', error.message);
        
        // Log details to debug file
        try { 
            const logMsg = `[${new Date().toISOString()}] Gemini Error: ${error.message}${error.status ? ' (Status: '+error.status+')' : ''}\n`;
            require('fs').appendFileSync('/tmp/dossier_debug.log', logMsg); 
        } catch(e){}

        if (error.status === 404) {
            console.error('ERROR 404: The model was not found.');
        }
        
        // Recursive splitting validation logic
        if (fieldNames.length > 5) {
            console.warn(`[RECURSIVE SPLIT] Gemini call failed for ${fieldNames.length} fields. Splitting in half...`);
            const half = Math.floor(fieldNames.length / 2);
            const p1 = _analyzeDocumentRecursive(text, fieldNames.slice(0, half), customPrompt, fieldContexts.slice(0, half));
            const p2 = _analyzeDocumentRecursive(text, fieldNames.slice(half), customPrompt, fieldContexts.slice(half));
            const [res1, res2] = await Promise.all([p1, p2]);
            return { ...res1, ...res2 };
        } else {
            console.error(`[RECURSIVE SPLIT] Failed for ${fieldNames.length} fields, too small to split. Returning {}.`);
            return {};
        }
    }
};

const analyzeDocument = async (text, fieldNames, customPrompt = null, fieldContexts = []) => {
    if (!fieldNames || fieldNames.length === 0) return {};
    
    // 1. Group by logical sections (e.g. 'Partijen', 'Onroerend Goed', 'Financieel')
    const grouped = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const ctx = fieldContexts[i] || { sections: 'Algemeen' };
        
        // Use the first section if there are multiple comma-separated sections
        const sectionRaw = ctx.sections ? ctx.sections.split(',')[0].trim() : 'Algemeen';
        const groupName = sectionRaw || 'Algemeen';
        
        if (!grouped[groupName]) {
            grouped[groupName] = { fieldNames: [], fieldContexts: [] };
        }
        grouped[groupName].fieldNames.push(fieldName);
        grouped[groupName].fieldContexts.push(ctx);
    }
    
    console.log(`[TEMPLATE CHUNKING] Grouped ${fieldNames.length} fields into ${Object.keys(grouped).length} sections: ${Object.keys(grouped).join(', ')}`);
    
    // 2. Process groups in Parallel/Sequential
    const allResults = {};
    const groupPromises = Object.entries(grouped).map(async ([groupName, groupData]) => {
        console.log(`[TEMPLATE CHUNKING] Processing group "${groupName}" with ${groupData.fieldNames.length} fields...`);
        const result = await _analyzeDocumentRecursive(text, groupData.fieldNames, customPrompt, groupData.fieldContexts);
        Object.assign(allResults, result);
    });
    
    await Promise.all(groupPromises);
    
    return allResults;
};

/**
 * Analyzes a template PDF to identify sections and place library placeholders.
 */
const analyzeTemplate = async (text, libraryPlaceholders, customPrompt = null) => {
    const placeholderList = libraryPlaceholders.map(p => `- ${p.sleutel}: ${p.beschrijving} (Type: ${p.type})`).join('\n');

    const userInstruction = customPrompt
        ? `\nADDITIONAL USER INSTRUCTION: ${customPrompt}\n`
        : '';

    const getPrompt = (chunkText) => `
        You are an AI assistant for a Belgian real estate platform.
        Your task is to analyze the provided template text chunk and structure it into sections.
        
        TEMPLATE TEXT CHUNK:
        ---
        ${chunkText}
        ---

        AVAILABLE PLACEHOLDERS FROM LIBRARY:
        ${placeholderList}

        INSTRUCTIONS:
        1. IDENTIFY SECTIONS: Look for natural divisions in the text. Usually, these start with an UPPERCASE title (e.g., "BESCHRIJVING VAN HET GOED:") or a numbered title (e.g., "1° Toestand"). If no clear title exists, group the text logically.
        2. CAPTURE TITLES: For each section, extract the exact title found in the text. If there is no clear title, invent a short, descriptive one.
        3. TABLES & FORMATTING: If you encounter tables, lists, or complex formatting, convert them into a structured, readable text format (bullet points, clear indentation). DO NOT OMIT CONTENT. Ensure every part of the template text is included in one of the sections.
        4. REFLOW TEXT: The input text may have hard line breaks from PDF extraction. Remove these and REFLOW the text into clean paragraphs.
        5. TABS & SPACES: Preserve indentation and tab-like spacing where it appears significant.
        6. LISTS: Format numbered lists or bullet points as PLAIN TEXT with line breaks. Do NOT use HTML tags.
        7. MAP PLACEHOLDERS (CRITICAL): Identify all locations where data must be filled in. These are often marked by:
           - Dotted lines (e.g., "............", ".............")
           - Underscores (e.g., "__________")
           - Empty brackets or parentheses (e.g., "[ ]", "( )")
           - Colons followed by a blank space (e.g., "Naam: ")
           - Specific personal data in a filled document that should be generic (names, dates, etc.)
        8. REPLACE WITH TAGS: ALWAYS remove the dotted lines (".......") or underscores and replace them with the exact matching tag from the library in the format [placeholder:sleutel]. 
        9. SUGGEST NEW KEYS: If you find a dotted line (".......") for a data spot NOT in the library (e.g., "BIV-Nr: ........"), INVENT a descriptive English key for it (e.g., "agent_biv_number"). ALWAYS use lowercase snake_case and use [placeholder:agent_biv_number].
        10. SPECIAL RULE — FACULTATIEVE BEPALINGEN: If you encounter a section titled 'FACULTATIEVE BEPALINGEN' or similar (e.g. 'FACULTATIEVE BEPALINGEN (TE SCHRAPPEN INDIEN NIET VAN TOEPASSING)'), you MUST place the [placeholder:contract_special_conditions] tag inside it, even if the section appears empty or has no dotted lines. This is where special conditions and clauses from uploaded documents will be inserted.
        11. POPULATE METADATA: For every [placeholder:sleutel] tag you insert into the content, you MUST include a corresponding object in the "placeholders" array for that section.
        12. STRUCTURE: Return a JSON array of sections. Each section must have "title", "content" (full text of section with tags), and "placeholders" array.

        13. OUTPUT FORMAT:
           Return a JSON array of objects. Each object represents a section:
           [
             {
               "title": "Exact Title of the section",
               "content": "Full section text with [placeholder:sleutel] tags",
               "placeholders": [
                 { "id": "sleutel", "label": "Descriptive Label", "type": "text" }
               ]
             }
           ]
        14. Only return the JSON object, nothing else. No markdown headers.
 
        ${userInstruction}
    `;

    try {
        console.log(`Analyzing template... Total text length: ${text?.length || 0}`);
        
        // Robust chunking logic to allow massive templates up to 50 pages
        // We split by double newlines, but if a block is still too big, we split further.
        const CHUNK_SIZE = 10000;
        let blocks = (text || '').split(/\n\s*\n/);
        
        // Final chunks array
        const chunks = [];
        let currentChunk = '';

        for (let block of blocks) {
            block = block.trim();
            if (!block) continue;

            if (block.length > CHUNK_SIZE) {
                const subBlocks = block.split('\n');
                for (const sb of subBlocks) {
                    if (currentChunk.length + sb.length > CHUNK_SIZE && currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                        currentChunk = sb + '\n';
                    } else {
                        currentChunk += sb + '\n';
                    }
                    
                    if (currentChunk.length > CHUNK_SIZE) {
                        chunks.push(currentChunk.slice(0, CHUNK_SIZE).trim());
                        currentChunk = currentChunk.slice(CHUNK_SIZE) + '\n';
                    }
                }
            } else {
                if (currentChunk.length + block.length > CHUNK_SIZE && currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    currentChunk = block + '\n\n';
                } else {
                    currentChunk += block + '\n\n';
                }
            }
        }
        if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());

        console.log(`[PERFORMANCE] Split template into ${chunks.length} chunks. Total length: ${text?.length || 0}. Starting parallel analysis...`);

        const startTime = Date.now();
        
        // Use a concurrency limit to avoid hitting rate limits 429, but still much faster than sequential
        const CONCURRENCY_LIMIT = 2;
        let allSections = [];
        
        for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
            const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
            const batchPromises = batch.map(async (chunkText, index) => {
                const chunkId = i + index;
                try {
                    const prompt = getPrompt(chunkText);
                    const result = await callGeminiWithRetry(prompt);
                    const response = await result.response;
                    const textResponse = response.text();
                    
                    if (!textResponse) return [];

                    let jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    const firstBracket = jsonText.indexOf('[');
                    const lastBracket = jsonText.lastIndexOf(']');
                    
                    if (firstBracket !== -1 && lastBracket !== -1) {
                        jsonText = jsonText.substring(firstBracket, lastBracket + 1);
                    } else {
                        return [];
                    }
                    
                    const parsed = JSON.parse(jsonText);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.error(`Error processing chunk ${chunkId + 1}:`, e.message);
                    return [];
                }
            });

            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach(sections => {
                allSections = allSections.concat(sections);
            });
            
            // Minimal pause between batches to breathe
            if (i + CONCURRENCY_LIMIT < chunks.length) {
                await new Promise(r => setTimeout(r, 500));
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[PERFORMANCE] Template analysis finished in ${duration}s. Extracted ${allSections.length} sections.`);

        console.log(`Total sections extracted: ${allSections.length}`);

        // Fallback: If no sections were extracted but text exists, create a default section
        if (allSections.length === 0 && text && text.trim().length > 0) {
            console.log('Using fallback: Creating a single section with extracted text.');
            allSections.push({
                title: 'Geïmporteerde Inhoud',
                content: text.trim(),
                placeholders: []
            });
        }

        // Post-processing: Ensure "BIJZONDERE VOORWAARDEN EN CLAUSULES" exists at the end
        const hasSpecialConditions = allSections.some(s => 
            s.title && s.title.toUpperCase().includes('BIJZONDERE VOORWAARDEN')
        );

        if (!hasSpecialConditions) {
            console.log('Adding mandatory BIJZONDERE VOORWAARDEN section via post-processing.');
            allSections.push({
                title: "BIJZONDERE VOORWAARDEN EN CLAUSULES",
                content: "[placeholder:contract_special_conditions]",
                placeholders: [
                    { id: "contract_special_conditions", label: "Bijzondere voorwaarden en clausules", type: "textarea" }
                ]
            });
        }

        return allSections;
    } catch (error) {
        console.error('Error analyzing template with Gemini:', error);
        return [];
    }
};

module.exports = {
    extractTextFromPDF,
    extractTextFromDOCX,
    extractTextFromImage,

    // Check connection to Gemini
    checkConnection: async () => {
        try {
            if (!genAI) {
                console.error("Gemini AI instance not initialized");
                return false;
            }
            console.log("Checking connection using model:", process.env.GEMINI_MODEL || 'gemini-2.0-flash');
            const connectionModel = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });
            const result = await connectionModel.generateContent("Ping");
            const response = await result.response;
            const text = response.text();
            console.log("Connection check response:", text);
            return !!text;
        } catch (error) {
            console.error("Gemini Connection Check Failed:", error.message);
            return false;
        }
    },

    analyzeDocument,
    analyzeTemplate,
    
    // Chat with context
    chatWithContext: async (messages, contextText, language) => {
        const langStr = language === 'fr' ? 'French' : language === 'en' ? 'English' : 'Dutch';
        const systemPrompt = `You are a helpful AI assistant for a Belgian Real Estate platform.
You are helping the user with a specific real estate document (compromis/verkoopakte).

CONTEXT FROM THE DOCUMENT AND ASSOCIATED FILES:
---
${contextText}
---

INSTRUCTIONS:
1. Answer the user's questions based primarily on the CONTEXT provided above.
2. If the user asks about differences, inconsistencies, or specific values in the document, look closely at the context.
3. CRUCIAL: You MUST ALWAYS reply in ${langStr}, regardless of the language the prompt is written in. Do NOT include JSON formatting or curly braces like {}.
4. Keep your answers concise and professional.
5. If you cannot find the answer in the context, politely inform the user.
`;
        
        // Format messages for Gemini API
        let historyMessages = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
        
        // Remove any leading 'model' messages (like the welcome greeting) because Gemini requires history to start with 'user'
        while(historyMessages.length > 0 && historyMessages[0].role === 'model') {
             historyMessages.shift();
        }

        // The last message is what we send as the new prompt.
        // The rest is history.
        if (historyMessages.length === 0) {
             historyMessages.push({ role: 'user', parts: [{ text: 'Hello' }]});
        }

        // Inject the system context into the first user message in history
        historyMessages[0].parts[0].text = systemPrompt + "\n\nUSER QUESTION/CONTEXT:\n" + historyMessages[0].parts[0].text;

        const maxRetries = 3;
        let lastError;
        for (let i = 0; i <= maxRetries; i++) {
            try {
                if (i > 0) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    console.log(`Retry ${i}/${maxRetries} for Gemini Chat. Waiting ${Math.round(delay)}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                }

                const chat = textModel.startChat({
                    history: historyMessages.slice(0, -1),
                });

                const lastMessage = historyMessages[historyMessages.length - 1].parts[0].text;
                const result = await chat.sendMessage(lastMessage);
                const response = await result.response;
                return response.text();
            } catch (error) {
                lastError = error;
                const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('Resource exhausted');
                if (!isRateLimit || i === maxRetries) throw error;
                console.warn(`Gemini Chat Rate Limit (429). Retrying... (${i + 1}/${maxRetries})`);
            }
        }
        throw lastError;
    },

    // Chat with context (streaming)
    streamChatWithContext: async (messages, contextText, language, onChunk) => {
        const langStr = language === 'fr' ? 'French' : language === 'en' ? 'English' : 'Dutch';
        const systemPrompt = `You are a helpful AI assistant for a Belgian Real Estate platform.
You are helping the user with a specific real estate document (compromis/verkoopakte).

CONTEXT FROM THE DOCUMENT AND ASSOCIATED FILES:
---
${contextText}
---

INSTRUCTIONS:
1. Answer the user's questions based primarily on the CONTEXT provided above.
2. If the user asks about differences, inconsistencies, or specific values in the document, look closely at the context.
3. CRUCIAL: You MUST ALWAYS reply in ${langStr}, regardless of the language the prompt is written in. Do NOT include JSON formatting or curly braces like {}.
4. Keep your answers concise and professional.
5. If you cannot find the answer in the context, politely inform the user.
`;
        
        let historyMessages = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
        
        while(historyMessages.length > 0 && historyMessages[0].role === 'model') {
             historyMessages.shift();
        }

        if (historyMessages.length === 0) {
             historyMessages.push({ role: 'user', parts: [{ text: 'Hello' }]});
        }

        historyMessages[0].parts[0].text = systemPrompt + "\n\nUSER QUESTION/CONTEXT:\n" + historyMessages[0].parts[0].text;

        const maxRetries = 3;
        let lastError;
        for (let i = 0; i <= maxRetries; i++) {
            try {
                if (i > 0) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    console.log(`Retry ${i}/${maxRetries} for Gemini Stream Chat. Waiting ${Math.round(delay)}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                }

                const chat = textModel.startChat({
                    history: historyMessages.slice(0, -1),
                });

                const lastMessage = historyMessages[historyMessages.length - 1].parts[0].text;
                const result = await chat.sendMessageStream(lastMessage);
                
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                        onChunk(chunkText);
                    }
                }
                return; // Success
            } catch (error) {
                lastError = error;
                const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('Resource exhausted');
                
                if (!isRateLimit || i === maxRetries) {
                    console.error('Error in streamChatWithContext:', error);
                    throw error;
                }
                console.warn(`Gemini Stream Rate Limit (429). Retrying... (${i + 1}/${maxRetries})`);
            }
        }
        throw lastError;
    }
};
