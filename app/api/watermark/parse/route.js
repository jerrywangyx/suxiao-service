import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// OPTIONS 请求处理
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// 解析抖音/TikTok视频
async function parseDouyin(url) {
  try {
    // 使用第三方API解析
    const apiUrl = `https://api.pearktrue.cn/api/video/douyin/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      // 小红书可能是图片或视频
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
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

// 解析B站视频
async function parseBilibili(url) {
  try {
    const apiUrl = `https://api.pearktrue.cn/api/video/bilibili/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
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

// 通用解析（尝试多个API）
async function parseGeneric(url) {
  try {
    // 尝试通用解析API
    const apiUrl = `https://api.pearktrue.cn/api/video/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
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

// 检测平台类型
function detectPlatform(url) {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com') || lowerUrl.includes('tiktok.com')) {
    return 'douyin';
  }
  if (lowerUrl.includes('kuaishou.com') || lowerUrl.includes('gifshow.com')) {
    return 'kuaishou';
  }
  if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) {
    return 'xiaohongshu';
  }
  if (lowerUrl.includes('weibo.com') || lowerUrl.includes('weibo.cn')) {
    return 'weibo';
  }
  if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) {
    return 'bilibili';
  }
  
  return 'generic';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') || '';

    if (!url) {
      return NextResponse.json({
        success: false,
        message: '请提供视频链接',
      });
    }

    // 检查是否是有效的 URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({
        success: false,
        message: '请输入有效的视频链接（需要包含 http:// 或 https://）',
      });
    }

    // 检测平台并解析
    const platform = detectPlatform(url);
    let result = null;

    switch (platform) {
      case 'douyin':
        result = await parseDouyin(url);
        break;
      case 'kuaishou':
        result = await parseKuaishou(url);
        break;
      case 'xiaohongshu':
        result = await parseXiaohongshu(url);
        break;
      case 'weibo':
        result = await parseWeibo(url);
        break;
      case 'bilibili':
        result = await parseBilibili(url);
        break;
      default:
        result = await parseGeneric(url);
    }

    if (!result) {
      return NextResponse.json({
        success: false,
        message: '解析失败，请检查链接是否正确或稍后重试',
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('视频解析错误:', error);
    return NextResponse.json({
      success: false,
      message: '解析服务异常，请稍后重试',
    });
  }
}

