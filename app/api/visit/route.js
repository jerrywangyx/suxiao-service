import { NextResponse } from 'next/server';
import { logVisit, VISIT_TYPES } from '../../../lib/db.js';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS 请求处理
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

const forwardedHeaderKeys = ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'];

function getClientIp(request) {
  for (const key of forwardedHeaderKeys) {
    const headerValue = request.headers.get(key);
    if (headerValue) {
      return headerValue.split(',')[0].trim();
    }
  }
  return request.ip ?? '';
}

function normalizeIp(ipAddress) {
  if (!ipAddress) {
    return '0.0.0.0';
  }
  if (ipAddress === '::1') {
    return '127.0.0.1';
  }
  if (ipAddress.startsWith('::ffff:')) {
    return ipAddress.substring(7);
  }
  return ipAddress;
}

/**
 * 记录访问日志
 * 
 * POST 请求体:
 * - type: 访问类型（首页、图片压缩、白板画图、程序员工具、VIP视频、VIP音乐、视频去水印）
 * - search: 搜索内容（可选，仅 VIP视频、VIP音乐、视频去水印 需要）
 */
export async function POST(request) {
  const ipAddress = normalizeIp(getClientIp(request));

  // 解析请求体
  let visitType = VISIT_TYPES.HOME;
  let searchContent = null;
  
  try {
    const body = await request.json();
    visitType = body.type || VISIT_TYPES.HOME;
    searchContent = body.search || null;
  } catch {
    // 请求体为空或解析失败，使用默认值
  }

  try {
    // 只在 Cloudflare 环境中使用 getRequestContext
    try {
      const { env } = getRequestContext();
      globalThis.DB = env.DB;
    } catch (contextError) {
      // 本地开发环境，跳过数据库操作
      console.log('本地开发环境，跳过访问日志记录');
      return NextResponse.json({ success: true, dev: true }, { headers: corsHeaders });
    }

    await logVisit(ipAddress, visitType, searchContent);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('failed to log visit', error);
    return NextResponse.json(
      { success: false, message: '写入访问日志失败', error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
