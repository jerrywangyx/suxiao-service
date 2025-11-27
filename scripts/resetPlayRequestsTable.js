import fs from 'node:fs';
import path from 'node:path';
import { runD1Query } from '../lib/db.js';

function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) {
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    if (process.env[key]) {
      continue;
    }
    const value = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

async function main() {
  const statements = [
    'DROP TABLE IF EXISTS play_requests;',
    `CREATE TABLE IF NOT EXISTS play_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      requested_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
      query_text TEXT NOT NULL
    );`,
    'CREATE INDEX IF NOT EXISTS idx_play_requests_requested_at ON play_requests (requested_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_play_requests_ip ON play_requests (ip_address);',
  ];

  for (const statement of statements) {
    await runD1Query(statement);
  }

  console.log('Cloudflare D1 play_requests 表已重建');
}

main().catch((error) => {
  console.error('重建 play_requests 表失败', error);
  process.exit(1);
});
