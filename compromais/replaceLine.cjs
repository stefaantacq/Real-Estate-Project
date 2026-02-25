const fs = require('fs');
const lines = fs.readFileSync('./components/Editor.tsx', 'utf8').split('\n');
lines[451] = '                                                        const match = part.match(/\\[\\[([A-Za-z0-9_]+)\\]\\]|\\[placeholder:([A-Za-z0-9_]+)\\]/);';
fs.writeFileSync('./components/Editor.tsx', lines.join('\n'));
console.log("Done");
