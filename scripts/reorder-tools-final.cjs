const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('重新排序工具直达，按实用性和常用程度排列...');

// 按实用性和常用程度定义工具顺序
const toolsOrder = [
  {
    name: '今日热榜',
    icon: 'fas fa-fire',
    color: 'linear-gradient(45deg, #97b3ff, #2f66ff)',
    url: 'https://tophub.today/c/news'
  },
  {
    name: '视频去水印',
    icon: 'fas fa-water',
    color: '#ef4444',
    url: 'https://dy.kukutool.com'
  },
  {
    name: '图片压缩',
    icon: 'fas fa-compress',
    color: '#ff6b6b',
    url: 'https://tinypng.com'
  },
  {
    name: '在线PS',
    icon: 'fas fa-palette',
    color: '#4dabf7',
    url: 'https://www.photopea.com'
  },
  {
    name: 'PDF工具',
    icon: 'fas fa-file-pdf',
    color: '#e03131',
    url: 'https://www.ilovepdf.com/zh-cn'
  },
  {
    name: '格式转换',
    icon: 'fas fa-exchange-alt',
    color: '#f76707',
    url: 'https://convertio.co/zh'
  },
  {
    name: 'DeepL翻译',
    icon: 'fas fa-language',
    color: '#0f4c81',
    url: 'https://www.deepl.com/translator'
  },
  {
    name: '地图',
    icon: 'fas fa-map',
    color: 'red',
    url: 'https://ditu.amap.com/'
  },
  {
    name: '二维码生成',
    icon: 'fas fa-qrcode',
    color: '#ee3d7d',
    url: 'https://cli.im'
  },
  {
    name: '短链生成',
    icon: 'fas fa-link',
    color: '#f59f00',
    url: 'https://d.igdu.xyz'
  },
  {
    name: '临时邮箱',
    icon: 'fas fa-at',
    color: '#b5b4ff',
    url: 'https://temp-mail.io'
  },
  {
    name: '微信文件助手',
    icon: 'fab fa-weixin',
    color: '#1ba784',
    url: 'https://filehelper.weixin.qq.com'
  },
  {
    name: 'JSON在线视图',
    icon: 'fas fa-code',
    color: '#10b981',
    url: 'https://www.bejson.com/jsonviewernew/'
  },
  {
    name: '正则测试',
    icon: 'fas fa-code',
    color: '#20c997',
    url: 'https://regex101.com'
  },
  {
    name: 'Base64编解码',
    icon: 'fas fa-key',
    color: '#37b24d',
    url: 'https://base64.us'
  },
  {
    name: 'URL编解码',
    icon: 'fas fa-percentage',
    color: '#fa5252',
    url: 'https://www.bejson.com/enc/urlencode'
  },
  {
    name: '时间戳转换',
    icon: 'fas fa-clock',
    color: '#f06595',
    url: 'https://tool.lu/timestamp'
  },
  {
    name: 'MD5加密',
    icon: 'fas fa-lock',
    color: '#ae3ec9',
    url: 'https://www.cmd5.com'
  },
  {
    name: '在线抠图',
    icon: 'fas fa-image',
    color: '#ec4899',
    url: 'https://www.remove.bg/zh'
  },
  {
    name: '图床上传',
    icon: 'fas fa-cloud-upload-alt',
    color: '#22b8cf',
    url: 'https://imgbb.com'
  },
  {
    name: '颜色选择器',
    icon: 'fas fa-eye-dropper',
    color: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    url: 'https://colorhunt.co'
  },
  {
    name: 'Markdown编辑',
    icon: 'fas fab fa-markdown',
    color: '#495057',
    url: 'https://stackedit.io'
  },
  {
    name: '在线画板',
    icon: 'fas fa-pencil-alt',
    color: '#6741d9',
    url: 'https://excalidraw.com'
  },
  {
    name: '代码美化',
    icon: 'fas fa-terminal',
    color: '#212529',
    url: 'https://carbon.now.sh'
  },
  {
    name: '代码对比',
    icon: 'fas fa-not-equal',
    color: '#12b886',
    url: 'https://www.diffchecker.com'
  },
  {
    name: 'Cron表达式',
    icon: 'fas fa-calendar-alt',
    color: '#fd7e14',
    url: 'https://crontab.guru'
  },
  {
    name: '文档转换',
    icon: 'fas fa-file-upload',
    color: '#44aefb',
    url: 'https://pdfcandy.com/cn/'
  },
  {
    name: 'Unicode编码',
    icon: 'fas fa-font',
    color: '#ff8787',
    url: 'https://www.bejson.com/convert/unicode_chinese'
  },
  {
    name: '网络诊断',
    icon: 'fas fa-project-diagram',
    color: '#ef5959',
    url: 'https://ip.skk.moe'
  },
  {
    name: 'IP查询',
    icon: 'fas fa-globe',
    color: '#339af0',
    url: 'https://ip.sb'
  },
  {
    name: '临时分享',
    icon: 'fas fa-share-alt',
    color: '#ff7676',
    url: 'https://wormhole.app'
  },
  {
    name: '聚合直播',
    icon: 'fas fa-tv',
    color: '#ef5959',
    url: 'https://lemonlive.deno.dev'
  },
  {
    name: '网络收音机',
    icon: 'fas fa-guitar',
    color: '#ff5500',
    url: 'https://radio5.cn'
  },
  {
    name: 'Font Awesome',
    icon: 'fab fa-font-awesome-flag',
    color: 'linear-gradient(0deg,#434343 0%, #000000 100%)',
    url: 'https://fontawesome.com/v5/search?o=r&m=free'
  },
  {
    name: '一键激活',
    icon: 'fab fa-windows',
    color: '#0527af',
    url: 'https://kms.cx'
  }
];

// 生成工具HTML
function generateToolHtml(tool) {
  return `<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: ${tool.color}" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="${tool.icon}"></i></span></div><div class="text-sm text-muted">${tool.name}</div><a href="${tool.url}" target="_blank" class="list-goto"></a></div></div>`;
}

// 找到工具直达区域
const toolDirectPattern = /(<div class="index-sudoku row list text-center g-2 g-md-3 g-lg-4">)([\s\S]*?)(<\/div><\/div><\/div><\/div><div class="col-12">)/;

const match = content.match(toolDirectPattern);

if (match) {
  // 生成新的工具HTML
  let newToolsHtml = '';
  toolsOrder.forEach(tool => {
    newToolsHtml += generateToolHtml(tool);
  });

  // 替换整个工具区域
  content = content.replace(toolDirectPattern, `$1${newToolsHtml}$3`);
  console.log(`已重新排序 ${toolsOrder.length} 个工具`);
} else {
  console.log('未找到工具直达区域');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('工具排序完成！');
