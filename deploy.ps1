# Cloudflare Pages 一键部署脚本（使用 WSL）
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cloudflare Pages 部署脚本 (WSL)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 从 .env.local 读取 token
$cfToken = ""
if (Test-Path ".env.local") {
    $envContent = Get-Content .env.local -Raw
    if ($envContent -match 'CLOUDFLARE_API_TOKEN=(.+)') {
        $cfToken = $Matches[1].Trim()
    }
}

if ([string]::IsNullOrEmpty($cfToken)) {
    Write-Host "错误: 未找到 CLOUDFLARE_API_TOKEN" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "使用 WSL 执行构建和部署..." -ForegroundColor Yellow

# 使用 WSL 执行完整的构建和部署流程
$wslScript = @"
cd /mnt/d/aiworkspace/suxiao-service

echo '========================================='
echo '[1/5] 清理旧构建...'
echo '========================================='
rm -rf .vercel .next node_modules/.cache

echo ''
echo '========================================='
echo '[2/5] 构建 Next.js 项目...'
echo '========================================='
npm run build
if [ `$? -ne 0 ]; then echo 'Next.js 构建失败'; exit 1; fi

echo ''
echo '========================================='
echo '[3/5] 准备 Vercel 配置...'
echo '========================================='
mkdir -p .vercel
echo '{"projectId":"prj_placeholder","orgId":"org_placeholder","settings":{"framework":"nextjs","nodeVersion":"22.x"}}' > .vercel/project.json

echo ''
echo '========================================='
echo '[4/5] 运行 Vercel 构建...'
echo '========================================='
npx vercel build --yes
if [ `$? -ne 0 ]; then echo 'Vercel 构建失败'; exit 1; fi

echo ''
echo '========================================='
echo '[5/5] 转换为 Cloudflare Pages 格式...'
echo '========================================='
npx @cloudflare/next-on-pages --skip-build
if [ `$? -ne 0 ]; then echo 'Cloudflare 转换失败'; exit 1; fi

echo ''
echo '========================================='
echo '[6/6] 部署到 Cloudflare...'
echo '========================================='
export CLOUDFLARE_API_TOKEN='$cfToken'
npx wrangler pages deploy .vercel/output/static --project-name=yongxin --commit-dirty=true

echo ''
echo '========================================='
echo '部署完成!'
echo '访问: https://yongxin.pages.dev'
echo '========================================='
"@

wsl -e bash -c $wslScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "部署流程结束" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
