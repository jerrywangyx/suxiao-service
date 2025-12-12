const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
const content = fs.readFileSync(filePath, 'utf8');

// 找到格式转换工具后面的 <div class="col-12"><div class="card card-xl" id="c-1">
// 在它前面添加 </div></div></div></div> 来关闭:
// 1. index-sudoku row (工具网格的row)
// 2. card-body
// 3. card card-xl flex-fill
// 4. col-12 col-lg-8 tool-direct

const searchStr = '<a href="https://convertio.co/zh" target="_blank" class="list-goto"></a></div></div><div class="col-12"><div class="card card-xl" id="c-1">';
const replaceStr = '<a href="https://convertio.co/zh" target="_blank" class="list-goto"></a></div></div></div></div></div></div><div class="col-12"><div class="card card-xl" id="c-1">';

if (content.includes(searchStr)) {
  const newContent = content.replace(searchStr, replaceStr);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Fixed layout structure successfully!');
} else {
  console.log('Search string not found. Content might be different.');
  // 尝试查找部分匹配
  if (content.includes('convertio.co/zh')) {
    console.log('Found convertio.co/zh');
  }
  if (content.includes('col-12"><div class="card card-xl" id="c-1"')) {
    console.log('Found video card structure');
  }
}
