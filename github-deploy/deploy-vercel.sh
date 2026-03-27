#!/bin/bash

echo "🚀 Vercel部署脚本"
echo "================="
echo ""
echo "当前目录: $(pwd)"
echo "Vercel版本: $(vercel --version 2>/dev/null || echo '未安装')"
echo ""

# 检查是否在deploy目录
if [[ $(basename $(pwd)) != "deploy" ]]; then
    echo "⚠️  请先进入deploy目录:"
    echo "cd /home/brandonclaw/.openclaw/workspace/deploy"
    echo ""
    read -p "是否自动切换到deploy目录? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd /home/brandonclaw/.openclaw/workspace/deploy
        echo "✅ 已切换到deploy目录"
    else
        echo "❌ 请在deploy目录中运行此脚本"
        exit 1
    fi
fi

echo ""
echo "📋 文件检查:"
echo "-----------"
ls -la *.html
echo ""

echo "🔑 步骤1: 登录Vercel"
echo "-------------------"
echo "执行以下命令登录（需要浏览器验证）:"
echo "vercel login"
echo ""
echo "如果没有Vercel账号，请在浏览器中注册"
echo "推荐使用GitHub账号快速登录"
echo ""
read -p "按回车开始登录..." 

vercel login

echo ""
echo "☁️ 步骤2: 部署到生产环境"
echo "----------------------"
echo "执行以下命令部署:"
echo "vercel --prod"
echo ""
echo "部署过程中按提示回答："
echo "1. Set up and deploy? → Y"
echo "2. Which scope? → 按回车"
echo "3. Link to existing project? → N"
echo "4. Project name? → ai-startup-diagnosis (或按回车)"
echo "5. Directory? → . (按回车)"
echo "6. Override settings? → N"
echo ""
read -p "按回车开始部署..."

vercel --prod

echo ""
echo "🎉 部署完成！"
echo "------------"
echo "你的网站链接会在上面显示"
echo "通常是: https://ai-startup-diagnosis.vercel.app"
echo ""
echo "📊 下一步："
echo "1. 测试网站功能"
echo "2. 分享链接获取反馈"
echo "3. 考虑购买自定义域名"
echo ""
echo "需要帮助随时联系！🦐"