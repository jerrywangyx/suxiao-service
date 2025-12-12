const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

// 统计替换前的数量
const beforeCount = (content.match(/https:\/\/tools\.liumingye\.cn/g) || []).length;
console.log(`Found ${beforeCount} links to tools.liumingye.cn`);

// 替换所有指向 tools.liumingye.cn 的链接
// 1. 分类链接: https://tools.liumingye.cn/category/xxx -> /category/xxx (或者根据需要改为 #)
content = content.replace(/https:\/\/tools\.liumingye\.cn\/category\/[^"]+/g, '#');

// 2. 站点详情链接: https://tools.liumingye.cn/site/xxx/ -> # (因为本站可能没有详情页)
content = content.replace(/https:\/\/tools\.liumingye\.cn\/site\/[^"]+/g, '#');

// 3. 首页链接: https://tools.liumingye.cn/ -> /
content = content.replace(/https:\/\/tools\.liumingye\.cn\//g, '/');

// 统计替换后的数量
const afterCount = (content.match(/https:\/\/tools\.liumingye\.cn/g) || []).length;
console.log(`After replacement: ${afterCount} links remaining`);
console.log(`Replaced ${beforeCount - afterCount} links`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Links updated successfully!');
