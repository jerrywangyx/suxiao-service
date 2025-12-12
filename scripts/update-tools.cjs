const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Updating tools...');

// 1. 修改"视频无水印"为"视频去水印"
content = content.replace(/视频无水印/g, '视频去水印');
console.log('Updated: 视频无水印 -> 视频去水印');

// 2. 交换JSON在线视图和图片压缩
// 先找到这两个工具的HTML块
const jsonPattern = /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #10b981"[^>]*>[\s\S]*?JSON在线视图[\s\S]*?<\/div><\/div><\/div>/;
const imgCompressPattern = /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #ff6b6b"[^>]*>[\s\S]*?图片压缩[\s\S]*?<\/div><\/div><\/div>/;

const jsonMatch = content.match(jsonPattern);
const imgCompressMatch = content.match(imgCompressPattern);

if (jsonMatch && imgCompressMatch) {
  const jsonHtml = jsonMatch[0];
  const imgCompressHtml = imgCompressMatch[0];

  // 使用临时标记来交换
  content = content.replace(jsonPattern, '___JSON_PLACEHOLDER___');
  content = content.replace(imgCompressPattern, '___IMG_COMPRESS_PLACEHOLDER___');
  content = content.replace('___JSON_PLACEHOLDER___', imgCompressHtml);
  content = content.replace('___IMG_COMPRESS_PLACEHOLDER___', jsonHtml);
  console.log('Swapped: JSON在线视图 <-> 图片压缩');
} else {
  console.log('Could not find JSON or 图片压缩 tools');
}

// 3. 交换地图和短链生成
const mapPattern = /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: red"[^>]*>[\s\S]*?地图[\s\S]*?<\/div><\/div><\/div>/;
const shortLinkPattern = /<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: #f59f00"[^>]*>[\s\S]*?短链生成[\s\S]*?<\/div><\/div><\/div>/;

const mapMatch = content.match(mapPattern);
const shortLinkMatch = content.match(shortLinkPattern);

if (mapMatch && shortLinkMatch) {
  const mapHtml = mapMatch[0];
  const shortLinkHtml = shortLinkMatch[0];

  content = content.replace(mapPattern, '___MAP_PLACEHOLDER___');
  content = content.replace(shortLinkPattern, '___SHORT_LINK_PLACEHOLDER___');
  content = content.replace('___MAP_PLACEHOLDER___', shortLinkHtml);
  content = content.replace('___SHORT_LINK_PLACEHOLDER___', mapHtml);
  console.log('Swapped: 地图 <-> 短链生成');
} else {
  console.log('Could not find 地图 or 短链生成 tools');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Tools update completed!');
