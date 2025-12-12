const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. 修改默认显示的搜索子选项 - 删除"站内"
const searchChildPattern = /<div class="search-child mt-2">\s*<a[^>]*data-url="\/search\/"[^>]*>\s*站内\s*<\/a>\s*<a[^>]*data-url="https:\/\/cn\.bing\.com\/search\?q="[^>]*>\s*Bing\s*<\/a>\s*<a[^>]*data-url="https:\/\/www\.baidu\.com\/s\?wd="[^>]*>\s*百度\s*<\/a>\s*<a[^>]*data-url="https:\/\/www\.google\.com\/search\?q="[^>]*>\s*Google\s*<\/a>\s*<\/div>/;

const newSearchChild = `<div class="search-child mt-2">
<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-url="https://cn.bing.com/search?q="> Bing </a>
<a href="javascript:;" class="btn btn-link btn-sm btn-rounded" data-url="https://www.baidu.com/s?wd="> 百度 </a>
<a href="javascript:;" class="btn btn-link btn-sm btn-rounded" data-url="https://www.google.com/search?q="> Google </a>
</div>`;

// 2. 修改默认active状态 - 从"搜索"改为"影视"
const searchGroupPattern = /<div class="search-group mb-2">\s*<a[^>]*class="[^"]*active[^"]*"[^>]*data-index="0"[^>]*>.*?搜索.*?<\/a>\s*<a[^>]*class="[^"]*"[^>]*data-index="1"[^>]*>.*?影视.*?<\/a>/s;

const newSearchGroup = `<div class="search-group mb-2">
<a href="javascript:;" class="btn btn-link btn-sm btn-rounded" data-index="0">
<i class="fas fa-search">
</i> 搜索 </a>
<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-index="1">
<i class="fas fa-video">
</i> 影视 </a>`;

// 尝试简单替换
console.log('Fixing search box HTML...');

// 删除搜索选项中的"站内"
if (content.includes('data-url="/search/"')) {
  // 更简单的方式：直接替换包含站内的那一行
  content = content.replace(
    /<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-url="\/search\/"> 站内 <\/a>/g,
    ''
  );
  console.log('Removed "站内" from search options');
}

// 更新第一个active按钮为Bing
content = content.replace(
  /<a href="javascript:;" class="btn btn-link btn-sm btn-rounded" data-url="https:\/\/cn\.bing\.com\/search\?q="/,
  '<a href="javascript:;" class="btn btn-link btn-sm btn-rounded active" data-url="https://cn.bing.com/search?q="'
);

console.log('Updated search box HTML');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Search box fix completed!');
