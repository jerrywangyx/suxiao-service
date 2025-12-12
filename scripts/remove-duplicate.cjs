const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

// 删除第一个重复的影视卡片（只有一个低端影视项的那个）
// 这个出现在工具直达结束之后，完整影视列表之前
const duplicatePattern = /<div class="col-12"><div class="card card-xl" id="c-1"><div class="card-header d-flex flex-nowrap text-nowrap gap-2 align-items-center"><a class="h4" href="https:\/\/tools\.liumingye\.cn\/category\/video"><i class="fas fa-sm fa-video"><\/i> 影视<\/a><ul class="card-tab d-flex flex-nowrap nav text-sm overflow-x-auto"><span class="nav-slider"><\/span><li class="nav-item"><span data-mid="3" class="nav-link active">在线看<\/span><\/li><li class="nav-item"><span data-mid="6" class="nav-link">下载<\/span><\/li><li class="nav-item"><span data-mid="7" class="nav-link">网盘<\/span><\/li><\/ul><\/div><div class="card-body"><div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-4 row-cols-xxl-5 g-2 g-md-3 list-grid list-grid-padding"><div title="以海外影视资源为主的老牌网站"><a role="button" class="list-item" cid="21" href="https:\/\/ddys\.la" target="_blank" rel="nofollow"><div class="media w-36 rounded"><img src="https:\/\/tools\.liumingye\.cn\/usr\/themes\/ITEM\/assets\/image\/default\.gif" data-src="https:\/\/cdn\.liumingye\.cn\/imgur\/In2xLR2\.png" class="media-content lazy"><\/div><div class="list-content"><div class="list-body"><div class="list-title text-md h-1x"> 低端影视 <\/div><div class="list-desc text-xx text-muted mt-1"><div class="h-1x">以海外影视资源为主的老牌网站<\/div><\/div><\/div><\/div><\/div><\/div>/;

// 查找并删除第一个出现的重复项
const match = content.match(duplicatePattern);
if (match) {
  content = content.replace(duplicatePattern, '');
  console.log('Removed duplicate video section (first occurrence)');
} else {
  console.log('Duplicate pattern not found, trying alternative approach...');

  // 尝试查找所有影视卡片的起始位置
  const videoCardStarts = [];
  let searchPos = 0;
  const searchPattern = '<div class="col-12"><div class="card card-xl" id="c-1"><div class="card-header d-flex flex-nowrap text-nowrap gap-2 align-items-center"><a class="h4" href="https://tools.liumingye.cn/category/video"><i class="fas fa-sm fa-video"></i> 影视</a>';

  while ((searchPos = content.indexOf(searchPattern, searchPos)) !== -1) {
    videoCardStarts.push(searchPos);
    searchPos += searchPattern.length;
  }

  console.log(`Found ${videoCardStarts.length} video sections at positions:`, videoCardStarts);

  if (videoCardStarts.length === 2) {
    // 找到第一个影视卡片的结束位置（在第二个开始之前）
    const firstStart = videoCardStarts[0];
    const secondStart = videoCardStarts[1];

    // 删除从第一个开始到第二个开始之间的内容
    content = content.substring(0, firstStart) + content.substring(secondStart);
    console.log('Removed first duplicate video section');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleanup completed!');
