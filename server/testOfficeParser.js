const { parseOffice } = require('officeparser');

async function testDocx() {
  try {
    const filePath = '/Users/stefaantacq/Downloads/Real-Estate-Project/server/uploads/1772037049482-18554056.docx';
    const text = await parseOffice(filePath);
    console.log("Raw text:", text);
    console.log("Length:", text ? text.length : 0);
  } catch (err) {
    console.error(err);
  }
}
testDocx();
