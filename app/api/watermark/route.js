/**
 * 视频去水印API路由
 * @description 支持抖音、快手、小红书、B站等平台视频解析
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 解析API列表（按优先级排序）
 */
const PARSE_APIS = [
  {
    name: '星之阁API',
    parse: async (url) => {
      const res = await fetch(`https://api.xingzhige.com/API/Vide_qusy/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.code === 0 && data.data) {
        return {
          title: data.data.title || '',
          author: data.data.author || '',
          cover: data.data.cover || '',
          videoUrl: data.data.url || '',
          musicUrl: data.data.music || '',
          platform: data.data.platform || '',
        };
      }
      return null;
    }
  },
  {
    name: '韩小韩API',
    parse: async (url) => {
      const res = await fetch(`https://api.vvhan.com/api/video?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.success && data.info) {
        return {
          title: data.info.title || '',
          author: data.info.author || '',
          cover: data.info.cover || '',
          videoUrl: data.info.videoUrl || '',
          musicUrl: data.info.musicUrl || '',
          platform: data.info.platform || '',
        };
      }
      return null;
    }
  },
  {
    name: '夏柔API',
    parse: async (url) => {
      const res = await fetch(`https://api.aa1.cn/api/jx-sp/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.code === 1 && data.data) {
        return {
          title: data.data.title || '',
          author: data.data.author || '',
          cover: data.data.cover || '',
          videoUrl: data.data.video_url || '',
          musicUrl: data.data.music_url || '',
          platform: '',
        };
      }
      return null;
    }
  },
  {
    name: '聚合API',
    parse: async (url) => {
      const res = await fetch(`https://api.lolimi.cn/API/sp_jx/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.code === 200 && data.data) {
        return {
          title: data.data.title || '',
          author: data.data.author || '',
          cover: data.data.cover || '',
          videoUrl: data.data.video || '',
          musicUrl: data.data.music || '',
          platform: data.data.from || '',
        };
      }
      return null;
    }
  },
  {
    name: 'TikHub API',
    parse: async (url) => {
      const res = await fetch(`https://api.tikhub.io/api/v1/douyin/video_data?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.code === 0 && data.data) {
        return {
          title: data.data.desc || '',
          author: data.data.author?.nickname || '',
          cover: data.data.cover || '',
          videoUrl: data.data.play || '',
          musicUrl: data.data.music?.play_url || '',
          platform: '抖音',
        };
      }
      return null;
    }
  },
];

/**
 * GET 请求处理
 * @param {Request} request - 请求对象
 * @returns {NextResponse} 响应对象
 */
export async function GET(request) {
  // 获取URL参数
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  // 验证参数
  if (!videoUrl) {
    return NextResponse.json({
      success: false,
      message: '请提供视频链接',
    }, { status: 400 });
  }

  console.log('[Watermark] 解析请求:', videoUrl);

  // 依次尝试各个API
  for (const api of PARSE_APIS) {
    try {
      console.log(`[Watermark] 尝试 ${api.name}...`);
      const result = await api.parse(videoUrl);
      
      if (result && result.videoUrl) {
        console.log(`[Watermark] ${api.name} 解析成功`);
        return NextResponse.json({
          success: true,
          data: result,
          source: api.name,
        });
      }
    } catch (error) {
      console.warn(`[Watermark] ${api.name} 失败:`, error.message);
    }
  }

  // 所有API都失败
  return NextResponse.json({
    success: false,
    message: '解析失败，请检查链接是否正确或稍后重试',
  }, { status: 500 });
}

