#!/bin/bash
# 股票数据自动更新 - 通过 agent 触发
# 用法: ./stock-cron-update.sh

echo "📈 股票数据更新任务开始 $(date)"

# 记录到日志
LOG_FILE="/home/brandonclaw/.openclaw/workspace/logs/stock-updater.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG_FILE"

# 发送消息给 main session 提醒更新股票数据
# 这里只是记录，实际更新需要通过 cron job 调用 agent

echo "⏰ 需要通过 agent 手动更新数据" >> "$LOG_FILE"
echo "✅ 任务完成"

# 说明：这个脚本由 cron 调用，但实际数据抓取需要通过 agent
# 建议设置每日定时任务，提醒手动更新或自动抓取