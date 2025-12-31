const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key present:", !!apiKey);
if (apiKey) {
    console.log("API Key length:", apiKey.length);
    console.log("API Key start:", apiKey.substring(0, 5));
}

const checkConnection = async () => {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        console.log("Attempting ping with model: gemini-2.0-flash-exp");
        const result = await model.generateContent("Ping");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("SUCCESS");
    } catch (error) {
        console.error("Gemini Connection Check Failed:", error);
    }
};

checkConnection();
