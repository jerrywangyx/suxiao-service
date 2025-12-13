#!/bin/bash
# WSL Ubuntu 构建部署脚本
# 使用方法: 在 WSL Ubuntu 终端中运行 bash /mnt/d/aiworkspace/suxiao-service/wsl-deploy.sh

set -e

echo "=========================================="
echo "1. 检查/安装 Node.js 20 (使用 nvm)"
echo "=========================================="

# 加载 nvm（如果已安装）
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! command -v nvm &> /dev/null; then
    echo "安装 nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    echo "安装 Node.js 20..."
    nvm install 20
    nvm use 20
else
    echo "Node.js 已安装: $(node -v)"
fi

echo "=========================================="
echo "2. 同步项目到 Linux 文件系统"
echo "=========================================="
# rsync 增量同步，排除大目录
rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.vercel' \
    --exclude '.git' \
    /mnt/d/aiworkspace/suxiao-service/ ~/suxiao-service/

cd ~/suxiao-service
echo "当前目录: $(pwd)"

echo "=========================================="
echo "3. 安装依赖"
echo "=========================================="
npm install

echo "=========================================="
echo "4. 构建项目"
echo "=========================================="
npm run cloudflare:build

echo "=========================================="
echo "5. 部署到 Cloudflare Pages"
echo "=========================================="
export CLOUDFLARE_API_TOKEN="z4Vm9XLEmbQ0Yg4jka562lzj5TZRRrPzY6IfkJ_L"
npx wrangler pages deploy .vercel/output/static --project-name=yongxin --commit-dirty=true

echo "=========================================="
echo "✅ 部署完成！"
echo "访问: https://yongxin.pages.dev"
echo "=========================================="

