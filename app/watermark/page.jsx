import WatermarkClient from './WatermarkClient';

export const runtime = 'edge';

export const metadata = {
  title: '视频去水印 - 免费在线解析',
  description: '支持抖音、快手、小红书、微博、B站等130+平台视频、图片去水印下载',
};

export default function WatermarkPage({ searchParams }) {
  const url = searchParams?.url || '';
  
  return <WatermarkClient initialUrl={url} />;
}
