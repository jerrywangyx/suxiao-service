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

// 获取网易云音乐歌词
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

    if (data.code === 200) {
      return {
        lyric: data.lrc?.lyric || '',
        tlyric: data.tlyric?.lyric || '', // 翻译歌词
      };
    }

    return null;
  } catch (error) {
    console.error('获取网易云歌词失败:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const type = searchParams.get('type') || 'netease';

    if (!id) {
      return NextResponse.json({
        success: false,
        message: '请提供歌曲ID',
      });
    }

    let result = null;

    switch (type) {
      case 'netease':
        result = await getNeteaseLyric(id);
        break;
      default:
        result = await getNeteaseLyric(id);
    }

    if (!result) {
      return NextResponse.json({
        success: false,
        message: '暂无歌词',
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取歌词失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取歌词失败',
    });
  }
}

