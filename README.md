# 云岫解析（Next.js 版）

## 启动方式
1. 复制 `.env.example` 为 `.env.local`，写入 Cloudflare D1 及 API Token（需要具备 D1 Edit 权限）。
2. 执行 `npm install` 安装依赖。
3. 本地调试：`npm run dev` 并访问 `http://localhost:3000`。
4. 生产模式：`npm run build && npm start`，在任意 Node.js 18+ 环境运行即可。

## Cloudflare Pages + Workers（静态 + 后端）部署
1. **运行环境**：`@cloudflare/next-on-pages` 依赖 Vercel CLI，官方仅支持 macOS/Linux/WSL；纯 Windows PowerShell 会提示 “Bash/WSL optional component required” 并终止，因此请在 WSL2、Linux 容器或 CI 执行构建。
2. **依赖安装**：仓库已经在 `package.json` 中加入 `@cloudflare/next-on-pages` 与 `wrangler`（devDependencies），保持依赖单一来源，执行 `npm install` 即可。
3. **生成产物**：兼容环境运行 `npm run cloudflare:build`，Next.js 会输出 `.vercel/output`：
   - `.vercel/output/static`：静态资源，将由 Pages 托管。
   - `.vercel/output/functions`：Workers 端函数（如 `/api/log`）。
4. **dash.cloudflare.com -> Pages**：
   - Create project -> 选择 GitLab 仓库或 ZIP 上传。
   - Build command：`npm run cloudflare:build`。
   - Build output directory：`.vercel/output/static`，Functions 目录会自动识别。
   - Settings -> Environment variables：补充 `.env.local` 中的变量，可区分 Preview/Production。
5. **资源绑定**：Pages -> Functions -> Settings -> Add bindings，名称需与 `wrangler.toml` 相同（如 `database_name=yongxin`），以便在 Workers 中通过 `env.<name>` 访问，保持单一职责。
6. **验证与回滚**：先打开 Pages 提供的 preview 域名确认前端与 `/api/log` 正常，再 Promote to Production；若需回滚，可直接在 Releases 中选择旧版本。

> 如果只需要纯静态站点，可在 Linux/WSL 下运行 `npx next build && npx next export` 并上传 `out` 目录，但此模式不会部署任何 API（遵循 YAGNI）。

## Cloudflare D1
1. `wrangler.toml` 示例配置：`database_name=yongxin`，`database_id=ed51dbac-e68d-4f12-ae0d-7852d0da2bdc`，在 Pages 绑定时需保持一致。
2. `.env.local` 必填：
   ```bash
   CLOUDFLARE_ACCOUNT_ID=0ca0a84f4ef468da4daf5363b90a8f58
   CLOUDFLARE_D1_DATABASE_ID=ed51dbac-e68d-4f12-ae0d-7852d0da2bdc
   CLOUDFLARE_API_TOKEN=<D1 Edit Token>
   ```
3. 初次部署或重建表结构时，运行 `node scripts/resetPlayRequestsTable.js`，脚本会删除旧表并创建新的 `play_requests`（字段：`ip_address`、`requested_at` [UTC+8]、`query_text`）。更多细节见 `docs/database.md`。
4. 若需在 Cloudflare 控制台手动执行 SQL，可直接复用 `docs/database.md` 的语句或使用 `wrangler d1 execute`。

## 说明
- `/api/log` 会记录点击“播”时的真实 IP（优先 `cf-connecting-ip` / `x-forwarded-for`，处理 IPv4 映射）、UTC+8 时间及搜索内容，数据写入 Cloudflare D1。
- 为空的搜索内容会保存 `(empty)` 以满足非空约束；如需扩展字段（线路、UA 等），同步修改 `docs/database.md` 与 `lib/db.js`。
- 静态资源位于 `public`，Bootstrap 在 `app/layout.js` 中全局引入，页面逻辑集中在 `app/page.jsx`。
