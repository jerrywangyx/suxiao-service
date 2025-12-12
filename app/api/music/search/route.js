import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ========== 网易云音乐 ==========
async function searchNetease(keyword, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const errors = [];
  
  // API 1: 使用第三方代理 API (解决海外IP限制)
  try {
    const response = await fetch(
      `https://netease-cloud-music-api-five-roan-88.vercel.app/cloudsearch?keywords=${encodeURIComponent(keyword)}&limit=${pageSize}&offset=${offset}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );
    const data = await response.json();
    if (data.code === 200 && data.result?.songs) {
      return {
        list: data.result.songs.map((song) => ({
          id: song.id.toString(),
          type: 'netease',
          name: song.name,
          artist: song.ar?.map((a) => a.name).join(' / ') || '未知歌手',
          album: song.al?.name || '-',
          duration: formatDuration(song.dt || 0),
        })),
        total: data.result.songCount || 0,
      };
    }
    errors.push('proxy api: code=' + data.code);
  } catch (error) {
    errors.push('proxy api: ' + error.message);
  }

  // API 2: 直接访问网易云 cloudsearch
  try {
    const response = await fetch(
      `https://music.163.com/api/cloudsearch/pc?s=${encodeURIComponent(keyword)}&type=1&offset=${offset}&limit=${pageSize}`,
      {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const data = await response.json();
    if (data.code === 200 && data.result?.songs) {
      return {
        list: data.result.songs.map((song) => ({
          id: song.id.toString(),
          type: 'netease',
          name: song.name,
          artist: song.ar?.map((a) => a.name).join(' / ') || '未知歌手',
          album: song.al?.name || '-',
          duration: formatDuration(song.dt || 0),
        })),
        total: data.result.songCount || 0,
      };
    }
    errors.push('cloudsearch: code=' + data.code);
  } catch (error) {
    errors.push('cloudsearch: ' + error.message);
  }

  // API 3: 旧版搜索
  try {
    const response = await fetch(
      `https://music.163.com/api/search/get/web?s=${encodeURIComponent(keyword)}&type=1&offset=${offset}&limit=${pageSize}`,
      {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          'Referer': 'https://music.163.com/',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
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
    errors.push('web search: code=' + data.code);
  } catch (error) {
    errors.push('web search: ' + error.message);
  }

  console.error('网易云搜索失败:', errors.join('; '));
  return { list: [], total: 0 };
}

async function getNeteaseUrl(id) {
  try {
    const response = await fetch(
      `https://music.163.com/api/song/enhance/player/url?ids=[${id}]&br=320000`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    );
    const data = await response.json();
    if (data.code === 200 && data.data?.[0]?.url) {
      return data.data[0].url;
    }
    
    // 备用接口
    const response2 = await fetch(
      `https://music.163.com/api/song/enhance/player/url/v1?ids=[${id}]&level=standard&encodeType=mp3`,
      {
        headers: {
          'User-Agent': 'NeteaseMusic/8.0.0 (iPhone; iOS 14.0; Scale/3.00)',
          'Referer': 'https://music.163.com/',
        },
      }
    );
    const data2 = await response2.json();
    if (data2.code === 200 && data2.data?.[0]?.url) {
      return data2.data[0].url;
    }
    
    return null;
  } catch (error) {
    console.error('获取网易云链接失败:', error);
    return null;
  }
}

async function getNeteaseLyric(id) {
  try {
    const response = await fetch(
      `https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    );
    const data = await response.json();
    return data.lrc?.lyric || '';
  } catch (error) {
    console.error('获取歌词失败:', error);
    return '';
  }
}

// ========== 视频去水印 ==========
// 解析抖音/TikTok视频
async function parseDouyin(url) {
  try {
    const apiUrl = `https://api.pearktrue.cn/api/video/douyin/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return {
        type: 'video',
        title: data.data.title || '',
        author: data.data.author || '',
        cover: data.data.cover || '',
        url: data.data.video || data.data.url || '',
        platform: '抖音',
      };
    }
    return null;
  } catch (error) {
    console.error('抖音解析失败:', error);
    return null;
  }
}

// 解析快手视频
async function parseKuaishou(url) {
  try {
    const apiUrl = `https://api.pearktrue.cn/api/video/kuaishou/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return {
        type: 'video',
        title: data.data.title || '',
        author: data.data.author || '',
        cover: data.data.cover || '',
        url: data.data.video || data.data.url || '',
        platform: '快手',
      };
    }
    return null;
  } catch (error) {
    console.error('快手解析失败:', error);
    return null;
  }
}

// 解析小红书
async function parseXiaohongshu(url) {
  try {
    const apiUrl = `https://api.pearktrue.cn/api/video/xhs/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
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
        platform: '小红书',
      };
    }
    return null;
  } catch (error) {
    console.error('小红书解析失败:', error);
    return null;
  }
}

// 解析微博视频
async function parseWeibo(url) {
  try {
    const apiUrl = `https://api.pearktrue.cn/api/video/weibo/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return {
        type: 'video',
        title: data.data.title || '',
        author: data.data.author || '',
        cover: data.data.cover || '',
        url: data.data.video || data.data.url || '',
        platform: '微博',
      };
    }
    return null;
  } catch (error) {
    console.error('微博解析失败:', error);
    return null;
  }
}

// 解析B站视频（去水印）
async function parseWatermarkBilibili(url) {
  try {
    const apiUrl = `https://api.pearktrue.cn/api/video/bilibili/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return {
        type: 'video',
        title: data.data.title || '',
        author: data.data.author || '',
        cover: data.data.cover || '',
        url: data.data.video || data.data.url || '',
        platform: 'B站',
      };
    }
    return null;
  } catch (error) {
    console.error('B站解析失败:', error);
    return null;
  }
}

// 通用视频解析
async function parseGeneric(url) {
  try {
    const apiUrl = `https://api.pearktrue.cn/api/video/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return {
        type: data.data.type || 'video',
        title: data.data.title || '',
        author: data.data.author || '',
        cover: data.data.cover || '',
        url: data.data.video || data.data.url || '',
        images: data.data.images || [],
        platform: data.data.platform || '未知',
      };
    }
    return null;
  } catch (error) {
    console.error('通用解析失败:', error);
    return null;
  }
}

// 检测视频平台类型
function detectPlatform(url) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com') || lowerUrl.includes('tiktok.com')) return 'douyin';
  if (lowerUrl.includes('kuaishou.com') || lowerUrl.includes('gifshow.com')) return 'kuaishou';
  if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) return 'xiaohongshu';
  if (lowerUrl.includes('weibo.com') || lowerUrl.includes('weibo.cn')) return 'weibo';
  if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) return 'bilibili';
  return 'generic';
}

// 视频去水印处理函数
async function handleWatermark(url) {
  if (!url) {
    return { success: false, message: '请提供视频链接' };
  }
  
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
  let result = null;

  switch (platform) {
    case 'douyin':
      result = await parseDouyin(extractedUrl);
      break;
    case 'kuaishou':
      result = await parseKuaishou(extractedUrl);
      break;
    case 'xiaohongshu':
      result = await parseXiaohongshu(extractedUrl);
      break;
    case 'weibo':
      result = await parseWeibo(extractedUrl);
      break;
    case 'bilibili':
      result = await parseWatermarkBilibili(extractedUrl);
      break;
    default:
      result = await parseGeneric(extractedUrl);
  }

  if (!result) {
    return { success: false, message: '解析失败，请检查链接是否正确或稍后重试' };
  }

  return { success: true, data: result };
}

// ========== Bilibili ==========
async function searchBilibili(keyword, page = 1, pageSize = 20) {
  const errors = [];
  
  // API 1: 使用代理服务绕过地区限制
  try {
    const response = await fetch(
      `https://api.bilibili.com/x/web-interface/wbi/search/type?search_type=video&keyword=${encodeURIComponent(keyword)}&page=${page}&page_size=${pageSize}&tids=3`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://search.bilibili.com/',
          'Origin': 'https://search.bilibili.com',
        },
      }
    );
    
    const text = await response.text();
    if (!text.startsWith('<!DOCTYPE') && !text.startsWith('<html')) {
      const data = JSON.parse(text);
      if (data.code === 0 && data.data?.result) {
        return {
          list: data.data.result.map((video) => ({
            id: video.bvid || video.aid?.toString(),
            type: 'bilibili',
            name: video.title?.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, '') || '未知',
            artist: video.author || '未知UP主',
            album: '-',
            duration: video.duration || '-',
            aid: video.aid,
            bvid: video.bvid,
          })),
          total: data.data.numResults || data.data.result.length,
        };
      }
      errors.push('wbi api: code=' + data.code);
    } else {
      errors.push('wbi api: returned HTML');
    }
  } catch (error) {
    errors.push('wbi api: ' + error.message);
  }

  // API 2: 使用旧版搜索接口
  try {
    const response = await fetch(
      `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(keyword)}&page=${page}&page_size=${pageSize}&tids=3&order=totalrank`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com/',
          'Origin': 'https://www.bilibili.com',
          'Cookie': 'buvid3=' + Date.now() + Math.random().toString(36).substring(2),
        },
      }
    );
    
    const text = await response.text();
    if (!text.startsWith('<!DOCTYPE') && !text.startsWith('<html')) {
      const data = JSON.parse(text);
      if (data.code === 0 && data.data?.result) {
        return {
          list: data.data.result.map((video) => ({
            id: video.bvid || video.aid?.toString(),
            type: 'bilibili',
            name: video.title?.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, '') || '未知',
            artist: video.author || '未知UP主',
            album: '-',
            duration: video.duration || '-',
            aid: video.aid,
            bvid: video.bvid,
          })),
          total: data.data.numResults || data.data.result.length,
        };
      }
      errors.push('old api: code=' + data.code);
    } else {
      errors.push('old api: returned HTML');
    }
  } catch (error) {
    errors.push('old api: ' + error.message);
  }

  // API 3: 使用 suggest 接口获取热门搜索结果
  try {
    const response = await fetch(
      `https://s.search.bilibili.com/main/suggest?term=${encodeURIComponent(keyword)}&main_ver=v1&highlight=`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/',
        },
      }
    );
    const data = await response.json();
    if (data.code === 0 && data.result?.tag) {
      // suggest 只返回建议，不返回视频列表，跳过
      errors.push('suggest api: only suggestions');
    }
  } catch (error) {
    errors.push('suggest api: ' + error.message);
  }

  console.error('B站搜索失败:', errors.join('; '));
  return { list: [], total: 0 };
}

async function getBilibiliUrl(bvid, aid, cid) {
  try {
    if (!cid && bvid) {
      const infoRes = await fetch(
        `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.bilibili.com/',
          },
        }
      );
      const infoData = await infoRes.json();
      if (infoData.code === 0 && infoData.data?.cid) {
        cid = infoData.data.cid;
        aid = infoData.data.aid;
      }
    }
    
    if (!cid) return null;
    
    const response = await fetch(
      `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=64&fnval=16`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/',
        },
      }
    );
    const data = await response.json();
    
    if (data.code === 0 && data.data?.dash?.audio?.[0]?.baseUrl) {
      return data.data.dash.audio[0].baseUrl;
    }
    if (data.code === 0 && data.data?.durl?.[0]?.url) {
      return data.data.durl[0].url;
    }
    return null;
  } catch (error) {
    console.error('获取B站链接失败:', error);
    return null;
  }
}

// ========== 主路由 ==========
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    
    switch (action) {
      case 'url': {
        const id = searchParams.get('id') || '';
        const songType = searchParams.get('songType') || searchParams.get('type') || 'netease';
        const bvid = searchParams.get('bvid') || id;
        const aid = searchParams.get('aid') || '';
        const cid = searchParams.get('cid') || '';
        
        if (!id) {
          return NextResponse.json({ success: false, message: '请提供音乐ID' }, { headers: corsHeaders });
        }
        
        let url = null;
        switch (songType) {
          case 'netease':
            url = await getNeteaseUrl(id);
            break;
          case 'bilibili':
            url = await getBilibiliUrl(bvid, aid, cid);
            break;
          default:
            url = await getNeteaseUrl(id);
        }
        
        if (!url) {
          return NextResponse.json({ success: false, message: '该歌曲暂无播放链接' }, { headers: corsHeaders });
        }
        
        return NextResponse.json({ success: true, url, id }, { headers: corsHeaders });
      }
      
      case 'lyric': {
        const id = searchParams.get('id') || '';
        if (!id) {
          return NextResponse.json({ success: false, message: '请提供音乐ID' }, { headers: corsHeaders });
        }
        const lyric = await getNeteaseLyric(id);
        return NextResponse.json({ success: true, lyric }, { headers: corsHeaders });
      }
      
      case 'watermark': {
        const videoUrl = searchParams.get('url') || '';
        const result = await handleWatermark(videoUrl);
        return NextResponse.json(result, { headers: corsHeaders });
      }
      
      case 'search':
      default: {
        const name = searchParams.get('name') || '';
        const source = searchParams.get('source') || 'netease';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

        if (!name) {
          return NextResponse.json({ success: false, message: '请输入歌曲名称' }, { headers: corsHeaders });
        }

        let result = { list: [], total: 0 };
        switch (source) {
          case 'netease':
            result = await searchNetease(name, page, pageSize);
            break;
          case 'bilibili':
            result = await searchBilibili(name, page, pageSize);
            break;
          default:
            result = await searchNetease(name, page, pageSize);
        }

        return NextResponse.json({
          success: true,
          data: result.list,
          total: result.total,
          page,
          pageSize,
          totalPages: Math.ceil(result.total / pageSize),
        }, { headers: corsHeaders });
      }
    }
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json({ success: false, message: '请求失败，请稍后重试' }, { headers: corsHeaders });
  }
}
