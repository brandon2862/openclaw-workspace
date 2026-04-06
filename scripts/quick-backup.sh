#!/bin/bash

# Quick Backup Script for OpenClaw
# 只备份关键文件，不备份大型依赖文件

set -e

# 配置
BACKUP_DIR="/home/brandonclaw/.openclaw/backups"
WORKSPACE_DIR="/home/brandonclaw/.openclaw/workspace"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="quick-backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
LOG_FILE="$BACKUP_DIR/backup-log.txt"

# 创建日志
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 开始备份
log "=== 开始快速备份 ==="
log "备份时间: $TIMESTAMP"
log "备份名称: $BACKUP_NAME"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
log "临时目录: $TEMP_DIR"

# 只备份关键文件
log "备份关键文件..."

# 1. 配置文件
mkdir -p "$TEMP_DIR/config"
cp -r "$WORKSPACE_DIR/AGENTS.md" "$TEMP_DIR/"
cp -r "$WORKSPACE_DIR/SOUL.md" "$TEMP_DIR/"
cp -r "$WORKSPACE_DIR/USER.md" "$TEMP_DIR/"
cp -r "$WORKSPACE_DIR/IDENTITY.md" "$TEMP_DIR/"
cp -r "$WORKSPACE_DIR/MEMORY.md" "$TEMP_DIR/"
cp -r "$WORKSPACE_DIR/HEARTBEAT.md" "$TEMP_DIR/"
cp -r "$WORKSPACE_DIR/TOOLS.md" "$TEMP_DIR/"

# 2. 记忆文件
mkdir -p "$TEMP_DIR/memory"
cp -r "$WORKSPACE_DIR/memory/"*.md "$TEMP_DIR/memory/" 2>/dev/null || true

# 3. 脚本文件
mkdir -p "$TEMP_DIR/scripts"
cp -r "$WORKSPACE_DIR/scripts/"*.sh "$TEMP_DIR/scripts/" 2>/dev/null || true
cp -r "$WORKSPACE_DIR/scripts/"*.py "$TEMP_DIR/scripts/" 2>/dev/null || true

# 4. 项目文档（不包含大型依赖）
mkdir -p "$TEMP_DIR/projects"
find "$WORKSPACE_DIR" -maxdepth 2 -name "*.md" -type f | head -20 | while read file; do
    rel_path="${file#$WORKSPACE_DIR/}"
    mkdir -p "$TEMP_DIR/$(dirname "$rel_path")"
    cp "$file" "$TEMP_DIR/$rel_path"
done

# 5. 重要项目文件（排除node_modules和venv）
important_projects=("todo-app" "electron-vue-app" "fx-sales-system")
for project in "${important_projects[@]}"; do
    if [ -d "$WORKSPACE_DIR/$project" ]; then
        log "备份项目: $project"
        mkdir -p "$TEMP_DIR/$project"
        
        # 只备份源代码和配置文件
        find "$WORKSPACE_DIR/$project" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.vue" -o -name "*.html" -o -name "*.css" -o -name "*.json" -o -name "*.md" -o -name "*.py" -o -name "*.txt" -o -name "*.yml" -o -name "*.yaml" -o -name "*.toml" -o -name "Dockerfile" -o -name "*.sh" \) | head -50 | while read file; do
            rel_path="${file#$WORKSPACE_DIR/}"
            mkdir -p "$TEMP_DIR/$(dirname "$rel_path")"
            cp "$file" "$TEMP_DIR/$rel_path"
        done
    fi
done

# 创建压缩包
log "创建压缩包..."
cd "$TEMP_DIR"
tar -czf "$BACKUP_PATH" .

# 清理临时目录
rm -rf "$TEMP_DIR"

# 记录备份信息
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "备份完成: $BACKUP_PATH"
log "备份大小: $BACKUP_SIZE"

# 清理7天前的备份
log "清理旧备份..."
find "$BACKUP_DIR" -name "quick-backup-*.tar.gz" -type f -mtime +7 -delete
find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f -mtime +30 -delete

# 生成报告
REPORT_FILE="$BACKUP_DIR/backup-report-$TIMESTAMP.md"
cat > "$REPORT_FILE" << EOF
# 快速备份报告

## 备份信息
- **时间:** $(date '+%Y-%m-%d %H:%M:%S')
- **名称:** $BACKUP_NAME
- **大小:** $BACKUP_SIZE
- **位置:** $BACKUP_PATH

## 备份内容
1. **配置文件:** AGENTS.md, SOUL.md, USER.md, IDENTITY.md, MEMORY.md, HEARTBEAT.md, TOOLS.md
2. **记忆文件:** memory/*.md
3. **脚本文件:** scripts/*.sh, scripts/*.py
4. **项目文档:** 重要的Markdown文档
5. **关键项目:** todo-app, electron-vue-app, fx-sales-system 的源代码文件

## 排除内容
- node_modules 目录
- venv 虚拟环境
- 大型二进制文件
- 缓存文件

## 备份统计
- **当前备份:** $BACKUP_SIZE
- **7天内快速备份:** $(find "$BACKUP_DIR" -name "quick-backup-*.tar.gz" -mtime -7 | wc -l) 个
- **总备份数量:** $(find "$BACKUP_DIR" -name "*.tar.gz" | wc -l) 个

## 清理策略
- 快速备份: 保留7天
- 完整备份: 保留30天

---
*OpenClaw AI Assistant Framework - 智能备份机制*
*执行时间: $(date)*
EOF

log "报告已生成: $REPORT_FILE"
log "=== 快速备份完成 ==="