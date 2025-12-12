import Script from 'next/script';
import HomepageContent from './components/HomepageContent';
import { homepageContent } from './homepage-content.js';

// 强制静态生成，避免 Edge Runtime 在 Cloudflare Pages 上的兼容性问题
export const dynamic = 'force-static';
export const revalidate = false;

// 不移除script标签，保留完整的HTML以确保JavaScript正常工作

const searchData = [
  {
    name: '去水印',
    icon: 'fas fa-magic',
    child: [],
  },
  {
    name: '影视',
    icon: 'fas fa-video',
    child: [],
  },
  {
    name: '音乐',
    icon: 'fas fa-music',
    child: [],
  },
];

const serializedSearchData = JSON.stringify(searchData).replace(/</g, '\\u003c');

const searchEnhancerScript = `
(function () {
  function onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else {
      cb();
    }
  }

  var placeholders = {
    '0': '粘贴抖音、快手、小红书等视频链接…',
    '1': '输入视频播放地址或视频名称…',
    '2': '请输入歌曲或歌手名称…'
  };

  function updatePlaceholder(index) {
    var search = document.getElementById('search');
    if (!search) return;
    var input = search.querySelector('input');
    if (input && placeholders[index]) {
      input.placeholder = placeholders[index];
    }
  }

  function ensureVideoDefault() {
    var search = document.getElementById('search');
    if (!search) return;
    // 影视标签的data-index是1，默认选中
    var videoTab = search.querySelector('.search-group a[data-index="1"]');
    if (videoTab && !videoTab.classList.contains('active')) {
      videoTab.click();
    }
    updatePlaceholder('1');
  }

  function setupTabSwitch() {
    var search = document.getElementById('search');
    if (!search) return;
    var input = search.querySelector('input');
    var tabs = search.querySelectorAll('.search-group a[data-index]');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var index = this.dataset.index;
        updatePlaceholder(index);
        // 切换 tab 时清空输入框
        if (input) {
          input.value = '';
        }
      });
    });
  }

  function setupVipRedirect() {
    var search = document.getElementById('search');
    if (!search) return;
    var form = search.querySelector('form');
    var input = search.querySelector('input');
    if (!form || !input) return;
    form.addEventListener('submit', function (event) {
      var activeTab = search.querySelector('.search-group a.active');
      var keyword = input.value.trim();

      // 去水印标签的data-index是0，跳转到去水印页面
      if (activeTab && activeTab.dataset.index === '0') {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) {
          event.stopImmediatePropagation();
        }
        if (!keyword) {
          window.alert('请输入需要解析的视频/图片链接');
          return;
        }
        var target = '/watermark?url=' + encodeURIComponent(keyword);
        window.location.href = target;
      }

      // 影视标签的data-index是1，跳转到VIP解析页
      if (activeTab && activeTab.dataset.index === '1') {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) {
          event.stopImmediatePropagation();
        }
        if (!keyword) {
          window.alert('请输入需要解析的视频地址');
          return;
        }
        try {
          sessionStorage.setItem('playerSearchKeyword', keyword);
        } catch (error) {
          console.warn('无法写入会话存储', error);
        }
        var target = '/player?url=' + encodeURIComponent(keyword);
        window.location.href = target;
      }

      // 音乐标签的data-index是2，跳转到音乐搜索页
      if (activeTab && activeTab.dataset.index === '2') {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) {
          event.stopImmediatePropagation();
        }
        if (!keyword) {
          window.alert('请输入歌曲或歌手名称');
          return;
        }
        var target = '/music?name=' + encodeURIComponent(keyword);
        window.location.href = target;
      }
    }, true);
  }

  onReady(function () {
    ensureVideoDefault();
    setupTabSwitch();
    setupVipRedirect();
  });
})();
`.replace(/</g, '\\u003c');

export default async function HomePage() {
  const markup = homepageContent;

  return (
    <>
      <HomepageContent html={markup} />
      <Script
        id="lm-tools-search-data"
        dangerouslySetInnerHTML={{ __html: `window.searchData = ${serializedSearchData};` }}
      />
      <Script
        id="lm-tools-search-enhance"
        dangerouslySetInnerHTML={{ __html: searchEnhancerScript }}
      />
      <Script
        id="lm-tools-bootstrap"
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        crossOrigin="anonymous"
      />
      <Script
        id="lm-tools-main"
        src="https://tools.liumingye.cn/usr/themes/ITEM/assets/js/main.min.js?v=250824"
      />
      <Script
        id="custom-nav-handler"
        src="/nav-handler.js"
        strategy="afterInteractive"
      />
      <Script
        id="custom-search-handler"
        src="/search-handler.js"
        strategy="afterInteractive"
      />
      <Script
        id="tools-inject"
        src="/tools-inject.js"
        strategy="afterInteractive"
      />
    </>
  );
}
