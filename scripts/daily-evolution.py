#!/usr/bin/env python3
"""
每日进化报告生成器 (Daily Evolution Report Generator)

自动分析当天记忆文件，生成进化报告。
用法: python3 daily-evolution.py [date]
      date 格式: YYYY-MM-DD (默认今天)
"""

import os
import sys
import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter
import re

# 配置
MEMORY_DIR = Path.home() / ".openclaw" / "workspace" / "memory"
MEMORY_MD = Path.home() / ".openclaw" / "workspace" / "MEMORY.md"
REPORT_DIR = Path.home() / ".openclaw" / "workspace" / "reports"

# 进化报告模板
REPORT_TEMPLATE = """## 🧬 进化报告 - {date}

### 📊 今日概况
- **记忆文件数:** {file_count}
- **总字数:** {total_chars:,}
- **主要话题:** {main_topics}
- **活跃时段:** {active_hours}

### 🎯 今日活动摘要
{activities_summary}

### 📝 关键事件
{key_events}

### 💡 学到的经验
{lessons_learned}

### ⚠️ 遇到的问题
{problems_encountered}

### 🔧 技能使用统计
{skill_stats}

### 📈 改进建议
{improvements}

---
*报告生成时间: {generated_at}*
"""


def get_date_files(target_date: str) -> list:
    """获取指定日期的所有记忆文件"""
    files = []
    for f in MEMORY_DIR.glob("*.md"):
        if f.name.startswith(target_date):
            files.append(f)
    return sorted(files)


def extract_time_from_filename(filename: str) -> str:
    """从文件名提取时间"""
    # 格式: 2026-04-06-0049.md 或 2026-04-06.md
    match = re.search(r'(\d{2})(\d{2})\.md$', filename)
    if match:
        return f"{match.group(1)}:{match.group(2)}"
    return "全天"


def analyze_content(content: str) -> dict:
    """分析文件内容"""
    result = {
        "char_count": len(content),
        "lines": content.count('\n') + 1,
        "has_code": bool(re.search(r'```|def |class |import ', content)),
        "has_tasks": bool(re.search(r'- \[.\]|TODO|FIXME|任务', content)),
        "has_decisions": bool(re.search(r'决定|决策|选择|决定|decision', content, re.IGNORECASE)),
        "has_errors": bool(re.search(r'错误|error|失败|fail|bug', content, re.IGNORECASE)),
        "has_learning": bool(re.search(r'学习|learn|学会|新知识|新技能', content, re.IGNORECASE)),
    }
    
    # 提取话题关键词
    topics = []
    topic_patterns = {
        '创业': r'创业|startup|business',
        'AI': r'AI|agent|模型|model',
        '代码': r'代码|code|编程|programming',
        '配置': r'配置|config|设置|setting',
        '记忆': r'记忆|memory|记忆文件',
        '框架': r'框架|framework|OpenClaw',
        '任务': r'任务|task|工作|work',
        '项目': r'项目|project',
    }
    
    for topic, pattern in topic_patterns.items():
        if re.search(pattern, content, re.IGNORECASE):
            topics.append(topic)
    
    result["topics"] = topics
    return result


def extract_key_events(files: list) -> list:
    """从文件中提取关键事件"""
    events = []
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            time_str = extract_time_from_filename(f.name)
            
            # 提取标题或第一行有意义的内容
            lines = [l.strip() for l in content.split('\n') if l.strip()]
            if lines:
                # 找第一个非空、非标题分隔符的行
                for line in lines[:5]:
                    if not line.startswith('#') and not line.startswith('---') and len(line) > 5:
                        events.append(f"[{time_str}] {line[:100]}")
                        break
        except Exception:
            pass
    
    return events[:10]  # 最多10个事件


def extract_problems(files: list) -> list:
    """提取遇到的问题"""
    problems = []
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            # 查找问题相关的段落
            if re.search(r'错误|error|失败|fail|问题|bug|issue', content, re.IGNORECASE):
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if re.search(r'错误|error|失败|fail|问题|bug|issue', line, re.IGNORECASE):
                        # 获取上下文
                        context = lines[max(0, i-1):min(len(lines), i+2)]
                        problem_text = ' '.join(l.strip() for l in context if l.strip())
                        if len(problem_text) > 20:
                            problems.append(problem_text[:150])
                            break
        except Exception:
            pass
    
    return problems[:5]  # 最多5个问题


def extract_lessons(files: list) -> list:
    """提取经验教训"""
    lessons = []
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            if re.search(r'经验|教训|learn|lesson|总结|反思', content, re.IGNORECASE):
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if re.search(r'经验|教训|learn|lesson|总结|反思', line, re.IGNORECASE):
                        context = lines[max(0, i-1):min(len(lines), i+3)]
                        lesson_text = ' '.join(l.strip() for l in context if l.strip())
                        if len(lesson_text) > 20:
                            lessons.append(lesson_text[:150])
                            break
        except Exception:
            pass
    
    return lessons[:5]


def count_skill_usage(files: list) -> dict:
    """统计技能使用情况"""
    skills = Counter()
    skill_patterns = {
        '代码编写': r'代码|code|编程|python|javascript',
        '文件操作': r'文件|file|读取|写入|read|write',
        '网页搜索': r'搜索|search|web|网页',
        '配置管理': r'配置|config|设置',
        '记忆维护': r'记忆|memory|整理',
        '任务管理': r'任务|task|todo',
        '文档处理': r'文档|document|报告|report',
    }
    
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            for skill, pattern in skill_patterns.items():
                if re.search(pattern, content, re.IGNORECASE):
                    skills[skill] += 1
        except Exception:
            pass
    
    return dict(skills.most_common(5))


def generate_report(target_date: str = None) -> str:
    """生成进化报告"""
    if target_date is None:
        target_date = datetime.now().strftime("%Y-%m-%d")
    
    # 获取文件
    files = get_date_files(target_date)
    
    if not files:
        return f"⚠️ 没有找到 {target_date} 的记忆文件"
    
    # 分析所有文件
    total_chars = 0
    all_topics = []
    active_hours = []
    has_code = False
    has_tasks = False
    
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            analysis = analyze_content(content)
            total_chars += analysis["char_count"]
            all_topics.extend(analysis["topics"])
            has_code = has_code or analysis["has_code"]
            has_tasks = has_tasks or analysis["has_tasks"]
            
            time_str = extract_time_from_filename(f.name)
            if time_str != "全天":
                active_hours.append(time_str)
        except Exception:
            pass
    
    # 统计话题
    topic_counts = Counter(all_topics)
    main_topics = ", ".join([t for t, _ in topic_counts.most_common(3)]) or "无"
    
    # 活跃时段
    if active_hours:
        active_hours.sort()
        active_range = f"{active_hours[0]} - {active_hours[-1]}"
    else:
        active_range = "全天"
    
    # 提取关键信息
    key_events = extract_key_events(files)
    problems = extract_problems(files)
    lessons = extract_lessons(files)
    skill_stats = count_skill_usage(files)
    
    # 生成活动摘要
    activities = []
    if has_code:
        activities.append("- 💻 进行了代码编写工作")
    if has_tasks:
        activities.append("- 📋 处理了任务相关工作")
    if any(t in ['创业', 'AI'] for t in all_topics):
        activities.append("- 🚀 涉及创业/AI相关工作")
    if any(t in ['配置', '框架'] for t in all_topics):
        activities.append("- ⚙️ 进行了框架配置工作")
    
    activities_summary = "\n".join(activities) if activities else "- 📝 日常活动记录"
    
    # 格式化关键事件
    key_events_text = "\n".join([f"  {i+1}. {e}" for i, e in enumerate(key_events)]) or "  无特别记录"
    
    # 格式化问题
    problems_text = "\n".join([f"  - {p}" for p in problems]) or "  无"
    
    # 格式化经验
    lessons_text = "\n".join([f"  - {l}" for l in lessons]) or "  无"
    
    # 格式化技能统计
    skill_text = "\n".join([f"  - {k}: {v}次" for k, v in skill_stats.items()]) or "  无"
    
    # 生成改进建议
    improvements = []
    if total_chars < 1000:
        improvements.append("- 📝 增加记录详细度")
    if not has_code and not has_tasks:
        improvements.append("- 🎯 明确记录具体任务")
    if len(files) < 3:
        improvements.append("- 📊 增加记录频率")
    improvements_text = "\n".join(improvements) if improvements else "- ✅ 记录质量良好"
    
    # 生成报告
    report = REPORT_TEMPLATE.format(
        date=target_date,
        file_count=len(files),
        total_chars=total_chars,
        main_topics=main_topics,
        active_hours=active_range,
        activities_summary=activities_summary,
        key_events=key_events_text,
        lessons_learned=lessons_text,
        problems_encountered=problems_text,
        skill_stats=skill_text,
        improvements=improvements_text,
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    
    return report


def save_report(report: str, target_date: str):
    """保存报告到文件"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report_file = REPORT_DIR / f"evolution-{target_date}.md"
    report_file.write_text(report, encoding='utf-8')
    return report_file


def main():
    """主函数"""
    # 解析参数
    target_date = None
    if len(sys.argv) > 1:
        target_date = sys.argv[1]
        # 验证日期格式
        try:
            datetime.strptime(target_date, "%Y-%m-%d")
        except ValueError:
            print(f"❌ 日期格式错误: {target_date}")
            print("正确格式: YYYY-MM-DD")
            sys.exit(1)
    else:
        target_date = datetime.now().strftime("%Y-%m-%d")
    
    print(f"🧬 生成进化报告: {target_date}")
    print("-" * 40)
    
    # 生成报告
    report = generate_report(target_date)
    
    # 保存报告
    report_file = save_report(report, target_date)
    
    print(report)
    print("-" * 40)
    print(f"✅ 报告已保存: {report_file}")


if __name__ == "__main__":
    main()
