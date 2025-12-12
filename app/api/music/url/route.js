/**
 * 音乐播放链接 API
 * 使用洛雪音源 API 获取播放链接（支持 VIP 歌曲）
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 洛雪音源 API 配置
const LX_MUSIC_API = {
  baseUrl: 'https://lxmusicapi.onrender.com',
  apiKey: 'share-v2',
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

/**
 * 带超时的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 通过洛雪音源 API 获取播放链接
 * @param {string} source - 音源类型 (wy/kw/kg/tx/mg)
 * @param {string} songId - 歌曲 ID
 * @param {string} quality - 音质 (128k/320k)
 * @returns {Promise<string|null>} - 播放链接或 null
 */
async function getLxMusicUrl(source, songId, quality = '320k') {
  const apiUrl = `${LX_MUSIC_API.baseUrl}/url/${source}/${songId}/${quality}`;
  
  try {
    const response = await fetchWithTimeout(apiUrl, {
      method: 'GET',
          headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'lx-music-request/2.0.0',
        'X-Request-Key': LX_MUSIC_API.apiKey,
          },
    }, 15000);
    
    if (!response.ok) {
      console.error(`[LxMusic] HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // 解析响应
    if (data.code === 0 && data.url) {
      console.log(`[LxMusic] 成功获取 ${source} 歌曲链接`);
      return data.url;
    }
    
    // 错误处理
    const errorMessages = {
      1: 'IP被封禁',
      2: '获取链接失败',
      4: '服务器内部错误',
      5: '请求过于频繁',
      6: '参数错误',
    };
    console.error(`[LxMusic] 错误: ${errorMessages[data.code] || data.msg || '未知错误'}`);
    return null;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[LxMusic] 请求超时');
    } else {
      console.error('[LxMusic] 请求失败:', error.message);
    }
    return null;
  }
}

/**
 * 获取网易云音乐播放链接
 * @param {string} id - 歌曲 ID
 * @returns {Promise<string|null>} - 播放链接或 null
 */
async function getNeteaseUrl(id) {
  // 优先尝试 320k，失败则尝试 128k
  const qualities = ['320k', '128k'];
  
  for (const quality of qualities) {
    const url = await getLxMusicUrl('wy', id, quality);
    if (url) return url;
  }
  
  return null;
}

/**
 * GET 请求处理
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const songType = searchParams.get('songType') || searchParams.get('type') || 'netease';

    if (!id) {
      return NextResponse.json({ success: false, message: '请提供音乐ID' }, { headers: corsHeaders });
    }

    let url = null;
    
    // 根据类型获取播放链接
    switch (songType) {
      case 'netease':
      case 'wy':
        url = await getNeteaseUrl(id);
        break;
      default:
        url = await getNeteaseUrl(id);
    }

    if (!url) {
      return NextResponse.json({ success: false, message: '该歌曲暂无播放链接' }, { headers: corsHeaders });
    }

    return NextResponse.json({ success: true, url, id }, { headers: corsHeaders });
  } catch (error) {
    console.error('获取音乐链接失败:', error);
    return NextResponse.json({ success: false, message: '获取播放链接失败' }, { headers: corsHeaders });
  }
}
