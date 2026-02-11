const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct "list models" in the simplified SDK usage often, 
        // but we can try the `getGenerativeModel` directly or just try known variants.
        // Actually, the SDK *does* have a generic listModels equivalent if using the manager, 
        // but `GoogleGenerativeAI` entry point is for inference.

        // Let's just try a few known valid names in a loop to see which one "Pings".
        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-2.0-flash-exp",
            "gemini-flash-latest" // What was originally there?
        ];

        console.log("Testing model availability...");
        for (const modelName of candidates) {
            process.stdout.write(`Checking ${modelName}... `);
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                await m.generateContent("Ping");
                console.log("OK!");
            } catch (e) {
                console.log(`FAILED (${e.status || e.message})`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
