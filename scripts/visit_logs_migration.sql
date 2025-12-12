-- 重建 visit_logs 表
-- 在 Cloudflare Dashboard > D1 > 选择数据库 > Console 中执行

-- 1. 删除旧表
DROP TABLE IF EXISTS visit_logs;

-- 2. 创建新表
CREATE TABLE IF NOT EXISTS visit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT NOT NULL,
  visit_type TEXT NOT NULL,
  search_content TEXT,
  last_visit_time TEXT NOT NULL DEFAULT (datetime('now', '+8 hours'))
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_visit_logs_time ON visit_logs (last_visit_time DESC);
CREATE INDEX IF NOT EXISTS idx_visit_logs_ip ON visit_logs (ip_address);
CREATE INDEX IF NOT EXISTS idx_visit_logs_type ON visit_logs (visit_type);

-- 4. 查看表结构
SELECT sql FROM sqlite_master WHERE name = 'visit_logs';

