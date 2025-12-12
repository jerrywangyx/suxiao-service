const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Clearing video child options...');

// 清空search-child区域，因为默认是影视标签（active），而影视没有子选项
const oldChildPattern = /<div class="search-child mt-2">[\s\S]*?<\/div>/;
const newChild = '<div class="search-child mt-2">\n</div>';

content = content.replace(oldChildPattern, newChild);

console.log('Cleared search-child HTML for video tab');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Video child clearing completed!');
