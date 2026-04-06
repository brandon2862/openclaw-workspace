#!/bin/bash

# Smart Backup Script for OpenClaw AI Assistant Framework
# 智能备份机制：24小时/10K文件变化触发，7天轮换

set -e

# 配置
BACKUP_DIR="/home/brandonclaw/.openclaw/backups"
WORKSPACE_DIR="/home/brandonclaw/.openclaw/workspace"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
LOG_FILE="$BACKUP_DIR/backup-log.txt"

# 创建日志目录
mkdir -p "$BACKUP_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查是否需要备份
check_backup_needed() {
    log "检查备份需求..."
    
    # 检查是否有最近的备份
    local latest_backup=$(find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f | sort -r | head -1)
    
    if [ -z "$latest_backup" ]; then
        log "没有找到之前的备份，需要创建新备份"
        return 0
    fi
    
    # 检查时间阈值（24小时）
    local backup_age=$(($(date +%s) - $(stat -c %Y "$latest_backup")))
    local hours_old=$((backup_age / 3600))
    
    if [ $hours_old -ge 24 ]; then
        log "上次备份已超过24小时（${hours_old}小时），需要新备份"
        return 0
    fi
    
    # 检查文件变化阈值（10K文件）
    local changed_files=$(find "$WORKSPACE_DIR" -type f -newer "$latest_backup" | wc -l)
    
    if [ $changed_files -ge 10000 ]; then
        log "检测到${changed_files}个文件变化（超过10K阈值），需要新备份"
        return 0
    fi
    
    log "不需要新备份：上次备份${hours_old}小时前，${changed_files}个文件变化"
    return 1
}

# 执行备份
perform_backup() {
    log "开始执行备份: $BACKUP_NAME"
    
    # 创建临时目录
    local temp_dir=$(mktemp -d)
    
    # 复制工作空间到临时目录（排除一些不需要备份的目录）
    log "复制工作空间文件..."
    rsync -av --progress \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='*.log' \
        --exclude='*.tmp' \
        --exclude='*.temp' \
        --exclude='chrome_user_data' \
        --exclude='downloads' \
        --exclude='venv' \
        --exclude='**/venv' \
        --exclude='**/env' \
        --exclude='**/.venv' \
        --exclude='Deep-Live-Cam' \
        --exclude='*.so' \
        --exclude='*.o' \
        --exclude='*.a' \
        "$WORKSPACE_DIR/" "$temp_dir/workspace/"
    
    # 创建压缩包
    log "创建压缩包..."
    cd "$temp_dir"
    tar -czf "$BACKUP_PATH.tar.gz" workspace/
    
    # 清理临时目录
    rm -rf "$temp_dir"
    
    log "备份完成: $BACKUP_PATH.tar.gz"
    
    # 记录备份信息
    local backup_size=$(du -h "$BACKUP_PATH.tar.gz" | cut -f1)
    log "备份大小: $backup_size"
    
    # 添加到备份列表
    echo "$TIMESTAMP|$BACKUP_NAME.tar.gz|$backup_size" >> "$BACKUP_DIR/backup-list.txt"
}

# 清理旧备份（7天轮换）
cleanup_old_backups() {
    log "清理旧备份（7天轮换）..."
    
    # 查找7天前的备份
    find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f -mtime +7 -exec rm -f {} \;
    
    # 查找7天前的目录备份
    find "$BACKUP_DIR" -name "backup-*" -type d -mtime +7 -exec rm -rf {} \;
    
    local remaining=$(find "$BACKUP_DIR" -name "backup-*" | wc -l)
    log "清理完成，剩余备份数量: $remaining"
}

# 生成备份报告
generate_report() {
    log "生成备份报告..."
    
    local report_file="$BACKUP_DIR/backup-report-$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# 智能备份报告

## 备份信息
- **备份时间:** $(date '+%Y-%m-%d %H:%M:%S')
- **备份名称:** $BACKUP_NAME
- **工作空间:** $WORKSPACE_DIR
- **备份目录:** $BACKUP_DIR

## 系统状态
- **磁盘使用:** $(df -h /home/brandonclaw | tail -1 | awk '{print $5}')
- **备份大小:** $(du -h "$BACKUP_PATH.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
- **工作空间大小:** $(du -sh "$WORKSPACE_DIR" | cut -f1)

## 备份统计
- **总备份数量:** $(find "$BACKUP_DIR" -name "backup-*.tar.gz" | wc -l)
- **7天内备份:** $(find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime -7 | wc -l)

## 触发原因
- **时间阈值:** 24小时
- **变化阈值:** 10,000个文件
- **实际变化:** $(find "$WORKSPACE_DIR" -type f -newer "$(find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f | sort -r | head -1)" 2>/dev/null | wc -l || echo "N/A") 个文件

## 清理策略
- **保留周期:** 7天
- **自动清理:** 已执行

---
*OpenClaw AI Assistant Framework - 智能备份机制*
EOF
    
    log "报告已生成: $report_file"
}

# 主函数
main() {
    log "=== OpenClaw 智能备份开始 ==="
    
    # 检查是否需要备份
    if check_backup_needed; then
        perform_backup
        cleanup_old_backups
        generate_report
        log "智能备份完成 ✅"
    else
        log "跳过备份，条件未满足"
    fi
    
    log "=== OpenClaw 智能备份结束 ==="
}

# 执行主函数
main