#!/bin/bash

# 手动部署到 GitHub Pages 的脚本
# 使用方法: npm run deploy

set -e

echo "🔨 构建项目..."
npm run build

echo "📁 切换到 dist 目录..."
cd dist

echo "🔧 初始化 git 仓库..."
git init
git add -A
git commit -m "Deploy to GitHub Pages"

echo "🚀 推送到 gh-pages 分支..."
git push -f git@github.com:framist/ssvep-next.git main:gh-pages

echo "✅ 部署完成！"
echo "🌐 您的网站将在几分钟后可以通过以下地址访问："
echo "https://framist.github.io/ssvep-next/"

cd ..
