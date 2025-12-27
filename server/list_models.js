const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    console.log('Listing models with key:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const result = await genAI.listModels();
        console.log('Available Models:');
        result.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        process.exit(0);
    } catch (err) {
        console.error('List Models Error:', err);
        process.exit(1);
    }
}

listModels();
