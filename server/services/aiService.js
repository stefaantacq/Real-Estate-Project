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
        ? `\nHere is the context for the fields you need to extract:\n${fieldContexts.map(ctx => `- ${ctx.naam} (Type: ${ctx.type}) in section "${ctx.section}"`).join('\n')}`
        : '';

    const userInstruction = customPrompt
        ? `\nADDITIONAL USER INSTRUCTION: ${customPrompt}\n`
        : '';

    const prompt = `
        You are an AI assistant for a real estate application in Belgium.
        Extract the following data fields from the provided text.
        Text: 
        ---
        ${text}
        ---
        ${contextStr}
        ${userInstruction}

        Extract only these fields: ${fieldNames.join(', ')}.
        Return the result as a JSON object where keys are the field names.
        If a field is not found, use an empty string.
        Be extremely precise with names, addresses (identify if it is seller/buyer/property address), and dates.
        Only return the JSON object, nothing else.
    `;

    try {
        console.log(`Sending prompt to Gemini (Model: gemini-1.5-flash)...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        console.log('Gemini response received.');

        const jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error analyzing document with Gemini:', error);
        if (error.status === 404) {
            console.error('ERROR 404: The model "gemini-1.5-flash" was not found. Please check if the Generative Language API is enabled in your Google Cloud project and if the model is available for your API key.');
        }
        return {};
    }
};

module.exports = {
    extractTextFromPDF,
    analyzeDocument
};
