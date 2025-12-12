import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const scriptTagPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const stripInlineScripts = (source) => source.replace(scriptTagPattern, '');

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

export async function GET(request) {
  try {
    // 获取请求的 origin 来构建静态文件 URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // 从静态文件服务获取 HTML
    const response = await fetch(`${baseUrl}/homepage-body.html`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch homepage');
    }
    
    const raw = await response.text();
    const cleaned = stripInlineScripts(raw);

    return new NextResponse(cleaned, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to load homepage:', error);
    return new NextResponse('Failed to load homepage', { status: 500 });
  }
}
