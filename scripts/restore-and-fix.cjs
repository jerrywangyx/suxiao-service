const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
const backupPath = path.join(__dirname, '..', 'reference', 'homepage-body.html.bak');

let content = fs.readFileSync(filePath, 'utf8');
let backup = fs.readFileSync(backupPath, 'utf8');

console.log('恢复工具直达和修复手机端logo...');

// 1. 从备份中提取工具直达部分
const toolDirectPattern = /<div class="col-12 col-lg-8 d-lg-flex tool-direct">[\s\S]*?<\/div><\/div><\/div><\/div><div class="col-12"><div class="card/;
const backupToolDirectMatch = backup.match(toolDirectPattern);

if (backupToolDirectMatch) {
  // 在当前文件中查找工具直达部分
  const currentToolDirectMatch = content.match(toolDirectPattern);

  if (currentToolDirectMatch) {
    // 替换工具直达部分
    content = content.replace(currentToolDirectMatch[0], backupToolDirectMatch[0]);
    console.log('已恢复工具直达部分');
  }
}

// 2. 修复手机端logo：将img标签替换为文字
content = content.replace(
  /<a href="\/" class="navbar-brand d-md-none" rel="home"><img[^>]*alt="[^"]*"><\/a>/,
  '<a href="/" class="navbar-brand d-md-none" rel="home"><span class="brand-text">速效盒子</span></a>'
);
console.log('已修复手机端logo');

// 3. 修改"视频无水印"为"视频去水印"
content = content.replace(/视频无水印/g, '视频去水印');
console.log('已修改：视频无水印 -> 视频去水印');

fs.writeFileSync(filePath, content, 'utf8');
console.log('修复完成！');
