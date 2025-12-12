const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

// 替换 aside-brand 的内容，将图片改为文字
// 原来是：<a href="..." class="aside-brand" rel="home"><img src="..." class="logo ..."><img src="..." class="logo-sm ..."></a>
// 改为：<a href="/" class="aside-brand" rel="home"><span class="brand-text">速效盒子</span></a>

const oldBrandPattern = /<a href="[^"]*" class="aside-brand" rel="home">\s*<img[^>]+class="logo[^>]+>\s*<img[^>]+class="logo-sm[^>]+>\s*<\/a>/;

const newBrand = '<a href="/" class="aside-brand" rel="home"><span class="brand-text">速效盒子</span></a>';

if (oldBrandPattern.test(content)) {
  content = content.replace(oldBrandPattern, newBrand);
  console.log('Updated logo to text: 速效盒子');
} else {
  console.log('Pattern not found, trying alternative...');

  // 查找aside-brand位置
  const brandStart = content.indexOf('class="aside-brand"');
  if (brandStart !== -1) {
    console.log('Found aside-brand at position:', brandStart);
    // 显示周围的内容
    console.log('Context:', content.substring(brandStart - 50, brandStart + 200));
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Logo update completed!');
