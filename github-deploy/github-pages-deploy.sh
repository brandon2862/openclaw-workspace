#!/bin/bash

echo "🚀 GitHub Pages快速部署脚本"
echo "============================"
echo ""
echo "这个方法100%免费，无需认证，立即公开访问！"
echo ""

# 工作目录
WORKDIR="/home/brandonclaw/.openclaw/workspace/deploy"
cd "$WORKDIR"

echo "📁 准备部署文件..."
echo ""

# 创建GitHub Pages专用配置
cat > .github-pages-config << EOF
# GitHub Pages配置
# 网站将部署在：https://[username].github.io/ai-startup-malaysia

项目名称：AI创业诊断工具 - 马来西亚
版本：1.0.0
作者：Brandon Wong
语言：中文
市场：马来西亚
EOF

echo "✅ 文件准备完成"
echo ""
echo "📋 部署步骤："
echo "============"
echo ""
echo "1. 访问 https://github.com/new"
echo "   创建新仓库，名称：ai-startup-malaysia"
echo "   选择 Public，不要初始化README"
echo "   点击 Create repository"
echo ""
echo "2. 复制并执行以下命令："
echo "----------------------------------------"
echo "cd /home/brandonclaw/.openclaw/workspace/deploy"
echo "git init"
echo "git add ."
echo "git commit -m '部署AI创业诊断工具到GitHub Pages'"
echo "git branch -M main"
echo "git remote add origin https://github.com/YOUR_USERNAME/ai-startup-malaysia.git"
echo "git push -u origin main"
echo "----------------------------------------"
echo "（将 YOUR_USERNAME 替换为你的GitHub用户名）"
echo ""
echo "3. 开启GitHub Pages："
echo "   • 进入仓库 Settings > Pages"
echo "   • Source: Deploy from a branch"
echo "   • Branch: main, / (root)"
echo "   • 点击 Save"
echo ""
echo "4. 等待1-2分钟，访问："
echo "   https://YOUR_USERNAME.github.io/ai-startup-malaysia"
echo ""
echo "🎯 优势："
echo "• 完全免费"
echo "• 无需认证设置"
echo "• 自动HTTPS"
echo "• 支持自定义域名（未来可以绑定startupai.com）"
echo ""
echo "立即开始吧！有任何问题随时问我。🦐"