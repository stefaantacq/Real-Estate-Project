const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

/**
 * Extracts raw text from a PDF file.
 */
const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error(`Error extracting text from PDF (${filePath}):`, error);
        return '';
    }
};

/**
 * Analyzes document text to extract real estate data.
 */
const analyzeDocument = async (text, fieldNames, customPrompt = null, fieldContexts = []) => {
    const contextStr = fieldContexts.length > 0
        ? `\nCONTEXT FOR DATA FIELDS (Use these labels to find the data in the Dutch text):\n${fieldContexts.map(ctx => `- Key: "${ctx.naam}" | Dutch Labels/Description: "${ctx.label}" | Section: "${ctx.section}"`).join('\n')}`
        : '';

    const userInstruction = customPrompt
        ? `\nADDITIONAL USER INSTRUCTION: ${customPrompt}\n`
        : '';

    const prompt = `
        You are an expert AI assistant specializing in Belgian Real Estate (Vastgoed).
        Your task is to extract data from a Dutch real estate document (compromis/verkoopakte).
        
        TEXT TO ANALYZE:
        ---
        ${text}
        ---

        INSTRUCTIONS:
        1. Extract the values for the keys listed below.
        2. Use the provided "Dutch Labels" and "Sections" context to identify where these fields appear in the Dutch text.
        3. For names, dates, and addresses: Be extremely precise. 
           - Distinguish clearly between Buyer (Koper) and Seller (Verkoper).
           - Identify the Property Address (Adres van de eigendom/het goed).
        4. Return ONLY a JSON object where the keys are the English keys provided.
        5. Use an empty string "" if a field is not found.
        6. Return nothing but the JSON object.

        ${contextStr}
        ${userInstruction}

        EXTRACT THESE KEYS: ${fieldNames.join(', ')}.
    `;

    try {
        console.log(`Sending prompt to Gemini (Model: gemini-1.5-flash)...`);
        console.log('--- GEMINI PROMPT ---');
        console.log(prompt);
        console.log('--- END PROMPT ---');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        console.log('--- GEMINI RESPONSE ---');
        console.log(textResponse);
        console.log('--- END RESPONSE ---');

        const jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error analyzing document with Gemini:', error);
        if (error.status === 404) {
            console.error('ERROR 404: The model was not found. Please check if the Generative Language API is enabled in your Google Cloud project and if the model is available for your API key.');
        }
        return {};
    }
};

/**
 * Analyzes a template PDF to identify sections and place library placeholders.
 */
const analyzeTemplate = async (text, libraryPlaceholders) => {
    const placeholderList = libraryPlaceholders.map(p => `- ${p.sleutel}: ${p.beschrijving} (Type: ${p.type})`).join('\n');

    const prompt = `
        You are an AI assistant for a Belgian real estate platform.
        Your task is to analyze the provided template text and structure it into sections.
        
        TEMPLATE TEXT:
        ---
        ${text}
        ---

        AVAILABLE PLACEHOLDERS FROM LIBRARY:
        ${placeholderList}

        INSTRUCTIONS:
        1. IDENTIFY SECTIONS: Look for natural divisions in the text. Usually, these start with an UPPERCASE title (e.g., "BESCHRIJVING VAN HET GOED:") or a numbered title (e.g., "1° Toestand"). 
        2. CAPTURE TITLES: For each section, extract the exact title found in the text. DO NOT return an empty title.
        3. REFLOW TEXT: The input text may have hard line breaks from PDF extraction. Remove these and REFLOW the text into clean, justified paragraphs. Preserving the flow is critical for "Word-like" justification.
        4. TABS & SPACES: Preserve indentation and tab-like spacing where it appears significant (e.g., in lists or specific aligned data). Use spaces or \t as necessary.
        5. LISTS: Inspect the text for numbered lists (e.g. 1. or 1° or a)) or bullet points. Format these as PLAIN TEXT with line breaks (\n) before each item. Do NOT use HTML <ul> or <ol> tags. Ensure there is NO empty line between list items (single spacing).
        6. MAP PLACEHOLDERS: Look for spots where data should be filled in. This includes:
           - Explicit marks: Dotted lines (.......), bracketed text ([naam]), or blanks.
           - Filled Personal Data (GENERALIZATION): If the document appears to be a filled-in contract, identify specific personal information that should be variable. For example: names of parties, birth dates, birth places, addresses of parties, and the property address.
        6. USE LIBRARY KEYS: Replace those spots with the exact placeholder tag from the library in the format [placeholder:sleutel].
        7. SUGGEST NEW KEYS: If you find a data spot that is NOT in the library (e.g., a specific birth date like "17 juni 1931"), but it definitely should be a placeholder, INVENT a descriptive English key for it (e.g., "seller_birth_date") and use it as [placeholder:seller_birth_date].
        8. STRUCTURE: Return a JSON array of sections. Each section must have a "title", "content" (the full text of that section with tags inserted), and a "placeholders" array containing information about the tags used in that section.
        9. OUTPUT FORMAT:
           [
             {
               "title": "Exact Title from PDF",
               "content": "Full section text with [placeholder:sleutel] tags",
               "placeholders": [
                 { "id": "sleutel", "label": "Descriptive Label", "type": "text/date/etc" }
               ]
             }
           ]
        10. Only return the JSON object, nothing else.
    `;

    try {
        console.log(`Analyzing template with Gemini... Text length: ${text?.length || 0}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        console.log('Gemini raw response length:', textResponse?.length || 0);

        const jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonText);
        console.log(`Successfully parsed ${parsed?.length || 0} sections.`);
        return parsed;
    } catch (error) {
        console.error('Error analyzing template with Gemini:', error);
        return [];
    }
};

module.exports = {
    extractTextFromPDF,

    // Check connection to Gemini
    checkConnection: async () => {
        try {
            if (!genAI) {
                console.error("Gemini AI instance not initialized");
                return false;
            }
            console.log("Checking connection using model: gemini-2.0-flash-exp");
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent("Ping");
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
    analyzeTemplate
};
