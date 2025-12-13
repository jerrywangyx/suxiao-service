'use client';

import { useState, useEffect } from 'react';
import './watermark.css';

/**
 * 记录访问日志
 */
async function logVisit(visitType, searchContent = null) {
  try {
    await fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitType, searchContent }),
    });
  } catch (e) {
    // 忽略错误
  }
}

/**
 * 检测视频平台类型
 */
function detectPlatform(url) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com') || lowerUrl.includes('tiktok.com')) return 'douyin';
  if (lowerUrl.includes('kuaishou.com') || lowerUrl.includes('gifshow.com')) return 'kuaishou';
  if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) return 'xiaohongshu';
  if (lowerUrl.includes('weibo.com') || lowerUrl.includes('weibo.cn')) return 'weibo';
  if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) return 'bilibili';
  return 'generic';
}

/**
 * 前端直接调用第三方去水印 API
 */
async function parseWatermark(url) {
  // 从分享文本中提取URL
  const urlMatch = url.match(/https?:\/\/[^\s]+/);
  const extractedUrl = urlMatch ? urlMatch[0] : url;
  
  // 检查是否是有效的 URL
  try {
    new URL(extractedUrl);
  } catch {
    return { success: false, message: '请输入有效的视频链接（需要包含 http:// 或 https://）' };
  }

  const platform = detectPlatform(extractedUrl);
  
  // 根据平台选择对应的 API
  const apiMap = {
    douyin: `https://api.pearktrue.cn/api/video/douyin/?url=${encodeURIComponent(extractedUrl)}`,
    kuaishou: `https://api.pearktrue.cn/api/video/kuaishou/?url=${encodeURIComponent(extractedUrl)}`,
    xiaohongshu: `https://api.pearktrue.cn/api/video/xhs/?url=${encodeURIComponent(extractedUrl)}`,
    weibo: `https://api.pearktrue.cn/api/video/weibo/?url=${encodeURIComponent(extractedUrl)}`,
    bilibili: `https://api.pearktrue.cn/api/video/bilibili/?url=${encodeURIComponent(extractedUrl)}`,
    generic: `https://api.pearktrue.cn/api/video/?url=${encodeURIComponent(extractedUrl)}`,
  };

  const apiUrl = apiMap[platform];

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const isVideo = !!data.data.video;
      return {
        success: true,
        data: {
          type: isVideo ? 'video' : 'image',
          title: data.data.title || '',
          author: data.data.author || '',
          cover: data.data.cover || '',
          url: isVideo ? data.data.video : (data.data.images?.[0] || data.data.url || ''),
          images: data.data.images || [],
          platform: platform,
        }
      };
    }
    return { success: false, message: '解析失败，请检查链接是否正确' };
  } catch (error) {
    console.error('解析失败:', error);
    return { success: false, message: '解析失败，可能是网络问题，请稍后重试' };
  }
}

// SVG 图标
const Icons = {
  Paste: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Clear: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Loading: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
};

// 支持的平台列表
const supportedPlatforms = [
  { name: '抖音', icon: '🎵' },
  { name: '快手', icon: '📹' },
  { name: '小红书', icon: '📕' },
  { name: '微博', icon: '🔴' },
  { name: 'B站', icon: '📺' },
  { name: 'TikTok', icon: '🎶' },
  { name: 'Instagram', icon: '📷' },
  { name: 'Twitter/X', icon: '🐦' },
  { name: 'Facebook', icon: '👤' },
  { name: 'YouTube', icon: '▶️' },
  { name: '皮皮虾', icon: '🦐' },
  { name: '西瓜视频', icon: '🍉' },
];

export default function WatermarkClient({ initialUrl }) {
  const [inputUrl, setInputUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 初始URL自动解析
  useEffect(() => {
    if (initialUrl) {
      handleParse();
    }
  }, []);

  // 粘贴链接
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputUrl(text);
    } catch (err) {
      console.error('粘贴失败:', err);
    }
  };

  // 清除输入
  const handleClear = () => {
    setInputUrl('');
    setResult(null);
    setError('');
  };

  // 解析视频（前端直接调用第三方 API）
  const handleParse = async () => {
    if (!inputUrl.trim()) {
      setError('请输入视频链接');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    // 记录去水印访问日志（点击解析就记录）
    logVisit('视频去水印', inputUrl.trim());

    try {
      // 前端直接调用第三方 API
      const parseResult = await parseWatermark(inputUrl.trim());

      if (parseResult.success && parseResult.data) {
        setResult(parseResult.data);
      } else {
        setError(parseResult.message || '解析失败，请检查链接是否正确');
      }
    } catch (err) {
      console.error('解析失败:', err);
      setError('解析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 复制链接
  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('链接已复制');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 下载文件 - 通过代理下载
  const handleDownload = (url) => {
    // 使用代理 API 下载
    const proxyUrl = `/api/music/search?action=download&url=${encodeURIComponent(url)}`;
    
    // 创建隐藏的 a 标签触发下载
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = 'video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="watermark-page">
      {/* 背景装饰 */}
      <div className="bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="watermark-container">
        {/* 头部 */}
        <header className="watermark-header">
          <h1 className="title">
            <span className="gradient-text">视频去水印</span>
          </h1>
          <p className="subtitle">
            支持130+平台视频、图片、实况Live图去水印下载
          </p>
        </header>

        {/* 搜索框 */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="粘贴视频/图片链接，支持抖音、快手、小红书、微博等"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleParse()}
            />
            <div className="search-actions">
              <button className="action-btn paste-btn" onClick={handlePaste} title="粘贴链接">
                <Icons.Paste />
                <span>粘贴</span>
              </button>
              {inputUrl && (
                <button className="action-btn clear-btn" onClick={handleClear} title="清除">
                  <Icons.Clear />
                </button>
              )}
            </div>
          </div>
          <button 
            className={`parse-btn ${loading ? 'loading' : ''}`} 
            onClick={handleParse}
            disabled={loading}
          >
            {loading ? (
              <>
                <Icons.Loading />
                <span>解析中...</span>
              </>
            ) : (
              <>
                <Icons.Download />
                <span>开始解析</span>
              </>
            )}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 解析结果 */}
        {result && (
          <div className="result-section">
            <div className="result-card">
              {/* 信息 */}
              <div className="result-info">
                <h3 className="result-title">{result.title || '无标题'}</h3>
                {result.author && (
                  <p className="result-author">作者：{result.author}</p>
                )}

                {/* 操作按钮 */}
                <div className="download-actions">
                  {result.url && (
                    <a 
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn primary"
                    >
                      <Icons.Play />
                      <span>播放视频</span>
                    </a>
                  )}
                  {result.url && (
                    <button 
                      className="download-btn secondary"
                      onClick={() => handleCopy(result.url)}
                    >
                      <Icons.Copy />
                      <span>复制地址</span>
                    </button>
                  )}
                </div>

                {/* 多图片列表 */}
                {result.images && result.images.length > 0 && (
                  <div className="images-list">
                    <h4>图片列表 ({result.images.length}张)</h4>
                    <div className="images-grid">
                      {result.images.map((img, index) => (
                        <div key={index} className="image-item">
                          <img src={img} alt={`图片${index + 1}`} />
                          <a 
                            href={img} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="image-download"
                            download
                          >
                            <Icons.Download />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 支持平台 */}
        <div className="platforms-section">
          <h2 className="section-title">支持平台</h2>
          <div className="platforms-grid">
            {supportedPlatforms.map((platform, index) => (
              <div key={index} className="platform-item">
                <span className="platform-icon">{platform.icon}</span>
                <span className="platform-name">{platform.name}</span>
              </div>
            ))}
            <div className="platform-item more">
              <span className="platform-icon">➕</span>
              <span className="platform-name">更多...</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
