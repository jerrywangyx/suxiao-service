import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export const metadata = {
  title: '云岫 VIP 播放解析',
  description: '简单输入视频地址即可切换多条解析线路，并记录播放请求日志。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
