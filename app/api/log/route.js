import { NextResponse } from 'next/server';
import { insertPlayRequest } from '../../../lib/db.js';
import { getRequestContext } from '@cloudflare/next-on-pages';

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

function extractQuery(requestBody) {
  if (!requestBody || typeof requestBody.query !== 'string') {
    return '';
  }
  return requestBody.query.trim().slice(0, 2048);
}

export async function POST(request) {
  let requestBody = {};
  try {
    requestBody = await request.json();
  } catch {
    requestBody = {};
  }

  const queryText = extractQuery(requestBody);
  const ipAddress = normalizeIp(getClientIp(request));

  try {
    // 只在 Cloudflare 环境中使用 getRequestContext
    // 本地开发环境会跳过数据库操作
    try {
      const { env } = getRequestContext();
      globalThis.DB = env.DB;
    } catch (contextError) {
      // 本地开发环境，跳过数据库操作
      console.log('本地开发环境，跳过播放日志记录');
      return NextResponse.json({ success: true, dev: true });
    }

    await insertPlayRequest({ ipAddress, queryText });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('failed to insert play request log', error);
    return NextResponse.json(
      { success: false, message: '写入播放日志失败', error: error.message },
      { status: 500 }
    );
  }
}
