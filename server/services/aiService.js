const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    generationConfig: { 
        maxOutputTokens: 16000,
        responseMimeType: "application/json"
    }
});

// A separate model instance for text-only/fallback without JSON enforcement if needed
const textModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    generationConfig: { maxOutputTokens: 16000 }
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
 * Helper to call Gemini with exponential backoff retry logic.
 */
const callGeminiWithRetry = async (contents, maxRetries = 5) => {
    let lastError;
    // Allow both string prompts and multimodal contents
    const input = typeof contents === 'string' ? contents : contents; 
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            if (i > 0) {
                const delay = Math.pow(2, i + 2) * 1000 + Math.random() * 1000; // Exponential backoff
                console.log(`Retry ${i}/${maxRetries} for Gemini call. Waiting ${Math.round(delay)}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }
            const result = await model.generateContent(input);
            return result;
        } catch (error) {
            lastError = error;
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('Resource exhausted');
            
            if (!isRateLimit || i === maxRetries) {
                throw error;
            }
            console.warn(`Gemini Rate Limit hit (429). Retrying... (${i + 1}/${maxRetries})`);
        }
    }
    throw lastError;
};

/**
 * Analyzes document text to extract real estate data.
 */
const analyzeDocument = async (text, fieldNames, customPrompt = null, fieldContexts = []) => {
    const contextStr = fieldContexts.length > 0
        ? `\nCONTEXT FOR DATA FIELDS:\n${fieldContexts.map(ctx => 
            `- Key: "${ctx.naam}" | Dutch Labels: "${ctx.label}" | Sections: "${ctx.sections}"`
          ).join('\n')}`
        : '';

    const userInstruction = customPrompt
        ? `\nADDITIONAL USER INSTRUCTION: ${customPrompt}\n`
        : '';

    const prompt = `
        You are an expert AI assistant specializing in Belgian Real Estate (Vastgoed).
        Your task is to extract data from one or more Dutch real estate documents.

        CRITICAL RULES:
        1. NEVER confuse Buyer (Koper) and Seller (Verkoper). They are always distinct parties.
           - The Seller is the person/entity transferring ownership.
           - The Buyer is the person/entity acquiring ownership.
           - A "lasthebber" or "gevolmachtigde" acts ON BEHALF of another party — do not confuse them with that party.
        2. Extract values EXACTLY as they appear in the source. Do not reformat dates, names, or numbers unless explicitly asked.
        3. If the same field could match multiple values (e.g. two addresses), always prefer the one that matches the role (Koper/Verkoper) described in the field key/label.
        4. If a value is NOT present in the documents, return "" for waarde. NEVER invent or infer values.
        5. If a value appears in multiple documents, prefer the most official source (e.g. identity card > WhatsApp message).
        6. For addresses: always include street, number, bus (if any), postcode, and city as one complete string.
        7. For names: always include first name AND last name in full.
        8. All keys must be present in the output JSON, even if the value is "".

        OUTPUT FORMAT:
        Return ONLY a valid JSON object. No markdown, no explanation, no preamble.
        Each key maps to an object with:
        - "waarde": extracted value as string ("" if not found)
        - "bron_text": the complete, exact surrounding context/paragraph (at least 20-50 words if possible) from the source document that proves this value ("" if not found). We need this full paragraph so the user can read the context.
        - "pagina_nummer": page number as integer (null if not applicable)

        CONTEXT FOR DATA FIELDS:
        ${contextStr}
        ${userInstruction}

        KEYS TO EXTRACT: ${fieldNames.join(', ')}
    `;

    try {
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
        const parsed = JSON.parse(jsonText);
        // Debug: Log if coordinates are present in any of the keys
        const keysWithCoords = Object.keys(parsed).filter(k => parsed[k].coords);
        console.log(`AI extracted ${Object.keys(parsed).length} keys. Found coords for: ${keysWithCoords.join(', ') || 'NONE'}`);
        return parsed;
    } catch (error) {
        console.error('Error analyzing document with Gemini:', error);
        
        // Log details to debug file
        try { 
            const logMsg = `[${new Date().toISOString()}] Gemini Error: ${error.message}${error.status ? ' (Status: '+error.status+')' : ''}\n`;
            require('fs').appendFileSync('/tmp/dossier_debug.log', logMsg); 
        } catch(e){}

        if (error.status === 404) {
            console.error('ERROR 404: The model was not found.');
        }
        return {};
    }
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
        10. POPULATE METADATA: For every [placeholder:sleutel] tag you insert into the content, you MUST include a corresponding object in the "placeholders" array for that section.
        10. STRUCTURE: Return a JSON array of sections. Each section must have "title", "content" (full text of section with tags), and "placeholders" array.
        11. OUTPUT FORMAT:
           [
             {
               "title": "Exact Title from PDF",
               "content": "Full section text with [placeholder:sleutel] tags",
               "placeholders": [
                 { "id": "sleutel", "label": "Descriptive Label", "type": "text" }
               ]
             }
           ]
        12. Only return the JSON object, nothing else.

        ${userInstruction}
    `;

    try {
        console.log(`Analyzing template... Total text length: ${text?.length || 0}`);
        
        // Robust chunking logic to allow massive templates up to 50 pages
        // We split by double newlines, but if a block is still too big, we split further.
        const CHUNK_SIZE = 12000;
        let blocks = (text || '').split(/\n\s*\n/);
        
        // Final chunks array
        const chunks = [];
        let currentChunk = '';

        for (let block of blocks) {
            // Trim block to avoid whitespace issues
            block = block.trim();
            if (!block) continue;

            // If the block itself is larger than CHUNK_SIZE, we must split it further (e.g. by single newlines)
            if (block.length > CHUNK_SIZE) {
                const subBlocks = block.split('\n');
                for (const sb of subBlocks) {
                    if (currentChunk.length + sb.length > CHUNK_SIZE && currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                        currentChunk = sb + '\n';
                    } else {
                        currentChunk += sb + '\n';
                    }
                    
                    // Safety valve: if a single line is STILL > CHUNK_SIZE, split by chars
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

        console.log(`Split template into ${chunks.length} chunks. Total length: ${text?.length || 0}`);

        let allSections = [];
        
        for (let i = 0; i < chunks.length; i++) {
            console.log(`Analyzing chunk ${i + 1}/${chunks.length}... Size: ${chunks[i].length} chars`);
            try {
                const prompt = getPrompt(chunks[i]);
                const textResponse = await callGeminiWithRetry(prompt);
                
                if (!textResponse) {
                    console.warn(`Empty response from Gemini for chunk ${i+1}`);
                    continue;
                }

                let jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                const firstBracket = jsonText.indexOf('[');
                const lastBracket = jsonText.lastIndexOf(']');
                
                if (firstBracket !== -1 && lastBracket !== -1) {
                    jsonText = jsonText.substring(firstBracket, lastBracket + 1);
                } else {
                    console.warn(`No JSON array found in Gemini response for chunk ${i+1}. Raw response started with: ${textResponse.substring(0, 50)}`);
                    continue;
                }
                
                const parsed = JSON.parse(jsonText);
                if (Array.isArray(parsed)) {
                    console.log(`Chunk ${i+1} returned ${parsed.length} sections.`);
                    allSections = allSections.concat(parsed);
                } else {
                    console.warn(`Chunk ${i+1} did not return an array.`);
                }
            } catch (e) {
                console.error(`Error processing chunk ${i + 1}:`, e.message);
                // Log partial error but keep going
            }
            
            // Short delay between chunks to be safe, though retry handles 429
            if (i < chunks.length - 1) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

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
    chatWithContext: async (messages, contextText) => {
        const systemPrompt = `You are a helpful AI assistant for a Belgian Real Estate platform.
You are helping the user with a specific real estate document (compromis/verkoopakte).

CONTEXT FROM THE DOCUMENT AND ASSOCIATED FILES:
---
${contextText}
---

INSTRUCTIONS:
1. Answer the user's questions based primarily on the CONTEXT provided above.
2. If the user asks about differences, inconsistencies, or specific values in the document, look closely at the context.
3. Keep your answers concise, professional, and in Dutch (unless the user asks in another language).
4. If you cannot find the answer in the context, politely inform the user.
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

                const chat = model.startChat({
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
    streamChatWithContext: async (messages, contextText, onChunk) => {
        const systemPrompt = `You are a helpful AI assistant for a Belgian Real Estate platform.
You are helping the user with a specific real estate document (compromis/verkoopakte).

CONTEXT FROM THE DOCUMENT AND ASSOCIATED FILES:
---
${contextText}
---

INSTRUCTIONS:
1. Answer the user's questions based primarily on the CONTEXT provided above.
2. If the user asks about differences, inconsistencies, or specific values in the document, look closely at the context.
3. Keep your answers concise, professional, and in Dutch (unless the user asks in another language).
4. If you cannot find the answer in the context, politely inform the user.
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

                const chat = model.startChat({
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
