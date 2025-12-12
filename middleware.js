import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { logVisit, VISIT_TYPES } from './lib/db.js';

export const config = {
  matcher: '/',
};

export const runtime = 'experimental-edge';

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

export async function middleware(request) {
  try {
    const requestContext = getRequestContext();
    if (requestContext?.env?.DB) {
      globalThis.DB = requestContext.env.DB;
    }

    const ipAddress = normalizeIp(getClientIp(request));
    
    // 记录首页访问
    if (requestContext?.ctx?.waitUntil) {
      requestContext.ctx.waitUntil(logVisit(ipAddress, VISIT_TYPES.HOME));
    } else {
      logVisit(ipAddress, VISIT_TYPES.HOME).catch(err => console.error('Log visit failed:', err));
    }

  } catch (error) {
    // 忽略错误，不影响用户访问
  }

  return NextResponse.next();
}
