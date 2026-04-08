#!/usr/bin/env python3
"""
💤 OpenClaw Dream Mode - 记忆增强系统
基于 Claude Code 梦境模式四阶段设计

Usage:
    python dream_mode.py run              # 完整 Dream Mode 处理
    python dream_mode.py scan             # 扫描记忆文件
    python dream_mode.py stats            # 统计记忆状态
    python dream_mode.py compact          # 压缩 MEMORY.md
"""

import os
import sys
import re
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

# 路径配置
WORKSPACE = Path.home() / ".openclaw/workspace"
MEMORY_DIR = WORKSPACE / "memory"
MEMORY_MD = WORKSPACE / "MEMORY.md"
DREAM_STATE_FILE = WORKSPACE / "data" / "dream-state.json"
BACKUP_DIR = WORKSPACE / "data" / "dream-backup"

# 配置
MAX_MEMORY_SIZE_KB = 25
RETENTION_DAYS = 30
MEMORY_CATEGORIES = {
    "decision": "✅ 重要决策和结果",
    "lesson": "📝 学到的教训",
    "tech": "🔧 技术配置/变更",
    "user": "👤 用户偏好和习惯",
    "project": "🚀 项目进展和里程碑",
    "error": "⚠️ 错误和解决方案",
    "milestone": "🎯 关键成就"
}


def load_dream_state() -> dict:
    """加载 Dream Mode 状态"""
    if DREAM_STATE_FILE.exists():
        with open(DREAM_STATE_FILE, 'r') as f:
            return json.load(f)
    return {
        "last_run": None,
        "total_runs": 0,
        "last_cleanup": None,
        "items_processed": 0,
        "files_removed": 0
    }


def save_dream_state(state: dict):
    """保存 Dream Mode 状态"""
    DREAM_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DREAM_STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def get_memory_files() -> List[Path]:
    """获取所有记忆文件"""
    if not MEMORY_DIR.exists():
        return []
    return sorted(MEMORY_DIR.glob("*.md"), key=lambda f: f.stat().st_mtime, reverse=True)


def get_file_age(filepath: Path) -> int:
    """获取文件天数"""
    mtime = datetime.fromtimestamp(filepath.stat().st_mtime)
    return (datetime.now() - mtime).days


def scan_memory() -> dict:
    """扫描记忆文件状态"""
    files = get_memory_files()
    total_size = sum(f.stat().st_size for f in files)
    memory_md_size = MEMORY_MD.stat().st_size if MEMORY_MD.exists() else 0

    # 按日期分组
    by_date = {}
    for f in files:
        date_match = re.match(r'(\d{4}-\d{2}-\d{2})', f.name)
        if date_match:
            date = date_match.group(1)
            if date not in by_date:
                by_date[date] = []
            by_date[date].append(f.name)

    # 识别需要清理的文件
    old_files = [f for f in files if get_file_age(f) > RETENTION_DAYS]

    return {
        "total_files": len(files),
        "total_size_kb": round(total_size / 1024, 2),
        "memory_md_size_kb": round(memory_md_size / 1024, 2),
        "dates_covered": len(by_date),
        "old_files_count": len(old_files),
        "old_files": [f.name for f in old_files[:10]],
        "by_date": {k: len(v) for k, v in sorted(by_date.items(), reverse=True)[:10]}
    }


def extract_key_info(content: str, filename: str) -> List[dict]:
    """从记忆文件中提取关键信息"""
    items = []
    current_section = None
    current_content = []

    for line in content.split('\n'):
        # 检测标题
        if line.startswith('#'):
            if current_section and current_content:
                items.append({
                    "section": current_section,
                    "content": '\n'.join(current_content).strip(),
                    "source": filename
                })
                current_content = []

            # 识别类别
            section_lower = line.lower()
            if any(w in section_lower for w in ['决策', 'decision', '结论']):
                current_section = "decision"
            elif any(w in section_lower for w in ['教训', 'lesson', '错误', 'error']):
                current_section = "error"
            elif any(w in section_lower for w in ['技术', 'tech', '配置', 'setup']):
                current_section = "tech"
            elif any(w in section_lower for w in ['用户', 'user', '偏好', 'preference']):
                current_section = "user"
            elif any(w in section_lower for w in ['项目', 'project', '进展', 'progress']):
                current_section = "project"
            elif any(w in section_lower for w in ['里程碑', 'milestone', '成就', 'achievement']):
                current_section = "milestone"
            else:
                current_section = "general"
            current_content.append(line)
        elif current_section:
            current_content.append(line)

    # 添加最后一个section
    if current_section and current_content:
        items.append({
            "section": current_section,
            "content": '\n'.join(current_content).strip(),
            "source": filename
        })

    return items


def orient_phase() -> dict:
    """阶段1: Orient - 定位当前状态"""
    print("🔍 Phase 1: Orient - 定位当前状态...")

    stats = scan_memory()
    memory_size = stats["memory_md_size_kb"]

    needs_compact = memory_size > MAX_MEMORY_SIZE_KB * 0.8  # 80% threshold
    needs_cleanup = stats["old_files_count"] > 0

    return {
        "stats": stats,
        "needs_compact": needs_compact,
        "needs_cleanup": needs_cleanup,
        "priority": "high" if needs_compact else "normal"
    }


def gather_phase() -> List[dict]:
    """阶段2: Gather - 收集关键信息"""
    print("📚 Phase 2: Gather - 收集关键信息...")

    all_items = []
    files = get_memory_files()

    for f in files[:20]:  # 最多处理20个文件
        try:
            content = f.read_text(encoding='utf-8', errors='ignore')
            items = extract_key_info(content, f.name)
            all_items.extend(items)
        except Exception as e:
            print(f"  ⚠️ 读取失败: {f.name} - {e}")

    print(f"  ✅ 收集到 {len(all_items)} 条信息")
    return all_items


def consolidate_phase(items: List[dict]) -> str:
    """阶段3: Consolidate - 整合消除矛盾"""
    print("🔄 Phase 3: Consolidate - 整合消除矛盾...")

    # 按类别分组
    by_category = {}
    for item in items:
        cat = item["section"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(item)

    # 生成整合内容
    consolidated = []
    for cat, cat_items in by_category.items():
        if cat == "general":
            continue

        category_name = MEMORY_CATEGORIES.get(cat, cat)
        consolidated.append(f"\n### {category_name}\n")

        # 去重
        seen_content = set()
        for item in cat_items:
            # 清理内容
            content = item["content"]
            # 删除空行
            lines = [l for l in content.split('\n') if l.strip()]
            cleaned = '\n'.join(lines)

            # 简单去重
            if cleaned not in seen_content and len(cleaned) > 10:
                seen_content.add(cleaned)
                consolidated.append(cleaned)
                consolidated.append("")

    result = '\n'.join(consolidated)
    print(f"  ✅ 整合完成，{len(consolidated)} 行")
    return result


def prune_phase(consolidated: str, orientation: dict) -> str:
    """阶段4: Prune - 清理过期信息"""
    print("✂️ Phase 4: Prune - 清理过期信息...")

    # 如果 MEMORY.md 超过大小限制，压缩
    current_size_kb = len(consolidated.encode('utf-8')) / 1024

    if current_size_kb > MAX_MEMORY_SIZE_KB:
        # 压缩策略：保留头部 + 最近的内容
        lines = consolidated.split('\n')
        head_lines = []
        body_lines = []
        in_body = False

        for line in lines:
            if line.startswith('## ') and not in_body:
                head_lines.append(line)
                in_body = True
            elif in_body:
                body_lines.append(line)
            else:
                head_lines.append(line)

        # 保留头部 + 最近的body内容
        max_body_lines = int(len(body_lines) * 0.7)  # 保留70%
        trimmed_body = body_lines[:max_body_lines]

        consolidated = '\n'.join(head_lines + trimmed_body)
        print(f"  ✂️ 压缩完成: {current_size_kb:.1f}KB → {len(consolidated.encode('utf-8'))/1024:.1f}KB")

    return consolidated


def run_dream_mode():
    """执行完整 Dream Mode 处理"""
    print("\n💤 OpenClaw Dream Mode 启动\n")

    state = load_dream_state()

    # Phase 1: Orient
    orientation = orient_phase()
    print(f"  📊 记忆文件: {orientation['stats']['total_files']} 个")
    print(f"  📊 MEMORY.md: {orientation['stats']['memory_md_size_kb']} KB")
    print(f"  📊 需要压缩: {'是' if orientation['needs_compact'] else '否'}")
    print(f"  📊 需要清理: {'是' if orientation['needs_cleanup'] else '否'}")

    # Phase 2: Gather
    items = gather_phase()

    # Phase 3: Consolidate
    consolidated = consolidate_phase(items)

    # Phase 4: Prune
    if orientation["needs_compact"]:
        consolidated = prune_phase(consolidated, orientation)

    # 保存结果
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    new_content = f"""# 🧠 MEMORY.md - 长期记忆

## 📅 Dream Mode 处理
- **最后处理**: {timestamp}
- **处理条目**: {len(items)} 条
- **文件数量**: {orientation['stats']['total_files']} 个

---

{consolidated}

---

_本文件由 Dream Mode 自动整理_
"""

    # 备份原文件
    if MEMORY_MD.exists():
        backup_path = BACKUP_DIR / f"MEMORY-{datetime.now().strftime('%Y%m%d-%H%M')}.md"
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        MEMORY_MD.rename(backup_path)
        print(f"  💾 已备份到: {backup_path.name}")

    # 写入新内容
    MEMORY_MD.write_text(new_content, encoding='utf-8')

    # 清理旧文件
    if orientation["needs_cleanup"]:
        old_files = [f for f in get_memory_files() if get_file_age(f) > RETENTION_DAYS]
        for f in old_files[:5]:  # 最多删除5个
            try:
                f.unlink()
                state["files_removed"] = state.get("files_removed", 0) + 1
                print(f"  🗑️ 已删除: {f.name}")
            except Exception as e:
                print(f"  ⚠️ 删除失败: {f.name} - {e}")

    # 更新状态
    state["last_run"] = datetime.now().isoformat()
    state["total_runs"] = state.get("total_runs", 0) + 1
    state["items_processed"] = state.get("items_processed", 0) + len(items)
    save_dream_state(state)

    final_size = MEMORY_MD.stat().st_size / 1024
    print(f"\n✅ Dream Mode 完成!")
    print(f"  📝 MEMORY.md: {final_size:.1f} KB")
    print(f"  🔧 处理条目: {len(items)} 条")


def show_stats():
    """显示记忆统计"""
    stats = scan_memory()
    state = load_dream_state()

    print("\n📊 OpenClaw 记忆系统统计\n")
    print(f"📁 记忆文件总数: {stats['total_files']}")
    print(f"💾 记忆总大小: {stats['total_size_kb']} KB")
    print(f"📝 MEMORY.md: {stats['memory_md_size_kb']} KB")
    print(f"📅 覆盖日期: {stats['dates_covered']} 天")
    print(f"🗑️ 待清理文件: {stats['old_files_count']} 个")
    print(f"🔄 总处理次数: {state.get('total_runs', 0)}")
    print(f"⏱️ 上次处理: {state.get('last_run', '从未')}")

    if stats['old_files']:
        print(f"\n老旧文件:")
        for f in stats['old_files']:
            print(f"  - {f}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "run":
        run_dream_mode()
    elif command == "scan":
        stats = scan_memory()
        print(json.dumps(stats, indent=2, ensure_ascii=False))
    elif command == "stats":
        show_stats()
    elif command == "compact":
        items = gather_phase()
        consolidated = consolidate_phase(items)
        print(consolidated)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()