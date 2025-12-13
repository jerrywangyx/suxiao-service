/**
 * 首页工具区域重构脚本
 * 1. 将"工具直达"改成"我开发的工具"，只显示自定义的三个工具
 * 2. 在主内容区添加"工具"展示原有工具
 * 3. 隐藏影视和音乐导航及内容
 * 4. 隐藏热门站点模块
 * 5. 记录工具点击访问日志
 */
(function () {
  'use strict';

  /**
   * 记录访问日志
   * @param {string} type - 访问类型
   * @param {string} search - 搜索内容（可选）
   */
  function logVisit(type, search = null) {
    try {
      fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, search }),
      }).catch(() => {});
    } catch (e) {
      // 忽略错误
    }
  }

  // 我开发的工具配置（按用户指定顺序排列）
  // logType: 需要记录访问的类型，null 表示不在点击时记录（搜索时记录）
  const MY_TOOLS = [
    {
      name: 'VIP视频免费看',
      desc: '全网VIP视频解析 - 爱优腾芒等平台免费观看',
      icon: 'fas fa-play-circle',
      url: '/player',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      logType: null, // 搜索时记录
    },
    {
      name: 'VIP音乐免费听',
      desc: '全网VIP音乐下载 - 网易云QQ酷狗等免费听',
      icon: 'fas fa-music',
      url: '/music',
      gradient: 'linear-gradient(135deg, #a55eea 0%, #8854d0 100%)',
      logType: null, // 搜索时记录
    },
    {
      name: '视频去水印',
      desc: '抖音/快手/小红书/B站等短视频去水印下载',
      icon: 'fas fa-video',
      url: '/watermark',
      gradient: 'linear-gradient(135deg, #20bf6b 0%, #26de81 100%)',
      logType: null, // 搜索时记录
    },
    {
      name: '100+程序员工具',
      desc: 'IT-Tools - 100+开发者实用工具集合',
      icon: 'fas fa-code',
      url: '/tools/',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      logType: '程序员工具', // 点击时记录
    },
    {
      name: '图片压缩',
      desc: 'Google Squoosh - 高质量图片压缩工具',
      icon: 'fas fa-compress-alt',
      url: '/squoosh/',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      logType: '图片压缩', // 点击时记录
    },
    {
      name: '白板画图',
      desc: 'Excalidraw - 手绘风格在线协作白板',
      icon: 'fas fa-pencil-alt',
      url: '/draw/',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      logType: '白板画图', // 点击时记录
    },
  ];

  // 原有工具直达的工具列表（硬编码保留）
  const ORIGINAL_TOOLS = [
    { name: '今日热榜', url: 'https://tophub.today/c/news', icon: 'fas fa-fire', bg: 'linear-gradient(45deg, #97b3ff, #2f66ff)', desc: '全网热点实时追踪' },
    { name: '在线抠图', url: 'https://www.remove.bg/zh', icon: 'fas fa-image', bg: '#ec4899', desc: 'AI智能一键抠图' },
    { name: 'DeepL翻译', url: 'https://www.deepl.com/translator', icon: 'fas fa-language', bg: '#0f4c81', desc: '最精准的AI翻译' },
    { name: '短链生成', url: 'https://d.igdu.xyz', icon: 'fas fa-link', bg: '#f59f00', desc: '长链接转短链接' },
    { name: '在线PS', url: 'https://www.photopea.com', icon: 'fas fa-palette', bg: '#4dabf7', desc: '网页版Photoshop' },
    { name: 'PDF工具', url: 'https://www.ilovepdf.com/zh-cn', icon: 'fas fa-file-pdf', bg: '#e03131', desc: 'PDF编辑转换合并' },
    { name: '格式转换', url: 'https://convertio.co/zh', icon: 'fas fa-exchange-alt', bg: '#f76707', desc: '支持300+格式转换' },
    { name: '高德地图', url: 'https://ditu.amap.com/', icon: 'fas fa-map', bg: '#e03131', desc: '精准导航路线规划' },
    { name: '二维码生成', url: 'https://cli.im', icon: 'fas fa-qrcode', bg: '#ee3d7d', desc: '专业二维码制作' },
    { name: 'JSON格式化', url: 'https://www.bejson.com/jsonviewernew/', icon: 'fas fa-code', bg: '#10b981', desc: 'JSON美化校验' },
    { name: '正则测试', url: 'https://regex101.com', icon: 'fas fa-code', bg: '#20c997', desc: '正则表达式调试' },
    { name: 'Base64编解码', url: 'https://base64.us', icon: 'fas fa-key', bg: '#37b24d', desc: '编码解码转换' },
    { name: 'URL编解码', url: 'https://www.bejson.com/enc/urlencode', icon: 'fas fa-percentage', bg: '#fa5252', desc: 'URL参数编码解码' },
    { name: '时间戳转换', url: 'https://tool.lu/timestamp', icon: 'fas fa-clock', bg: '#f06595', desc: '时间戳日期互转' },
    { name: '颜色转换', url: 'https://www.sioe.cn/yingyong/yanse-rgb-16/', icon: 'fas fa-eye-dropper', bg: '#ae3ec9', desc: 'RGB/HEX颜色转换' },
    { name: 'MD5加密', url: 'https://www.cmd5.com', icon: 'fas fa-lock', bg: '#7950f2', desc: 'MD5加密解密查询' },
    { name: 'IP查询', url: 'https://ip.cn', icon: 'fas fa-globe', bg: '#228be6', desc: 'IP地址归属地查询' },
    { name: 'DNS查询', url: 'https://tool.chinaz.com/dns/', icon: 'fas fa-server', bg: '#15aabf', desc: '域名DNS解析检测' },
    { name: 'Whois查询', url: 'https://whois.chinaz.com', icon: 'fas fa-search', bg: '#12b886', desc: '域名注册信息查询' },
    { name: '网站测速', url: 'https://www.17ce.com', icon: 'fas fa-tachometer-alt', bg: '#40c057', desc: '全国多节点测速' },
    { name: '在线画图', url: 'https://www.processon.com', icon: 'fas fa-project-diagram', bg: '#82c91e', desc: '流程图思维导图' },
    { name: '思维导图', url: 'https://gitmind.cn', icon: 'fas fa-brain', bg: '#fab005', desc: '免费在线脑图工具' },
    { name: '在线表格', url: 'https://www.kdocs.cn', icon: 'fas fa-table', bg: '#fd7e14', desc: '金山文档在线协作' },
    { name: '草料二维码', url: 'https://cli.im', icon: 'fas fa-qrcode', bg: '#f03e3e', desc: '二维码生成美化' },
    { name: '临时邮箱', url: 'https://www.linshi-email.com', icon: 'fas fa-envelope', bg: '#e64980', desc: '一次性临时邮箱' },
    { name: '文件转换', url: 'https://www.aconvert.com/cn/', icon: 'fas fa-file-alt', bg: '#be4bdb', desc: '各种文件格式转换' },
    { name: 'OCR识别', url: 'https://web.baimiaoapp.com', icon: 'fas fa-eye', bg: '#7950f2', desc: '图片文字识别提取' },
    { name: '在线录屏', url: 'https://recordscreen.io', icon: 'fas fa-video', bg: '#4c6ef5', desc: '网页端屏幕录制' },
    { name: '图床工具', url: 'https://imgse.com', icon: 'fas fa-images', bg: '#228be6', desc: '免费图片上传托管' },
  ];

  /**
   * 页面加载完成后执行
   */
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  /**
   * 创建"我开发的工具"区块（简洁超链接风格，位置靠上，兼容手机端）
   */
  function createMyToolsSection() {
    const isMobile = window.innerWidth < 768;
    
    const section = document.createElement('div');
    section.id = 'my-tools-section';
    section.style.cssText = `margin: ${isMobile ? '5px 0 10px' : '8px 0 15px'}; padding: 0 ${isMobile ? '10px' : '15px'};`;
    
    // 生成超链接列表（鼠标悬停显示详细说明）
    // 为需要记录的工具添加 onclick 事件
    const linksHTML = MY_TOOLS.map(tool => {
      const onclickAttr = tool.logType ? `onclick="(function(){try{fetch('/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'${tool.logType}'})}).catch(function(){});}catch(e){}})();"` : '';
      return `
      <a href="${tool.url}" target="_blank" title="${tool.desc}" ${onclickAttr} style="
        display: inline-flex;
        align-items: center;
        gap: ${isMobile ? '4px' : '6px'};
        padding: ${isMobile ? '6px 12px' : '8px 16px'};
        background: ${tool.gradient};
        color: white;
        text-decoration: none;
        border-radius: 20px;
        font-size: ${isMobile ? '12px' : '13px'};
        font-weight: 500;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        white-space: nowrap;
      ">
        <i class="${tool.icon}"></i>
        ${tool.name}
      </a>
    `;
    }).join('');

    section.innerHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: ${isMobile ? '8px' : '10px'};">
        ${linksHTML}
      </div>
    `;
    
    return section;
  }

  /**
   * 把"我开发的工具"插入到搜索框下面（.content区域最前面）
   */
  function insertMyToolsAfterSearch() {
    // 检查是否已插入
    if (document.querySelector('#my-tools-section')) return;
    
    const myToolsSection = createMyToolsSection();
    
    // 方案1: 找到 .content 区域，插入到最前面（在 .row 的第一个位置）
    const contentArea = document.querySelector('.site-main .content');
    if (contentArea) {
      const rowContainer = contentArea.querySelector('.row');
      if (rowContainer) {
        // 创建一个 col-12 容器
        const wrapper = document.createElement('div');
        wrapper.className = 'col-12';
        wrapper.appendChild(myToolsSection);
        rowContainer.prepend(wrapper);
        console.log('[ToolsInject] 工具已插入content区域最前面');
        return;
      }
    }
    
    // 方案2: 找到 .search-child，在其后插入
    const searchChild = document.querySelector('.search-child');
    if (searchChild) {
      searchChild.after(myToolsSection);
      console.log('[ToolsInject] 工具已插入search-child后面');
      return;
    }
    
    // 方案3: 找到搜索表单，在其父容器后插入
    const searchForm = document.querySelector('form .form-control[placeholder]');
    if (searchForm) {
      const form = searchForm.closest('form');
      if (form && form.parentNode) {
        form.parentNode.appendChild(myToolsSection);
        console.log('[ToolsInject] 工具已插入搜索表单后');
        return;
      }
    }
    
    // 方案4: 备用 - 插入到 body 开头
    const siteMain = document.querySelector('.site-main');
    if (siteMain) {
      siteMain.prepend(myToolsSection);
      console.log('[ToolsInject] 工具已插入site-main开头');
    }
  }

  /**
   * 完全隐藏工具直达模块
   */
  function hideToolDirect() {
    // 隐藏 .tool-direct 区域
    const toolDirectWrapper = document.querySelector('.tool-direct');
    if (toolDirectWrapper) {
      toolDirectWrapper.remove();
      console.log('[ToolsInject] 工具直达模块已移除');
    }

    // 也检查包含"工具直达"文字的卡片
    document.querySelectorAll('.card, .card-xl').forEach(card => {
      const header = card.querySelector('.card-header .h4, .card-header h4');
      if (header && header.textContent.includes('工具直达')) {
        card.remove();
      }
    });
  }

  /**
   * 创建工具内容区卡片（使用硬编码的工具列表）
   */
  function createToolNavCard() {
    const toolNavCard = document.createElement('div');
    toolNavCard.className = 'card card-xl';
    toolNavCard.id = 'c-toolnav';
    
    // 生成工具列表 HTML
    const toolsHTML = ORIGINAL_TOOLS.map(tool => {
      const bgStyle = tool.bg.includes('gradient') ? tool.bg : `background: ${tool.bg}`;
      
      return `
        <div title="${tool.desc}">
          <a role="button" class="list-item" href="${tool.url}" target="_blank" rel="nofollow">
            <div class="media w-36 rounded" style="${bgStyle}; display: flex; align-items: center; justify-content: center; min-height: 48px;">
              <i class="${tool.icon}" style="font-size: 20px; color: white;"></i>
            </div>
            <div class="list-content">
              <div class="list-body">
                <div class="list-title text-md h-1x">${tool.name}</div>
                <div class="list-desc text-xx text-muted mt-1">
                  <div class="h-1x">${tool.desc}</div>
                </div>
              </div>
            </div>
          </a>
        </div>
      `;
    }).join('');

    toolNavCard.innerHTML = `
      <div class="card-header d-flex flex-nowrap text-nowrap gap-2 align-items-center">
        <div class="h4">
          <i class="fas fa-sm fa-compass"></i> 工具
        </div>
      </div>
      <div class="card-body">
        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-4 row-cols-xxl-5 g-2 g-md-3 list-grid list-grid-padding">
          ${toolsHTML}
        </div>
      </div>
    `;
    
    return toolNavCard;
  }

  /**
   * 在主内容区添加工具卡片
   */
  function addToolNavContent() {
    const mainContent = document.querySelector('.site-main .container, .site-main');
    if (!mainContent) return;

    // 检查是否已添加
    if (document.querySelector('#c-toolnav')) return;

    // 创建工具卡片
    const toolNavCard = createToolNavCard();

    // 找到第一个带 c- 前缀 id 的卡片，插入到它前面
    const firstCard = mainContent.querySelector('.card.card-xl[id^="c-"]');
    if (firstCard && firstCard.parentNode) {
      firstCard.parentNode.insertBefore(toolNavCard, firstCard);
      console.log('[ToolsInject] 工具内容区已添加（30个工具）');
    }
  }

  /**
   * 隐藏影视和音乐相关的导航和内容
   */
  function hideVideoAndMusic() {
    // 隐藏侧边栏中的影视和音乐导航
    const asideMenu = document.querySelector('ul.aside-menu');
    if (asideMenu) {
      const menuItems = asideMenu.querySelectorAll(':scope > li.menu-item');
      menuItems.forEach(item => {
        const link = item.querySelector(':scope > a');
        if (link) {
          const text = link.textContent.trim();
          const target = link.getAttribute('data-target');
          // data-target="1" 是影视，data-target="2" 是音乐
          if (target === '1' || target === '2' || 
              text.includes('影视') || text.includes('音乐')) {
            item.style.display = 'none';
          }
        }
      });
    }

    // 隐藏主内容区的影视和音乐卡片
    const mainContent = document.querySelector('.site-main');
    if (mainContent) {
      const cards = mainContent.querySelectorAll('.card.card-xl[id^="c-"]');
      cards.forEach(card => {
        const title = card.querySelector('.card-header .h4');
        if (title) {
          const text = title.textContent.trim();
          if (text.includes('影视') || text.includes('音乐')) {
            card.style.display = 'none';
          }
        }
      });
    }

    console.log('[ToolsInject] 影视和音乐导航已隐藏');
  }

  /**
   * 修改侧边栏工具箱导航，点击滚动到工具内容区
   */
  function updateToolboxNavigation() {
    const asideMenu = document.querySelector('ul.aside-menu');
    if (!asideMenu) return;

    const menuItems = asideMenu.querySelectorAll(':scope > li.menu-item');
    menuItems.forEach(item => {
      const link = item.querySelector(':scope > a[data-target]');
      if (link) {
        const target = link.getAttribute('data-target');
        const text = link.textContent.trim();
        // data-target="15" 是工具箱
        if (target === '15' || text.includes('工具箱') || text.includes('工具')) {
          // 修改名称
          const textEl = link.querySelector('.menu-text');
          if (textEl) {
            textEl.textContent = '工具';
          }
          // 修改图标
          const iconEl = link.querySelector('.menu-icon i');
          if (iconEl) {
            iconEl.className = 'fas fa-compass fa-sm';
          }
          // 改为滚动到工具内容区
          link.removeAttribute('data-target');
          link.setAttribute('href', '#c-toolnav');
          link.removeAttribute('target');
          link.onclick = function(e) {
            e.preventDefault();
            const toolNavCard = document.querySelector('#c-toolnav');
            if (toolNavCard) {
              toolNavCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          };
          
          // 移到第一个位置
          asideMenu.insertBefore(item, asideMenu.firstChild);
        }
      }
    });

    console.log('[ToolsInject] 工具已设置为滚动到内容区');
  }

  /**
   * 隐藏原有的工具箱内容区
   */
  function hideOriginalToolbox() {
    // 隐藏 id="c-15" 的工具箱内容区
    const toolboxCard = document.querySelector('.card.card-xl[id="c-15"]');
    if (toolboxCard) {
      toolboxCard.style.display = 'none';
      console.log('[ToolsInject] 原工具箱内容区已隐藏');
    }

    // 也查找包含"工具箱"文字的卡片
    document.querySelectorAll('.card.card-xl[id^="c-"]').forEach(card => {
      const title = card.querySelector('.card-header .h4');
      if (title && title.textContent.includes('工具箱')) {
        card.style.display = 'none';
      }
    });
  }

  /**
   * 隐藏热门站点模块
   */
  function hideHotSites() {
    // 方案1：找到 .hot-rank 类
    const hotRankSection = document.querySelector('.hot-rank');
    if (hotRankSection) {
      hotRankSection.style.display = 'none';
    }

    // 方案2：查找包含"热门"或"热榜"文字的卡片/区域
    document.querySelectorAll('.card, .card-xl, [class*="hot"], [class*="rank"]').forEach(el => {
      const header = el.querySelector('.card-header .h4, .card-header h4, .h4, h4');
      if (header) {
        const text = header.textContent.trim();
        if (text.includes('热门') || text.includes('热榜') || text.includes('热站')) {
          el.style.display = 'none';
        }
      }
    });

    // 方案3：直接找侧边栏中的热门模块
    document.querySelectorAll('.aside-item, .sidebar-item').forEach(el => {
      const title = el.querySelector('.h4, h4, .title');
      if (title && (title.textContent.includes('热门') || title.textContent.includes('热榜'))) {
        el.style.display = 'none';
      }
    });

    console.log('[ToolsInject] 热门站点已隐藏');
  }

  /**
   * 主函数
   */
  function init() {
    console.log('[ToolsInject] 开始页面重构...');

    // 1. 隐藏热门站点模块
    hideHotSites();

    // 2. 隐藏影视和音乐导航及内容
    hideVideoAndMusic();

    // 3. 隐藏原有的工具箱内容区
    hideOriginalToolbox();

    // 4. 完全隐藏工具直达模块
    hideToolDirect();

    // 5. 把"我开发的工具"插入到搜索框下面
    insertMyToolsAfterSearch();

    // 5. 在主内容区添加工具卡片（30个常用工具）
    addToolNavContent();

    // 6. 修改侧边栏工具，点击滚动到内容区
    updateToolboxNavigation();

    console.log('[ToolsInject] 页面重构完成');
  }

  // 页面加载完成后执行
  onReady(init);
})();
