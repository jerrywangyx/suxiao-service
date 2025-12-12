const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let html = fs.readFileSync(filePath, 'utf8');

// 新增的AI创作工具
const newTool = '<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-wand-magic-sparkles"></i></span></div><div class="text-sm text-muted">AI创作</div><a href="https://tinywow.com/" target="_blank" class="list-goto"></a></div></div>';

// 找到"文档转换"工具的位置
const docConvertPattern = /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #44aefb" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="fas fa-file-upload"><\/i><\/span><\/div><div class="text-sm text-muted">文档转换<\/div><a href="https:\/\/pdfcandy\.com\/cn\/" target="_blank" class="list-goto"><\/a><\/div><\/div>/;

// 在"文档转换"后面插入AI创作工具
html = html.replace(docConvertPattern, (match) => {
  console.log('找到文档转换，在其后插入AI创作工具');
  return match + newTool;
});

// 保存修改后的文件
fs.writeFileSync(filePath, html, 'utf8');
console.log('修改完成！');
