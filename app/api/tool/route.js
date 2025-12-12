/**
 * 统一工具服务 API
 * 
 * 支持的 action:
 * - search: 音乐搜索（仅网易云）
 * - url: 获取播放链接
 * - lyric: 获取歌词
 * - watermark: 视频去水印
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

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

/**
 * 格式化时长（毫秒转分:秒）
 */
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 带超时的 fetch 请求
 */
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
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

// ==================== 网易云音乐 ====================

/**
 * 获取播放链接 - 直接返回网易云外链
 */
async function getPlayUrl(id) {
  if (id) {
    const url = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
    return { url, source: '网易云' };
  }
  return null;
}

/**
 * 搜索网易云音乐
 */
async function searchNetease(keyword, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  
  try {
    const response = await fetchWithTimeout(
      `https://music.163.com/api/search/get/web?s=${encodeURIComponent(keyword)}&type=1&offset=${offset}&limit=${pageSize}`,
      {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          'Referer': 'https://music.163.com/',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
      10000
    );
    
    if (!response.ok) return { list: [], total: 0 };
    
    const data = await response.json();
    
    if (data.code === 200 && data.result?.songs) {
      return {
        list: data.result.songs.map((song) => ({
          id: song.id.toString(),
          type: 'netease',
          name: song.name,
          artist: song.artists?.map((a) => a.name).join(' / ') || '未知歌手',
          album: song.album?.name || '-',
          duration: formatDuration(song.duration || 0),
        })),
        total: data.result.songCount || 0,
      };
    }
    
    return { list: [], total: 0 };
  } catch (error) {
    console.error('网易云搜索失败:', error);
    return { list: [], total: 0 };
  }
}

/**
 * 获取网易云歌词
 */
async function getNeteaseLyric(id) {
  try {
    const response = await fetchWithTimeout(
      `https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      },
      8000
    );
    const data = await response.json();
    return data.lrc?.lyric || '';
  } catch (error) {
    console.error('获取歌词失败:', error);
    return '';
  }
}

// ==================== 视频去水印 ====================

function detectPlatform(url) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com') || lowerUrl.includes('tiktok.com')) return 'douyin';
  if (lowerUrl.includes('kuaishou.com') || lowerUrl.includes('gifshow.com')) return 'kuaishou';
  if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) return 'xiaohongshu';
  if (lowerUrl.includes('weibo.com') || lowerUrl.includes('weibo.cn')) return 'weibo';
  if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) return 'bilibili';
  return 'generic';
}

async function parseVideo(platform, url) {
  const apiMap = {
    douyin: 'douyin',
    kuaishou: 'kuaishou',
    xiaohongshu: 'xhs',
    weibo: 'weibo',
    bilibili: 'bilibili',
    generic: '',
  };
  
  const apiPath = apiMap[platform] ? `video/${apiMap[platform]}/` : 'video/';
  const apiUrl = `https://api.pearktrue.cn/api/${apiPath}?url=${encodeURIComponent(url)}`;
  
  try {
    const response = await fetchWithTimeout(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    }, 15000);
    
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const isVideo = !!data.data.video;
      return {
        type: isVideo ? 'video' : 'image',
        title: data.data.title || '',
        author: data.data.author || '',
        cover: data.data.cover || '',
        url: isVideo ? data.data.video : (data.data.images?.[0] || ''),
        images: data.data.images || [],
        platform: platform === 'generic' ? (data.data.platform || '未知') : platform,
      };
    }
    return null;
  } catch (error) {
    console.error(`${platform}解析失败:`, error);
    return null;
  }
}

async function handleWatermark(url) {
  if (!url) return { success: false, message: '请提供视频链接' };
  
  const urlMatch = url.match(/https?:\/\/[^\s]+/);
  const extractedUrl = urlMatch ? urlMatch[0] : url;
  
  try {
    new URL(extractedUrl);
  } catch {
    return { success: false, message: '请输入有效的视频链接' };
  }

  const platform = detectPlatform(extractedUrl);
  const result = await parseVideo(platform, extractedUrl);

  if (!result) return { success: false, message: '解析失败，请检查链接是否正确' };

  return { success: true, data: result };
}

async function proxyVideo(videoUrl) {
  try {
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.douyin.com/',
      },
    });
    
    if (!response.ok) return null;
    return response;
  } catch (error) {
    console.error('视频代理失败:', error);
    return null;
  }
}

// ==================== 主路由 ====================

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    
    switch (action) {
      // 视频代理下载
      case 'proxy': {
        const videoUrl = searchParams.get('url') || '';
        if (!videoUrl) {
          return NextResponse.json({ success: false, message: '请提供视频链接' }, { headers: corsHeaders });
        }
        
        const videoResponse = await proxyVideo(videoUrl);
        if (!videoResponse) {
          return NextResponse.json({ success: false, message: '视频获取失败' }, { headers: corsHeaders });
        }
        
        const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
        return new Response(videoResponse.body, {
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Content-Disposition': 'attachment; filename="video.mp4"',
          },
        });
      }
      
      // 获取播放链接
      case 'url': {
        const id = searchParams.get('id') || '';
        
        if (!id) {
          return NextResponse.json({ success: false, message: '请提供音乐ID' }, { headers: corsHeaders });
        }
        
        const result = await getPlayUrl(id);
        
        if (!result) {
          return NextResponse.json({ success: false, message: '该歌曲暂无播放链接' }, { headers: corsHeaders });
        }
        
        return NextResponse.json({ 
          success: true, 
          url: result.url, 
          source: result.source,
          id 
        }, { headers: corsHeaders });
      }
      
      // 获取歌词
      case 'lyric': {
        const id = searchParams.get('id') || '';
        if (!id) {
          return NextResponse.json({ success: false, message: '请提供音乐ID' }, { headers: corsHeaders });
        }
        const lyric = await getNeteaseLyric(id);
        return NextResponse.json({ success: true, lyric }, { headers: corsHeaders });
      }
      
      // 视频去水印
      case 'watermark': {
        const videoUrl = searchParams.get('url') || '';
        const result = await handleWatermark(videoUrl);
        return NextResponse.json(result, { headers: corsHeaders });
      }
      
      // 搜索音乐（仅网易云）
      case 'search':
      default: {
        const name = searchParams.get('name') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

        if (!name) {
          return NextResponse.json({ success: false, message: '请输入搜索关键词' }, { headers: corsHeaders });
        }

        console.log(`[搜索] 关键词: ${name}, 页码: ${page}`);
        const result = await searchNetease(name, page, pageSize);

        return NextResponse.json({
          success: true,
          data: result.list,
          total: result.total,
          page,
          pageSize,
          totalPages: Math.ceil(result.total / pageSize),
          source: 'netease',
        }, { headers: corsHeaders });
      }
    }
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json({ success: false, message: '请求失败，请稍后重试' }, { headers: corsHeaders });
  }
}
