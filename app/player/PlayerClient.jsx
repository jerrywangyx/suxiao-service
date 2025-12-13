'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const parserOptions = [
  { label: '蓝光优选', value: '//z1.m1907.top/?jx=' },
  { label: 'JSON 线路', value: '//jx.jsonplayer.com/player/?url=' },
  { label: '简洁线路', value: '//jx.playerjy.com/?ads=0&url=' },
  { label: '备用稳定线', value: '//z1.m1907.top/?jx=' },
  { label: '稳定线路', value: '//z1.m1907.cn/?jx=' },
  { label: '云急线', value: '//llq.tyhua.top/?url=' },
  { label: '大咖线路 1', value: '//www.daga.cc/vip2/?url=' },
  { label: '大咖线路 2', value: '//www.daga.cc/vip3/?url=' },
  { label: '通用 Web 播放', value: '//player.mrgaocloud.com/player/?url=' },
];

const tips = [
  '复制任意主流平台的视频播放页 URL，粘贴后点击“播”即可尝试解析。',
  '多个线路可随时切换，若遇到广告或播放失败请换线重试。',
  '从首页选择“影视”搜索时会自动携带内容至此，直接点击“播”即可解析。',
  '推荐在桌面端浏览器使用，移动端请保持网络稳定以避免卡顿。',
];

async function logPlayRequest(query) {
  const response = await fetch('/api/music/search?action=log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    throw new Error('日志接口响应异常');
  }
}

/**
 * 记录访问日志
 * @param {string} visitType - 访问类型
 * @param {string} searchContent - 搜索内容
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

export default function PlayerClient() {
  const [selectedParser, setSelectedParser] = useState(parserOptions[0].value);
  const [videoAddress, setVideoAddress] = useState('');
  const [iframeSrc, setIframeSrc] = useState('');
  const [hasAutoParsed, setHasAutoParsed] = useState(false);

  const hasVideo = useMemo(() => Boolean(iframeSrc), [iframeSrc]);

  const performParse = useCallback(
    async (target) => {
      setIframeSrc(`${selectedParser}${target}`);
      // 记录电影搜索访问日志（独立执行，不受其他日志影响）
      logVisit('电影搜索', target);
      // 记录播放请求日志
      try {
        await logPlayRequest(target);
      } catch (error) {
        console.error('写入播放日志失败', error);
      }
    },
    [selectedParser],
  );

  const handleParse = async (event) => {
    event.preventDefault();
    const trimmed = videoAddress.trim();
    if (!trimmed) {
      window.alert('请输入需要解析的视频地址');
      return;
    }

    await performParse(trimmed);
  };

  useEffect(() => {
    if (hasAutoParsed || typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let incoming = (params.get('url') ?? '').trim();

    if (!incoming) {
      try {
        const stored = sessionStorage.getItem('playerSearchKeyword');
        if (stored) {
          incoming = stored.trim();
          sessionStorage.removeItem('playerSearchKeyword');
        }
      } catch (error) {
        console.warn('无法读取会话存储', error);
      }
    }

    if (!incoming) {
      return;
    }

    setVideoAddress(incoming);
    setHasAutoParsed(true);
    void performParse(incoming);
  }, [hasAutoParsed, performParse]);

  return (
    <div className="player-page">
      <div className="app-container">
        <header className="aim-topbar">
          <div className="aim-header">
            <div className="aim-title">
              <a href="/" rel="home">
                速效盒子 VIP 解析
              </a>
            </div>
          </div>
        </header>

        <main className="container main-body">
          <section className="panel panel-default parser-panel parser-panel--top">
            <div className="panel-body">
              <form className="parser-form" onSubmit={handleParse}>
                <div className="parser-inline-group">
                  <div className="parser-field parser-field--channel">
                    <label htmlFor="jk">频道</label>
                    <select
                      id="jk"
                      className="form-select"
                      value={selectedParser}
                      onChange={(event) => setSelectedParser(event.target.value)}
                    >
                      {parserOptions.map((option) => (
                        <option key={`${option.value}-${option.label}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="parser-field parser-field--stretch">
                    <label htmlFor="url">视频地址</label>
                    <input
                      id="url"
                      className="form-control"
                      type="search"
                      placeholder="请输入视频地址或关键词"
                      value={videoAddress}
                      onChange={(event) => setVideoAddress(event.target.value)}
                    />
                  </div>
                  <div className="parser-action">
                    <button id="bf" type="submit" className="btn btn-success btn-lg">
                      播
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>

          <section className="panel panel-default mt-4">
            <div className="panel-body player-shell">
              {hasVideo ? (
                <iframe
                  key={iframeSrc}
                  src={iframeSrc}
                  title="解析结果播放"
                  allow="fullscreen"
                  allowFullScreen
                  scrolling="no"
                />
              ) : (
                <div className="player-placeholder">
                  <div className="player-placeholder-content">
                    <h3>请选择线路并输入视频地址</h3>
                    <p>支持腾讯、爱奇艺、优酷等平台的公开播放页链接。</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="tips">
            <div className="panel-body">
              <div className="alert alert-success" role="alert">
                <p className="text-center mb-2">播放提醒</p>
                <ol>
                  {tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer-links" style={{ background: '#1d1b1b' }}>
          <p className="statement">本站仅做 Web 播放调试，请勿用于任何商业用途。</p>
          <span>© 2025 速效盒子 VIP 播放解析</span>
        </footer>
      </div>
    </div>
  );
}
