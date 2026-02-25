const fs = require('fs');
let content = fs.readFileSync('./components/Editor.tsx', 'utf8');

const target1 = "split(/(\\\\[\\\\[[a-zA-Z0-9_]+\\\\]\\\\]|\\\\[placeholder:[a-zA-Z0-9_]+\\\\])/g)";
const replacement1 = "split(/(\\[\\[[A-Za-z0-9_]+\\]\\]|\\[placeholder:[A-Za-z0-9_]+\\])/g)";

const target2 = "match(/\\\\[\\\\[([a-zA-Z0-9_]+)\\\\]\\\\]|\\\\[placeholder:([a-zA-Z0-9_]+)\\]/)";
const replacement2 = "match(/\\[\\[([A-Za-z0-9_]+)\\]\\]|\\[placeholder:([A-Za-z0-9_]+)\\]/)";

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync('./components/Editor.tsx', content);
console.log("Done replacing");
