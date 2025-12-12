/**
 * 重建 visit_logs 表脚本
 * 
 * 新表结构：
 * - id: 自增主键
 * - ip_address: IP地址
 * - visit_type: 访问类型（首页、图片压缩、白板画图、程序员工具、VIP视频、VIP音乐、视频去水印）
 * - search_content: 搜索内容（可为空）
 * - last_visit_time: 访问时间
 */

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
    // 删除旧表
    'DROP TABLE IF EXISTS visit_logs;',
    // 创建新表
    `CREATE TABLE IF NOT EXISTS visit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      visit_type TEXT NOT NULL,
      search_content TEXT,
      last_visit_time TEXT NOT NULL DEFAULT (datetime('now', '+8 hours'))
    );`,
    // 创建索引
    'CREATE INDEX IF NOT EXISTS idx_visit_logs_time ON visit_logs (last_visit_time DESC);',
    'CREATE INDEX IF NOT EXISTS idx_visit_logs_ip ON visit_logs (ip_address);',
    'CREATE INDEX IF NOT EXISTS idx_visit_logs_type ON visit_logs (visit_type);',
  ];

  for (const statement of statements) {
    await runD1Query(statement);
  }

  console.log('Cloudflare D1 visit_logs 表已重建');
  console.log('新表结构：id, ip_address, visit_type, search_content, last_visit_time');
}

main().catch((error) => {
  console.error('重建 visit_logs 表失败', error);
  process.exit(1);
});

