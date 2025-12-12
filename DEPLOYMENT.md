# Cloudflare Pages 部署文档

本仓库对应 Cloudflare Pages 项目 `yongxin`。

---
## 1. 前置准备
- Node.js 版本 ≥ 20.18.0
- Cloudflare 变量：`.env.local` 中需包含：
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_D1_DATABASE_ID`
  - `CLOUDFLARE_API_TOKEN`

---
## 2. Windows PowerShell 部署流程（推荐）

### 步骤 1：清理旧构建并执行 Next.js 构建
```powershell
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
```

### 步骤 2：创建 Vercel 项目配置（如果不存在）
```powershell
# 创建 .vercel 目录和 project.json
New-Item -ItemType Directory -Path .vercel -Force
@'
{"projectId":"prj_placeholder","orgId":"org_placeholder","settings":{"framework":"nextjs","nodeVersion":"22.x"}}
'@ | Out-File -Encoding UTF8 .vercel/project.json
```

### 步骤 3：运行 Vercel 构建（需要管理员权限）
由于 Windows 创建符号链接需要管理员权限，需要以管理员身份运行 PowerShell：
```powershell
# 方法1：以管理员身份打开新窗口执行
Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-Command", "cd D:\aiworkspace\suxiao-service; npx vercel build"

# 方法2：或者直接在管理员 PowerShell 中执行
npx vercel build
```

> **注意**：如果遇到 `EPERM: operation not permitted, symlink` 错误，说明需要管理员权限。

### 步骤 4：转换为 Cloudflare Pages 格式
```powershell
npx @cloudflare/next-on-pages --skip-build
```

### 步骤 5：部署到 Cloudflare Pages
```powershell
$env:CLOUDFLARE_API_TOKEN = "<你的token>"
npx wrangler pages deploy .vercel/output/static --project-name=yongxin --commit-dirty=true
```

或者一行命令（替换 `<token>` 为实际值）：
```powershell
$env:CLOUDFLARE_API_TOKEN = "<token>"; npx wrangler pages deploy .vercel/output/static --project-name=yongxin --commit-dirty=true
```

---
## 3. 一键部署脚本（管理员 PowerShell）

将以下内容保存为 `deploy-cf.ps1`，以管理员身份运行：
```powershell
# Cloudflare Pages 一键部署脚本
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cloudflare Pages 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 步骤1：清理并构建
Write-Host "`n[1/4] 清理旧构建..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "`n[2/4] 构建 Next.js 项目..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Next.js 构建失败" }

# 步骤2：确保 project.json 存在
if (!(Test-Path ".vercel/project.json")) {
    New-Item -ItemType Directory -Path .vercel -Force | Out-Null
    '{"projectId":"prj_placeholder","orgId":"org_placeholder","settings":{"framework":"nextjs","nodeVersion":"22.x"}}' | Out-File -Encoding UTF8 .vercel/project.json
}

Write-Host "`n[3/4] 运行 Vercel 构建..." -ForegroundColor Yellow
npx vercel build
# 即使报符号链接错误，static 目录通常已创建

Write-Host "`n[4/4] 转换为 Cloudflare 格式并部署..." -ForegroundColor Yellow
npx @cloudflare/next-on-pages --skip-build
if ($LASTEXITCODE -ne 0) { throw "Cloudflare 转换失败" }

# 从 .env.local 读取 token
$envContent = Get-Content .env.local -Raw
if ($envContent -match 'CLOUDFLARE_API_TOKEN=(.+)') {
    $env:CLOUDFLARE_API_TOKEN = $Matches[1].Trim()
}

npx wrangler pages deploy .vercel/output/static --project-name=yongxin --commit-dirty=true

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "访问: https://yongxin.pages.dev" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
```

---
## 4. 部署验证
- 部署成功后访问 `https://yongxin.pages.dev`
- 验证页面：`/`、`/player`、`/music`、`/watermark`
- 验证 API：`/api/log`、`/api/music/search`
- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → yongxin → Deployments 确认部署状态

---
## 5. 常见问题

### Q: `EPERM: operation not permitted, symlink` 错误
**A:** Windows 创建符号链接需要管理员权限。以管理员身份运行 PowerShell 再执行 `npx vercel build`。

### Q: `@cloudflare/next-on-pages` 报错需要 Edge Runtime
**A:** 确保所有动态页面都添加了 `export const runtime = 'edge';`：
```javascript
// app/music/page.jsx
export const runtime = 'edge';
```

### Q: 部署后 API 调用失败
**A:** 检查 API 路由是否正确导出了 `runtime = 'edge'` 或 `runtime = 'nodejs'`。

### Q: wrangler 认证失败
**A:** 确保 `.env.local` 中的 `CLOUDFLARE_API_TOKEN` 正确，或直接设置环境变量：
```powershell
$env:CLOUDFLARE_API_TOKEN = "你的token"
```

---
## 6. 项目信息
- **Cloudflare Pages 项目名**: yongxin
- **部署 URL**: https://yongxin.pages.dev
- **Token 位置**: `.env.local` 文件中的 `CLOUDFLARE_API_TOKEN`
