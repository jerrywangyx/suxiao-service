const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Adding footer to homepage...');

// 在HTML末尾添加footer（在最后的</div>之前）
const footerHtml = `
<footer class="site-footer">
  <div class="footer-content">
    <p>© 2025 | 速效盒子</p>
  </div>
</footer>`;

// 在content div结束之前插入footer
// 查找最后的</div>标签（通常是content或site-wrapper的结束标签）
const lastDivIndex = content.lastIndexOf('</div>');
if (lastDivIndex !== -1) {
  content = content.substring(0, lastDivIndex) + footerHtml + '\n' + content.substring(lastDivIndex);
  console.log('Added footer before last </div>');
} else {
  // 如果找不到</div>，就直接追加到末尾
  content += footerHtml;
  console.log('Added footer to end of file');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Footer addition completed!');
