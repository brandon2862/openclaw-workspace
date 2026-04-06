#!/bin/bash

# 自动部署脚本
set -e

echo "========================================="
echo "🤖 AI创业诊断工具自动部署脚本"
echo "========================================="
echo ""

# 设置工作目录
WORKDIR="/home/brandonclaw/.openclaw/workspace/deploy"
cd "$WORKDIR"

echo "📁 工作目录: $WORKDIR"
echo "📄 项目文件:"
ls -1 *.html
echo ""

# 检查Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI未安装"
    echo "正在安装Vercel CLI..."
    npm install -g vercel@latest --no-fund --no-audit
    echo "✅ Vercel CLI安装完成"
fi

echo "🔍 Vercel版本: $(vercel --version)"
echo ""

echo "🚀 开始部署流程..."
echo ""

# 第一步：检查是否已登录
echo "1. 检查Vercel登录状态..."
if vercel whoami &> /dev/null; then
    echo "   ✅ 已登录Vercel"
else
    echo "   ⚠️  未登录Vercel"
    echo ""
    echo "   请执行以下命令登录："
    echo "   vercel login"
    echo ""
    echo "   这会打开浏览器让你登录。"
    echo "   如果没有账号，请先注册：https://vercel.com/signup"
    echo "   推荐使用GitHub账号快速登录"
    echo ""
    read -p "   按回车继续（登录后再运行此脚本）..." 
    exit 0
fi

echo ""
echo "2. 准备部署文件..."
echo "   📊 文件清单："
echo "   - index.html (主诊断工具)"
echo "   - landing.html (营销页面)"
echo "   - vercel.json (配置文件)"
echo "   - package.json (项目配置)"
echo ""

echo "3. 开始部署到Vercel..."
echo "   🔄 这可能需要1-2分钟..."
echo ""

# 执行部署
DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1 || true)

# 提取部署URL
if echo "$DEPLOY_OUTPUT" | grep -q "https://"; then
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o "https://[^ ]*\.vercel\.app" | head -1)
    echo "✅ 部署成功！"
    echo ""
    echo "🌐 你的网站已上线："
    echo "   $DEPLOY_URL"
    echo ""
    echo "📱 测试链接："
    echo "   主诊断工具：$DEPLOY_URL"
    echo "   营销页面：$DEPLOY_URL/landing"
    echo ""
else
    echo "❌ 部署失败，输出："
    echo "$DEPLOY_OUTPUT"
    echo ""
    echo "💡 尝试手动部署："
    echo "   cd $WORKDIR"
    echo "   vercel --prod"
    exit 1
fi

echo "========================================="
echo "🎉 部署完成！下一步行动："
echo "========================================="
echo ""
echo "1. 🔗 立即访问：$DEPLOY_URL"
echo "2. 📱 测试移动端显示"
echo "3. 🤝 分享给朋友测试"
echo "4. 📊 收集用户反馈"
echo "5. 🌐 考虑购买域名：aichuangye.my"
echo ""
echo "需要帮助？随时联系！🦐"
echo ""