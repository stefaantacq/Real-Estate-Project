require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testUpload() {
    try {
        const filePath = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/uploads/1772037049482-18554056.docx';
        console.log("Uploading to Gemini...");
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            displayName: "Mock_Data.docx"
        });
        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
        
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        console.log(`Using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: "Extract any names or addresses from this document." }
        ]);
        console.log("Gemini Response:", result.response.text());
        
        // Clean up
        await fileManager.deleteFile(uploadResponse.file.name);
    } catch(e) {
        console.error(e);
    }
}
testUpload();
