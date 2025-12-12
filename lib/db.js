// 获取 D1 数据库实例
function getD1Database() {
  // 在 Cloudflare Pages/Workers 环境中，通过 binding 访问
  if (typeof globalThis.DB !== 'undefined') {
    return globalThis.DB;
  }

  // 在 Edge Runtime 中，通过 process.env 访问
  if (typeof process !== 'undefined' && process.env.DB) {
    return process.env.DB;
  }

  return null;
}

export async function runD1Query(sql, params = []) {
  const db = getD1Database();
  
  if (!db) {
    console.warn('D1 数据库未绑定，跳过数据库操作');
    return null;
  }

  try {
    const result = await db.prepare(sql).bind(...params).run();
    return result;
  } catch (error) {
    console.error('D1 查询失败:', error);
    return null;
  }
}

function formatUtc8Timestamp() {
  const offsetMs = 8 * 60 * 60 * 1000;
  const date = new Date(Date.now() + offsetMs);
  const pad = (value) => value.toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function insertPlayRequest({ ipAddress, queryText }) {
  const normalizedIp = ipAddress || '0.0.0.0';
  const sanitizedQuery = (queryText ?? '').toString().trim().slice(0, 2048);
  const safeQuery = sanitizedQuery || '(empty)';
  const createdAtUtc8 = formatUtc8Timestamp();

  await runD1Query(
    'INSERT INTO play_requests (ip_address, query_text, created_at) VALUES (?, ?, ?);',
    [normalizedIp, safeQuery, createdAtUtc8]
  );
}

/**
 * 访问类型常量
 */
export const VISIT_TYPES = {
  HOME: '首页',
  IMAGE_COMPRESS: '图片压缩',
  WHITEBOARD: '白板画图',
  DEV_TOOLS: '程序员工具',
  VIP_VIDEO: 'VIP视频',
  VIP_MUSIC: 'VIP音乐',
  WATERMARK: '视频去水印',
};

/**
 * 记录访问日志
 * @param {string} ipAddress - IP地址
 * @param {string} visitType - 访问类型
 * @param {string} searchContent - 搜索内容（可选）
 */
export async function logVisit(ipAddress, visitType = VISIT_TYPES.HOME, searchContent = null) {
  const normalizedIp = ipAddress || '0.0.0.0';
  const visitTime = formatUtc8Timestamp();
  const safeSearchContent = searchContent ? searchContent.toString().trim().slice(0, 500) : null;

  await runD1Query(
    `INSERT INTO visit_logs (ip_address, visit_type, search_content, last_visit_time)
     VALUES (?, ?, ?, ?);`,
    [normalizedIp, visitType, safeSearchContent, visitTime]
  );
}
