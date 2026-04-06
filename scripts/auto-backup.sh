#!/bin/bash
# 自动备份脚本 - 备份 workspace 到 GitHub
# 创建时间: 2026-04-06

WORKSPACE="/home/brandonclaw/.openclaw/workspace"
BACKUP_LOG="/home/brandonclaw/.openclaw/workspace/data/backup-log.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
DATE=$(date '+%Y-%m-%d')

cd "$WORKSPACE" || exit 1

# 检查是否有变更
git add -A
CHANGES=$(git status --porcelain | wc -l)

if [ "$CHANGES" -eq 0 ]; then
    echo "[$TIMESTAMP] 无变更，跳过备份" >> "$BACKUP_LOG"
    exit 0
fi

# 提交变更
git commit -m "Auto backup $TIMESTAMP"

# 推送到 GitHub
if git push origin main 2>&1; then
    echo "[$TIMESTAMP] ✅ 备份成功 ($CHANGES 个文件)" >> "$BACKUP_LOG"
else
    echo "[$TIMESTAMP] ❌ 备份失败" >> "$BACKUP_LOG"
fi

# 保留最近 100 行日志
tail -100 "$BACKUP_LOG" > "$BACKUP_LOG.tmp" && mv "$BACKUP_LOG.tmp" "$BACKUP_LOG"
