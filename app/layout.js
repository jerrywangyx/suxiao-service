import Script from 'next/script';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export const metadata = {
  title: '速效盒子 | 视频VIP 解析',
  description: '速效盒子聚合常用工具，并提供独立的 VIP 解析入口，保持简洁体验。',
  icons: {
    icon: 'https://tools.liumingye.cn/usr/themes/ITEM/assets/image/favicon.ico',
    shortcut: 'https://tools.liumingye.cn/usr/themes/ITEM/assets/image/favicon.ico',
  },
};

const themeBootstrapper = `
  (function() {
    var key = 'data-bs-theme';
    var state = localStorage.getItem(key) || 'default';
    function setTheme(target) {
      document.documentElement.setAttribute(key, target);
    }
    if (state === 'dark' || state === 'light') {
      setTheme(state);
    } else {
      localStorage.setItem(key, 'default');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
      if (localStorage.getItem(key) === 'default') {
        setTheme(event.matches ? 'dark' : 'light');
      }
    });
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://tools.liumingye.cn" />
        <link
          rel="stylesheet"
          href="https://tools.liumingye.cn/usr/themes/ITEM/assets/css/main.min.css?v=250824"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapper }} />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
