# 云岫解析（Next.js 版）

## 启动方式
1. 复制 `.env.example` 为 `.env.local` 并填写 Cloudflare D1 及 API Token（需具备 D1 Edit 权限）。
2. 执行 `npm install` 安装依赖。
3. 本地调试：`npm run dev`，浏览器访问 `http://localhost:3000`。
4. 生产模式：`npm run build && npm start`，可在任意 Node.js 18+ 服务器运行。

## Cloudflare Pages + Workers（静态 + 后端）部署
1. **运行环境**：`@cloudflare/next-on-pages` 依赖 Vercel CLI，只在 macOS/Linux/WSL 场景受支持；纯 Windows PowerShell 会提示 “Bash/WSL optional component required” 并终止。若需在 Windows 中构建，请启用 WSL2 或在 CI/容器内执行。
2. **依赖安装**：仓库已预置 `@cloudflare/next-on-pages` 与 `wrangler` 为 devDependencies，直接运行 `npm install` 即可，避免重复维护（DRY）。
3. **生成 Cloudflare 产物**：在兼容环境运行 `npm run cloudflare:build`，脚本会调用 Next.js 构建并输出 `.vercel/output`：
   - `.vercel/output/static`：静态资源，由 Pages 托管。
   - `.vercel/output/functions`：API/SSR 逻辑，由 Workers 运行（满足“静态 + 后端”）。
4. **dash.cloudflare.com -> Pages**：
   - 创建项目并选择仓库或 ZIP 上传。
   - Build command：`npm run cloudflare:build`。
   - Build output directory：`.vercel/output/static`（Functions 会被自动识别）。
   - 设置环境变量：在 Settings -> Environment variables 中填入 `.env.local` 同名变量，可区分 Preview/Production。
5. **资源绑定**：如需 D1/KV/Queues，在 Pages -> Functions -> Settings -> Add bindings 中配置，名称需与 `wrangler.toml` 保持一致，Workers 中即可通过 `env.<name>` 访问，确保单一职责。
6. **验证与回滚**：部署后优先访问 Pages preview 域名确认前端与 `/api/log` 工作正常，再 Promote to Production；如需回滚，可在 Releases 中一键切换，流程保持 KISS。

> 如果只需要静态站点，可在 Linux/WSL 下执行 `npx next build && npx next export`，并上传 `out` 目录；此方式不会部署后端 API（YAGNI），使用前请确认需求。

## Cloudflare D1
1. 在 Dashboard 或 `wrangler.toml` 中保持数据库绑定示例：`database_name=yongxin`，`database_id=ed51dbac-e68d-4f12-ae0d-7852d0da2bdc`。
2. `.env.local` 需包含：
   ```bash
   CLOUDFLARE_ACCOUNT_ID=0ca0a84f4ef468da4daf5363b90a8f58
   CLOUDFLARE_D1_DATABASE_ID=ed51dbac-e68d-4f12-ae0d-7852d0da2bdc
   CLOUDFLARE_API_TOKEN=<D1 Edit Token>
   ```
3. 初次部署或需要重建表结构可执行 `node scripts/resetPlayRequestsTable.js`，脚本会清理旧表并创建新的 `play_requests`（字段：`ip_address`、`requested_at`[UTC+8]、`query_text`）。结构详见 `docs/database.md`。
4. 若要在 Cloudflare 控制台手动操作，可直接复制 `docs/database.md` 中 SQL，或使用 `wrangler d1 execute`。

## 说明
- `/api/log` 每次点击“播”会写入真实 IP（优先 `cf-connecting-ip`/`x-forwarded-for`，自动兼容 `::ffff:` IPv4 映射）、UTC+8 时间与搜索内容，数据由 Cloudflare D1 托管。
- 空查询会写入 `(empty)` 以满足非空约束；若需记录更多信息（线路、UA 等），修改 `docs/database.md` 与 `lib/db.js` 即可。
- 静态资源位于 `public`，Bootstrap 在 `app/layout.js` 内全局引入，页面逻辑集中于 `app/page.jsx`。
