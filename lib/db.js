function ensureEnv() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? process.env.CF_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID ?? process.env.D1_DATABASE_ID;
  const rawToken = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CF_API_TOKEN;
  const apiToken = rawToken?.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_DATABASE_ID / CLOUDFLARE_API_TOKEN 缺失');
  }

  return { accountId, databaseId, apiToken };
}

async function requestD1({ sql, params }) {
  const { accountId, databaseId, apiToken } = ensureEnv();
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      sql,
      params,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    const errorMessage =
      payload?.errors?.map((error) => error.message).join('; ') || 'Cloudflare D1 请求失败';
    throw new Error(errorMessage);
  }

  return payload;
}

export async function runD1Query(sql, params = []) {
  return requestD1({ sql, params });
}

export async function insertPlayRequest({ ipAddress, queryText }) {
  const normalizedIp = ipAddress || '0.0.0.0';
  const sanitizedQuery = (queryText ?? '').toString().trim().slice(0, 2048);
  const safeQuery = sanitizedQuery || '(empty)';

  await runD1Query('INSERT INTO play_requests (ip_address, query_text) VALUES (?, ?);', [
    normalizedIp,
    safeQuery,
  ]);
}
