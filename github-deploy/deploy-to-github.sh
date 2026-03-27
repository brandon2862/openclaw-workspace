#!/bin/bash

echo "========================================="
echo "🚀 AI创业诊断工具 - GitHub Pages一键部署"
echo "========================================="
echo ""

# 设置变量
REPO_NAME="ai-startup-malaysia"
DEPLOY_DIR="/home/brandonclaw/.openclaw/workspace/github-deploy"
GITHUB_USER=""  # 需要你填写GitHub用户名

echo "📁 部署目录: $DEPLOY_DIR"
echo "📦 仓库名称: $REPO_NAME"
echo ""

# 检查目录
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "❌ 部署目录不存在: $DEPLOY_DIR"
    exit 1
fi

cd "$DEPLOY_DIR"

echo "📋 文件清单:"
ls -la *.html
echo ""

echo "🔧 步骤1: 初始化Git仓库"
echo "------------------------"
if [ -d ".git" ]; then
    echo "⚠️  Git仓库已存在，清理重试..."
    rm -rf .git
fi

git init
git add .
git commit -m "部署AI创业诊断工具 v1.0
- 完整15个问题诊断
- 个性化报告生成
- 马来西亚本地化
- 免费专家咨询功能"

echo "✅ Git仓库初始化完成"
echo ""

echo "🔗 步骤2: 连接到GitHub仓库"
echo "--------------------------"
echo ""
echo "请先完成以下操作："
echo "1. 访问 https://github.com/new"
echo "2. 创建仓库，名称: $REPO_NAME"
echo "3. 选择 Public"
echo "4. 不要初始化README"
echo "5. 点击 Create repository"
echo ""
echo "然后获取你的GitHub用户名，填入下面的命令中："
echo ""
echo "执行以下命令连接GitHub："
echo "----------------------------------------"
echo "cd $DEPLOY_DIR"
echo "git branch -M main"
echo "git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
echo "git push -u origin main"
echo "----------------------------------------"
echo "（将 YOUR_USERNAME 替换为你的GitHub用户名）"
echo ""

echo "🌐 步骤3: 开启GitHub Pages"
echo "-------------------------"
echo "仓库创建并上传后："
echo "1. 进入仓库 Settings > Pages"
echo "2. Source: 选择 'Deploy from a branch'"
echo "3. Branch: 选择 'main' 和 '/ (root)'"
echo "4. 点击 Save"
echo "5. 等待1-2分钟"
echo ""

echo "🎉 步骤4: 访问你的网站"
echo "---------------------"
echo "你的网站将在："
echo "https://YOUR_USERNAME.github.io/$REPO_NAME"
echo ""
echo "测试链接："
echo "- 主页面: https://YOUR_USERNAME.github.io/$REPO_NAME"
echo "- 简化版: https://YOUR_USERNAME.github.io/$REPO_NAME/simple-index.html"
echo "- 营销页: https://YOUR_USERNAME.github.io/$REPO_NAME/landing.html"
echo ""

echo "📊 部署检查清单"
echo "--------------"
echo "[ ] 1. 创建GitHub仓库: $REPO_NAME"
echo "[ ] 2. 执行Git连接命令（上面）"
echo "[ ] 3. 开启GitHub Pages"
echo "[ ] 4. 测试网站访问"
echo "[ ] 5. 分享链接给我测试"
echo ""

echo "🦐 需要帮助？"
echo "------------"
echo "1. 分享你的GitHub用户名给我"
echo "2. 分享部署后的链接给我"
echo "3. 我会帮你完成功能测试"
echo "4. 准备推广内容"
echo ""

echo "✅ 所有部署文件已准备就绪！"
echo "现在请按照上面的步骤操作。"
echo "有任何问题随时问我！"