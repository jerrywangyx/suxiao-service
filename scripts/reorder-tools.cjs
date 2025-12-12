const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let html = fs.readFileSync(filePath, 'utf8');

// 提取需要移动的工具项
const toolsToMove = [
  {
    name: 'JSON在线视图',
    pattern: /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #10b981" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-code"><\/i><\/span><\/div><div class="text-sm text-muted">JSON在线视图<\/div><a href="https:\/\/www\.bejson\.com\/jsonviewernew\/" target="_blank" class="list-goto"><\/a><\/div><\/div>/
  },
  {
    name: '在线抠图',
    pattern: /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #ec4899" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-image"><\/i><\/span><\/div><div class="text-sm text-muted">在线抠图<\/div><a href="https:\/\/www\.remove\.bg\/zh" target="_blank" class="list-goto"><\/a><\/div><\/div>/
  },
  {
    name: '视频无水印',
    pattern: /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #ef4444" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-water"><\/i><\/span><\/div><div class="text-sm text-muted">视频无水印<\/div><a href="https:\/\/dy\.kukutool\.com" target="_blank" class="list-goto"><\/a><\/div><\/div>/
  }
];

// 新增的AI图视频生成工具
const newTool = '<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-magic"></i></span></div><div class="text-sm text-muted">AI图视频生成</div><a href="https://aiwork-8eo.pages.dev/home" target="_blank" class="list-goto"></a></div></div>';

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

// 找到"今日热榜"工具的位置
const hotRankPattern = /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: linear-gradient\(45deg, #97b3ff, #2f66ff\)" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-fire"><\/i><\/span><\/div><div class="text-sm text-muted">今日热榜<\/div><a href="https:\/\/tophub\.today\/c\/news" target="_blank" class="list-goto"><\/a><\/div><\/div>/;

// 在"今日热榜"后面插入所有工具
const toolsToInsert = [...extractedTools, newTool].join('');
html = html.replace(hotRankPattern, (match) => {
  return match + toolsToInsert;
});

// 保存修改后的文件
fs.writeFileSync(filePath, html, 'utf8');
console.log('修改完成！');
