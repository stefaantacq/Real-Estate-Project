const fs = require('fs');
let content = fs.readFileSync('./components/Editor.tsx', 'utf8');

const target = "match(/\\\\[\\\\[([A-Za-z0-9_]+)\\\\]\\\\]|\\\\[placeholder:([A-Za-z0-9_]+)\\\\]/)";
const replacement = "match(/\\[\\[([A-Za-z0-9_]+)\\]\\]|\\[placeholder:([A-Za-z0-9_]+)\\]/)";

content = content.replace(target, replacement);

fs.writeFileSync('./components/Editor.tsx', content);
console.log("Done");
