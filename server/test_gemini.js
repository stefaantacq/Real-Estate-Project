const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
    if (!process.env.GEMINI_API_KEY) process.exit(1);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    try {
        console.log('Sending request to Gemini...');
        const result = await model.generateContent('Hello, are you there?');
        const response = await result.response;
        console.log('Response from Gemini:', response.text());
        process.exit(0);
    } catch (err) {
        console.error('Gemini API Error:', err);
        process.exit(1);
    }
}

testGemini();
