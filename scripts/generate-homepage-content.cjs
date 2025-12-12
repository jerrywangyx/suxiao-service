const fs = require('fs');
const path = require('path');

// 读取 homepage-body.html
const htmlPath = path.join(__dirname, '../reference/homepage-body.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 转义特殊字符
const escaped = htmlContent
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

// 生成 JS 模块
const jsContent = `// Auto-generated file. Do not edit manually.
// Generated from reference/homepage-body.html

export const homepageContent = \`${escaped}\`;
`;

// 写入到 app 目录
const outputPath = path.join(__dirname, '../app/homepage-content.js');
fs.writeFileSync(outputPath, jsContent, 'utf8');

console.log('✅ Homepage content generated successfully');
