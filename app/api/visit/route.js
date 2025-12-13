import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { logVisit, VISIT_TYPES } from '../../../lib/db';

export const runtime = 'edge';

/**
 * 获取客户端 IP 地址
 * @param {Request} request - 请求对象
 * @returns {string} IP 地址
 */
function getClientIp(request) {
  // Cloudflare 会在请求头中添加真实 IP
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // 其他代理服务器
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  return '0.0.0.0';
}

/**
 * POST /api/visit - 记录访问日志
 */
export async function POST(request) {
  try {
    // 绑定 D1 数据库
    const requestContext = getRequestContext();
    if (requestContext?.env?.DB) {
      globalThis.DB = requestContext.env.DB;
    }

    const ipAddress = getClientIp(request);
    
    // 尝试解析请求体
    let visitType = VISIT_TYPES.HOME;
    let searchContent = null;
    
    try {
      const body = await request.json();
      // 兼容 type 和 visitType 两种参数名
      visitType = body.visitType || body.type || VISIT_TYPES.HOME;
      // 兼容 searchContent 和 search 两种参数名
      searchContent = body.searchContent || body.search || null;
    } catch {
      // 请求体为空或解析失败，使用默认值
    }

    // 记录访问日志
    await logVisit(ipAddress, visitType, searchContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录访问日志失败:', error);
    return NextResponse.json({ success: false, message: '记录失败' }, { status: 500 });
  }
}

/**
 * OPTIONS - CORS 预检请求
 */
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

