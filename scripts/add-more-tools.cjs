const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'reference', 'homepage-body.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('添加20个新工具到工具直达...');

// 新增的20个工具
const newTools = [
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
    name: 'DeepL翻译',
    icon: 'fas fa-language',
    color: '#0f4c81',
    url: 'https://www.deepl.com/translator'
  },
  {
    name: '正则测试',
    icon: 'fas fa-code',
    color: '#20c997',
    url: 'https://regex101.com'
  },
  {
    name: 'Markdown编辑',
    icon: 'fas fab fa-markdown',
    color: '#495057',
    url: 'https://stackedit.io'
  },
  {
    name: '短链生成',
    icon: 'fas fa-link',
    color: '#f59f00',
    url: 'https://d.igdu.xyz'
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
    name: 'Base64编解码',
    icon: 'fas fa-key',
    color: '#37b24d',
    url: 'https://base64.us'
  },
  {
    name: '颜色选择器',
    icon: 'fas fa-eye-dropper',
    color: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    url: 'https://colorhunt.co'
  },
  {
    name: '时间戳转换',
    icon: 'fas fa-clock',
    color: '#f06595',
    url: 'https://tool.lu/timestamp'
  },
  {
    name: 'IP查询',
    icon: 'fas fa-globe',
    color: '#339af0',
    url: 'https://ip.sb'
  },
  {
    name: '图床上传',
    icon: 'fas fa-cloud-upload-alt',
    color: '#22b8cf',
    url: 'https://imgbb.com'
  },
  {
    name: 'Unicode编码',
    icon: 'fas fa-font',
    color: '#ff8787',
    url: 'https://www.bejson.com/convert/unicode_chinese'
  },
  {
    name: 'URL编解码',
    icon: 'fas fa-percentage',
    color: '#fa5252',
    url: 'https://www.bejson.com/enc/urlencode'
  },
  {
    name: 'MD5加密',
    icon: 'fas fa-lock',
    color: '#ae3ec9',
    url: 'https://www.cmd5.com'
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
  }
];

// 生成工具HTML
function generateToolHtml(tool) {
  return `<div class="col-4 col-md-3 col-md-2 col-lg-2"><div class="list-item"><div style="background: ${tool.color}" class="btn btn-link btn-icon btn-md btn-rounded mx-auto mb-2"><span><i class="${tool.icon}"></i></span></div><div class="text-sm text-muted">${tool.name}</div><a href="${tool.url}" target="_blank" class="list-goto"></a></div></div>`;
}

// 找到工具直达的结束位置（在在线抠图之后）
const toolDirectPattern = /(<div class="text-sm text-muted">在线抠图<\/div>[\s\S]*?<\/a><\/div><\/div>)([\s\S]*?<\/div><\/div><\/div><\/div>)/;

const match = content.match(toolDirectPattern);

if (match) {
  // 生成所有新工具的HTML
  let newToolsHtml = '';
  newTools.forEach(tool => {
    newToolsHtml += generateToolHtml(tool);
  });

  // 在在线抠图之后插入新工具
  content = content.replace(toolDirectPattern, `$1${newToolsHtml}$2`);
  console.log(`已添加 ${newTools.length} 个新工具`);
} else {
  console.log('未找到工具直达部分');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('工具添加完成！');
