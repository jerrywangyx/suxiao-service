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

const CATEGORY_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const categoryCache = new Map();
const upstreamApi = 'https://tools.liumingye.cn/api';

function getCachedCategory(mid) {
  const entry = categoryCache.get(mid);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.timestamp > CATEGORY_CACHE_TTL_MS) {
    categoryCache.delete(mid);
    return null;
  }
  return entry.data;
}

function cacheCategory(mid, payload) {
  categoryCache.set(mid, { timestamp: Date.now(), data: payload });
}

async function fetchCategoryFromUpstream(mid) {
  const url = `${upstreamApi}?event=category&mid=${encodeURIComponent(mid)}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`upstream request failed with status ${response.status}`);
  }
  const payload = await response.json();
  if (payload.status !== 'success' || !Array.isArray(payload.data)) {
    throw new Error('unexpected upstream payload');
  }
  return payload.data;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const event = searchParams.get('event');

  if (event !== 'category') {
    return NextResponse.json(
      { status: 'error', message: 'unsupported event' },
      { status: 400 },
    );
  }

  const mid = (searchParams.get('mid') ?? '').trim();
  if (!mid) {
    return NextResponse.json(
      { status: 'error', message: 'missing mid parameter' },
      { status: 400 },
    );
  }

  try {
    const cached = getCachedCategory(mid);
    if (cached) {
      return NextResponse.json({ status: 'success', data: cached });
    }

    const data = await fetchCategoryFromUpstream(mid);
    cacheCategory(mid, data);
    return NextResponse.json({ status: 'success', data });
  } catch (error) {
    console.error('category fetch failed', error);
    return NextResponse.json(
      { status: 'error', message: '无法获取分类数据' },
      { status: 502 },
    );
  }
}

async function parseEventPayload(request) {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  const raw = await request.text();
  try {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  } catch {
    return {};
  }
}

export async function POST(request) {
  const payload = await parseEventPayload(request);
  const event = (payload.event ?? '').trim();

  if (event === 'views' || event === 'agree') {
    return NextResponse.json({ status: 'success' });
  }

  return NextResponse.json(
    { status: 'error', message: 'unsupported event' },
    { status: 400 },
  );
}
