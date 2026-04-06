#!/bin/bash

# Model Health Check Script for OpenClaw AI Assistant Framework
# 模型健康检查机制

set -e

# 配置
LOG_FILE="/home/brandonclaw/.openclaw/workspace/logs/model-health.log"
WORKSPACE_DIR="/home/brandonclaw/.openclaw/workspace"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查模型配置文件
check_model_config() {
    log "检查模型配置..."
    
    local config_file="$WORKSPACE_DIR/config/model-pools.json"
    
    if [ -f "$config_file" ]; then
        log "✅ 模型配置文件存在: $config_file"
        return 0
    else
        log "⚠️ 模型配置文件不存在: $config_file"
        return 1
    fi
}

# 检查OpenClaw状态
check_openclaw_status() {
    log "检查OpenClaw状态..."
    
    if command -v openclaw &> /dev/null; then
        local status=$(openclaw status 2>&1 || echo "error")
        if echo "$status" | grep -q "running\|active\|ok"; then
            log "✅ OpenClaw运行正常"
            return 0
        else
            log "⚠️ OpenClaw状态异常: $status"
            return 1
        fi
    else
        log "⚠️ openclaw命令不可用"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    log "检查磁盘空间..."
    
    local usage=$(df -h /home/brandonclaw | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        log "✅ 磁盘使用正常: ${usage}%"
        return 0
    elif [ "$usage" -lt 90 ]; then
        log "⚠️ 磁盘使用较高: ${usage}%"
        return 1
    else
        log "🚨 磁盘使用危险: ${usage}%"
        return 2
    fi
}

# 检查备份状态
check_backup_status() {
    log "检查备份状态..."
    
    local backup_dir="/home/brandonclaw/.openclaw/backups"
    local latest_backup=$(find "$backup_dir" -name "backup-*.tar.gz" -type f 2>/dev/null | sort -r | head -1)
    
    if [ -z "$latest_backup" ]; then
        log "⚠️ 没有找到备份文件"
        return 1
    fi
    
    local backup_age=$(($(date +%s) - $(stat -c %Y "$latest_backup")))
    local hours_old=$((backup_age / 3600))
    
    if [ $hours_old -lt 24 ]; then
        log "✅ 备份正常，上次备份: ${hours_old}小时前"
        return 0
    else
        log "⚠️ 备份较旧: ${hours_old}小时前"
        return 1
    fi
}

# 生成健康报告
generate_health_report() {
    log "生成健康报告..."
    
    local report_file="$WORKSPACE_DIR/logs/health-report-$(date +%Y%m%d-%H%M%S).md"
    mkdir -p "$(dirname "$report_file")"
    
    cat > "$report_file" << EOF
# 模型健康检查报告

## 检查时间
$(date '+%Y-%m-%d %H:%M:%S')

## 系统状态
- **磁盘使用:** $(df -h /home/brandonclaw | tail -1 | awk '{print $5}')
- **内存状态:** $(free -h | grep Mem | awk '{print $3"/"$2}')
- **运行时间:** $(uptime -p 2>/dev/null || uptime)

## 检查结果
- **模型配置:** $(check_model_config && echo "✅ 正常" || echo "⚠️ 异常")
- **OpenClaw状态:** $(check_openclaw_status && echo "✅ 正常" || echo "⚠️ 异常")
- **磁盘空间:** $(check_disk_space && echo "✅ 正常" || echo "⚠️ 需要关注")
- **备份状态:** $(check_backup_status && echo "✅ 正常" || echo "⚠️ 需要关注")

## 建议操作
$(if ! check_disk_space > /dev/null 2>&1; then echo "- 清理磁盘空间"; fi)
$(if ! check_backup_status > /dev/null 2>&1; then echo "- 执行备份"; fi)

---
*OpenClaw AI Assistant Framework - 模型健康检查*
EOF
    
    log "健康报告已生成: $report_file"
}

# 主函数
main() {
    log "=== OpenClaw 模型健康检查开始 ==="
    
    check_model_config
    check_openclaw_status
    check_disk_space
    check_backup_status
    generate_health_report
    
    log "=== OpenClaw 模型健康检查结束 ==="
}

# 执行主函数
main
