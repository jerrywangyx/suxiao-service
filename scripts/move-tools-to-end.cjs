const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let html = fs.readFileSync(filePath, 'utf8');

// 提取需要移动到最后的工具项
const toolsToMove = [
  {
    name: '地图',
    pattern: /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: red" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-map"><\/i><\/span><\/div><div class="text-sm text-muted">地图<\/div><a href="https:\/\/ditu\.amap\.com\/" target="_blank" class="list-goto"><\/a><\/div><\/div>/
  },
  {
    name: '微信文件助手',
    pattern: /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #1ba784" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fab fa-weixin"><\/i><\/span><\/div><div class="text-sm text-muted">微信文件助手<\/div><a href="https:\/\/filehelper\.weixin\.qq\.com" target="_blank" class="list-goto"><\/a><\/div><\/div>/
  },
  {
    name: '临时邮箱',
    pattern: /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #b5b4ff" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-at"><\/i><\/span><\/div><div class="text-sm text-muted">临时邮箱<\/div><a href="https:\/\/temp-mail\.io" target="_blank" class="list-goto"><\/a><\/div><\/div>/
  }
];

// 提取工具HTML代码
const extractedTools = [];
toolsToMove.forEach(tool => {
  const match = html.match(tool.pattern);
  if (match) {
    extractedTools.push(match[0]);
    console.log(`找到: ${tool.name}`);
  } else {
    console.log(`未找到: ${tool.name}`);
  }
});

// 从原位置删除这些工具
toolsToMove.forEach(tool => {
  html = html.replace(tool.pattern, '');
});

// 找到"Font Awesome"工具的位置（当前是最后一个工具）
const fontAwesomePattern = /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: linear-gradient\(0deg,#434343 0%, #000000 100%\)" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fab fa-font-awesome-flag"><\/i><\/span><\/div><div class="text-sm text-muted">Font Awesome<\/div><a href="https:\/\/fontawesome\.com\/v5\/search\?o=r&amp;m=free" target="_blank" class="list-goto"><\/a><\/div><\/div>/;

// 在"Font Awesome"后面插入这些工具
const toolsToInsert = extractedTools.join('');
html = html.replace(fontAwesomePattern, (match) => {
  return match + toolsToInsert;
});

// 保存修改后的文件
fs.writeFileSync(filePath, html, 'utf8');
console.log('修改完成！');
