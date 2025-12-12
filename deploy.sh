#!/bin/bash
# Cloudflare Pages 部署脚本 (WSL)

set -e

echo "========================================"
echo "Cloudflare Pages 部署脚本"
echo "========================================"

cd /mnt/d/aiworkspace/suxiao-service

# 读取 token
if [ -f ".env.local" ]; then
    export CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN .env.local | cut -d '=' -f2)
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "错误: 未找到 CLOUDFLARE_API_TOKEN"
    exit 1
fi

echo ""
echo "[1/5] 清理旧构建..."
rm -rf .vercel .next

echo ""
echo "[2/5] 构建 Next.js 项目..."
npm run build

echo ""
echo "[3/5] 准备 Vercel 配置..."
mkdir -p .vercel
echo '{"projectId":"prj_placeholder","orgId":"org_placeholder","settings":{"framework":"nextjs"}}' > .vercel/project.json

echo ""
echo "[4/5] 运行 Vercel 构建..."
npx vercel build --yes

echo ""
echo "[5/5] 转换并部署到 Cloudflare..."
npx @cloudflare/next-on-pages --skip-build
npx wrangler pages deploy .vercel/output/static --project-name=yongxin --commit-dirty=true

echo ""
echo "========================================"
echo "部署完成!"
echo "访问: https://yongxin.pages.dev"
echo "========================================"
