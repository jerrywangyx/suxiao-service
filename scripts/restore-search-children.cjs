const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Restoring search children options...');

// 查找search-child区域并替换为完整的结构
// 这个区域会被JavaScript动态更新，但我们需要提供初始的HTML结构

// 删除当前的search-child
const oldChildPattern = /<div class="search-child mt-2">[\s\S]*?<\/div>/;

// 新的完整search-child结构
// 注意：这里初始显示的是"影视"的子选项（因为默认active是影视）
const newChild = `<div class="search-child mt-2">
<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-url="/player?url="> 站内 </a>
</div>`;

content = content.replace(oldChildPattern, newChild);

console.log('Restored search-child HTML');

// 确保searchData正确注入
// 检查是否有旧的inline script
const hasOldScript = content.includes('var searchData =');
if (hasOldScript) {
  console.log('Warning: Found old inline searchData, this might conflict with page.jsx injection');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Search children restoration completed!');
