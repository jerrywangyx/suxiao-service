'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * 支持的平台列表配置
 */
const SUPPORTED_PLATFORMS = [
  { name: '抖音', icon: '🎵', color: '#000000' },
  { name: '快手', icon: '🎬', color: '#FF5722' },
  { name: '小红书', icon: '📕', color: '#FE2C55' },
  { name: 'B站', icon: '📺', color: '#00A1D6' },
  { name: '微博', icon: '🔴', color: '#E6162D' },
  { name: '皮皮虾', icon: '🦐', color: '#FF6B6B' },
  { name: '最右', icon: '👉', color: '#FFD93D' },
  { name: '微视', icon: '📹', color: '#FF9500' },
];

/**
 * 视频去水印页面组件
 * @description 支持抖音、快手、小红书等平台视频去水印下载
 */
export default function WatermarkPage() {
  // 输入的视频链接
  const [url, setUrl] = useState('');
  // 解析结果
  const [result, setResult] = useState(null);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 错误信息
  const [error, setError] = useState('');
  // 移动端判断
  const [isMobile, setIsMobile] = useState(false);

  // 检测屏幕宽度
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * 记录访问日志
   * @param {string} type - 访问类型
   * @param {string} search - 搜索内容
   */
  const logVisit = useCallback((type, search = null) => {
    try {
      fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, search }),
      }).catch(() => {});
    } catch (e) {
      // 忽略错误
    }
  }, []);

  /**
   * 处理解析请求
   * @description 调用API解析视频链接，获取无水印下载地址
   */
  const handleParse = useCallback(async () => {
    // 验证输入
    if (!url.trim()) {
      setError('请输入视频链接');
      return;
    }

    // 重置状态
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 调用后端API进行解析
      const response = await fetch(`/api/watermark?url=${encodeURIComponent(url.trim())}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        // 记录访问日志
        logVisit('视频去水印', url.trim());
      } else {
        setError(data.message || '解析失败，请检查链接是否正确');
      }
    } catch (err) {
      console.error('解析失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [url, logVisit]);

  /**
   * 处理键盘事件 - 回车提交
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loading) {
      handleParse();
    }
  }, [handleParse, loading]);

  /**
   * 清空输入和结果
   */
  const handleClear = useCallback(() => {
    setUrl('');
    setResult(null);
    setError('');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
    }}>
      {/* 顶部导航 */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
      }}>
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            transition: 'all 0.2s',
          }}
        >
          ← 返回首页
        </a>
      </div>

      {/* 主容器 */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        padding: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '36px' }}>🎬</span>
            视频去水印
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
          }}>
            支持抖音、快手、小红书、B站等平台视频无水印下载
          </p>
        </div>

        {/* 支持的平台图标 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '30px',
        }}>
          {SUPPORTED_PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#e2e8f0',
              }}
            >
              <span>{platform.icon}</span>
              <span>{platform.name}</span>
            </div>
          ))}
        </div>

        {/* 输入区域 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="粘贴视频链接，支持分享链接或完整链接..."
            style={{
              flex: 1,
              padding: '15px 20px',
              fontSize: '15px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            aria-label="视频链接输入框"
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleParse}
              disabled={loading}
              style={{
                padding: '15px 30px',
                fontSize: '15px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                background: loading
                  ? '#64748b'
                  : 'linear-gradient(135deg, #20bf6b 0%, #26de81 100%)',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              aria-label="解析视频"
            >
              {loading ? '解析中...' : '🔍 解析'}
            </button>
            {(url || result) && (
              <button
                onClick={handleClear}
                style={{
                  padding: '15px 20px',
                  fontSize: '15px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                aria-label="清空"
              >
                清空
              </button>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{
            padding: '15px 20px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#fca5a5',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* 解析结果 */}
        {result && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* 视频封面和信息 */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '20px',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              {result.cover && (
                <img
                  src={result.cover}
                  alt="视频封面"
                  style={{
                    width: isMobile ? '100%' : '200px',
                    height: 'auto',
                    borderRadius: '12px',
                    objectFit: 'cover',
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  lineHeight: '1.5',
                }}>
                  {result.title || '视频标题'}
                </h3>
                {result.author && (
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginBottom: '8px',
                  }}>
                    👤 {result.author}
                  </p>
                )}
                {result.platform && (
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                  }}>
                    📱 来源: {result.platform}
                  </p>
                )}
              </div>
            </div>

            {/* 下载按钮 */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {result.videoUrl && (
                <a
                  href={result.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #20bf6b 0%, #26de81 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  📥 下载无水印视频
                </a>
              )}
              {result.musicUrl && (
                <a
                  href={result.musicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #a55eea 0%, #8854d0 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  🎵 下载背景音乐
                </a>
              )}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
        }}>
          <h4 style={{
            color: '#e2e8f0',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
          }}>
            📖 使用说明
          </h4>
          <ol style={{
            color: '#94a3b8',
            fontSize: '13px',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0,
          }}>
            <li>打开抖音/快手/小红书等APP，找到想下载的视频</li>
            <li>点击「分享」按钮，选择「复制链接」</li>
            <li>将链接粘贴到上方输入框，点击「解析」</li>
            <li>解析成功后，点击「下载无水印视频」即可保存</li>
          </ol>
        </div>
      </div>

      {/* 底部版权 */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        color: '#64748b',
        fontSize: '12px',
      }}>
        <p>仅供学习交流使用，请勿用于商业用途</p>
      </div>
    </div>
  );
}
