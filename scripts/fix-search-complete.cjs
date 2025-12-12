const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing search box completely...');

// 1. 删除HTML中内联的旧searchData script标签
// 这个会被page.jsx注入的新数据覆盖
const oldScriptPattern = /<script>\s*var searchData = \[.*?\];\s*<\/script>/s;
if (oldScriptPattern.test(content)) {
  content = content.replace(oldScriptPattern, '');
  console.log('Removed old inline searchData script');
}

// 2. 修改默认active状态：影视标签设为active，搜索标签去掉active
// 修改搜索组按钮
content = content.replace(
  /<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-index="0">\s*<i class="fas fa-search">\s*<\/i> 搜索 <\/a>/,
  '<a href="javascript:;" class="btn btn-link btn-sm btn-rounded" data-index="0">\n<i class="fas fa-search">\n</i> 搜索 </a>'
);

content = content.replace(
  /<a href="javascript:;" class="btn btn-link btn-sm btn-rounded" data-index="1">\s*<i class="fas fa-video">\s*<\/i> 影视 <\/a>/,
  '<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-index="1">\n<i class="fas fa-video">\n</i> 影视 </a>'
);

console.log('Set default active to 影视');

// 3. 修改子选项区域：从搜索的子选项改为影视的子选项
// 影视只有一个"站内"选项
const oldChildPattern = /<div class="search-child mt-2">[\s\S]*?<\/div>/;
const newChild = '<div class="search-child mt-2">\n<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-url="/player?url="> 站内 </a>\n</div>';

content = content.replace(oldChildPattern, newChild);
console.log('Updated search-child to show 影视->站内');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Search box fix completed!');
