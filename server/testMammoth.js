const mammoth = require('mammoth');
const fs = require('fs');

async function testDocx() {
  try {
    const filePath = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/uploads/1772037049482-18554056.docx';
    const result = await mammoth.extractRawText({ path: filePath });
    console.log("Raw text:", JSON.stringify(result.value));
    console.log("Length:", result.value.length);
    if(result.value.trim().length === 0) {
      console.log("Empty text. Let's trace messages:");
      console.log(result.messages);
    }
  } catch (err) {
    console.error(err);
  }
}
testDocx();
