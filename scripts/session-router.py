#!/usr/bin/env python3
"""
会话路由器 (Session Router)

分析消息内容，自动推荐模型池。
用法: python3 session-router.py "你的消息内容"
      或 echo "消息" | python3 session-router.py -
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

# 配置文件路径
CONFIG_DIR = Path.home() / ".openclaw" / "workspace" / "config"
MODEL_POOLS_FILE = CONFIG_DIR / "model-pools.json"
ROUTING_RULES_FILE = CONFIG_DIR / "session-routing.md"

# 默认模型池配置
DEFAULT_POOLS = {
    "highspeed": {
        "name": "高速池",
        "description": "快速响应，适合简单任务",
        "models": ["xiaomi/mimo-v2-flash", "openai/gpt-4o-mini"],
        "default": "xiaomi/mimo-v2-flash",
    },
    "intelligent": {
        "name": "智能池",
        "description": "平衡性能和质量",
        "models": ["xiaomi/mimo-v2-omni", "openai/gpt-4o"],
        "default": "xiaomi/mimo-v2-omni",
    },
    "text": {
        "name": "文本池",
        "description": "专门处理文本任务",
        "models": ["openai/gpt-4o", "anthropic/claude-3-sonnet"],
        "default": "openai/gpt-4o",
    },
    "vision": {
        "name": "视觉池",
        "description": "处理图像和视觉任务",
        "models": ["openai/gpt-4o", "google/gemini-pro-vision"],
        "default": "openai/gpt-4o",
    },
}

# 关键词到模型池的映射
POOL_KEYWORDS = {
    "highspeed": [
        "简单", "快速", "心跳", "检查", "状态", "天气", "时间", "问候",
        "你好", "谢谢", "ok", "好的", "yes", "no", "hello", "hi",
        "几点", "今天", "明天", "日期", "星期", "现在",
    ],
    "intelligent": [
        "分析", "思考", "决策", "复杂", "创意", "设计", "规划", "建议",
        "市场", "创业", "商业", "策略", "方案", "评估", "比较",
        "为什么", "如何", "怎样", "怎么办", "问题", "解决",
        "创业", "startup", "business", "AI", "agent",
    ],
    "text": [
        "写作", "文档", "翻译", "总结", "编辑", "校对", "报告", "邮件",
        "文章", "内容", "文案", "描述", "介绍", "说明", "教程",
        "写", "改", "润色", "优化文字", "语法", "拼写",
        "email", "document", "report", "article",
    ],
    "vision": [
        "图片", "图像", "视觉", "截图", "设计稿", "照片", "图表",
        "看", "识别", "分析图片", "生成图片", "画", "图",
        "image", "picture", "photo", "screenshot", "design",
        "logo", "icon", "banner",
    ],
}

# 任务类型检测模式
TASK_PATTERNS = {
    "code": {
        "patterns": [
            r'```[\s\S]*?```',  # 代码块
            r'def |class |import |from .* import',
            r'function |const |let |var ',
            r'print\(|console\.log\(|return ',
            r'代码|code|编程|program|脚本|script',
            r'\.py|\.js|\.ts|\.java|\.go|\.rs',
        ],
        "pool": "intelligent",  # 代码任务通常需要智能池
    },
    "image": {
        "patterns": [
            r'\.(jpg|jpeg|png|gif|webp|svg)',
            r'图片|图像|image|图片|截图|screenshot',
            r'生成图片|画图|create image|generate',
        ],
        "pool": "vision",
    },
    "document": {
        "patterns": [
            r'\.(md|txt|doc|pdf|docx)',
            r'文档|document|文件|file',
            r'读取|read|写入|write|保存|save',
        ],
        "pool": "text",
    },
}


def load_model_pools() -> Dict:
    """加载模型池配置"""
    if MODEL_POOLS_FILE.exists():
        try:
            with open(MODEL_POOLS_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                if 'pools' in config:
                    return config['pools']
        except Exception:
            pass
    return DEFAULT_POOLS


def calculate_pool_scores(text: str) -> Dict[str, float]:
    """计算每个模型池的匹配分数"""
    text_lower = text.lower()
    scores = {pool: 0.0 for pool in POOL_KEYWORDS.keys()}
    
    for pool, keywords in POOL_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in text_lower:
                # 根据关键词长度加权
                weight = len(keyword) / 3  # 长关键词权重更高
                scores[pool] += weight
    
    return scores


def detect_task_type(text: str) -> List[str]:
    """检测任务类型"""
    detected = []
    
    for task_type, config in TASK_PATTERNS.items():
        for pattern in config['patterns']:
            if re.search(pattern, text, re.IGNORECASE):
                detected.append(task_type)
                break
    
    return detected


def analyze_complexity(text: str) -> float:
    """分析消息复杂度 (0-1)"""
    complexity = 0.0
    
    # 长度因素
    if len(text) > 200:
        complexity += 0.2
    if len(text) > 500:
        complexity += 0.2
    
    # 问号数量（多问题）
    question_count = text.count('?') + text.count('？')
    if question_count > 1:
        complexity += 0.1 * min(question_count, 5)
    
    # 连接词（复杂逻辑）
    connectors = ['因为', '所以', '但是', '然而', '如果', '那么', '虽然', '但是']
    for conn in connectors:
        if conn in text:
            complexity += 0.1
    
    # 技术术语
    tech_terms = ['API', '数据库', '算法', '架构', '框架', '部署', '配置']
    for term in tech_terms:
        if term in text:
            complexity += 0.1
    
    return min(complexity, 1.0)


def route_message(text: str, verbose: bool = False) -> Dict:
    """
    路由消息到合适的模型池
    
    Args:
        text: 消息内容
        verbose: 是否显示详细信息
    
    Returns:
        dict: 路由结果
    """
    # 加载配置
    pools = load_model_pools()
    
    # 计算分数
    pool_scores = calculate_pool_scores(text)
    
    # 检测任务类型
    task_types = detect_task_type(text)
    
    # 分析复杂度
    complexity = analyze_complexity(text)
    
    # 根据任务类型调整分数
    task_pool_overrides = {
        "code": "intelligent",
        "image": "vision",
        "document": "text",
    }
    
    for task_type in task_types:
        override_pool = task_pool_overrides.get(task_type)
        if override_pool:
            pool_scores[override_pool] += 2.0
    
    # 复杂度影响
    if complexity > 0.5:
        pool_scores["intelligent"] += complexity * 2
    
    # 找出最高分的池
    best_pool = max(pool_scores, key=pool_scores.get)
    best_score = pool_scores[best_pool]
    
    # 如果所有分数都很低，默认高速池
    if best_score < 0.5:
        best_pool = "highspeed"
    
    # 获取池信息
    pool_info = pools.get(best_pool, DEFAULT_POOLS.get(best_pool, {}))
    default_model = pool_info.get("default", "unknown") if pool_info else "unknown"
    
    # 排序所有池
    sorted_pools = sorted(pool_scores.items(), key=lambda x: x[1], reverse=True)
    
    result = {
        "recommended_pool": best_pool,
        "pool_name": pool_info.get("name", best_pool) if pool_info else best_pool,
        "default_model": default_model,
        "confidence": round(best_score / (sum(pool_scores.values()) + 0.001) * 100, 1),
        "complexity": round(complexity, 2),
        "task_types": task_types,
        "all_scores": {pool: round(score, 2) for pool, score in sorted_pools},
    }
    
    return result


def format_result(result: Dict, verbose: bool = False) -> str:
    """格式化输出结果"""
    lines = []
    
    # 主要推荐
    lines.append(f"🎯 推荐模型池: **{result['pool_name']}** ({result['recommended_pool']})")
    lines.append(f"📦 推荐模型: `{result['default_model']}`")
    lines.append(f"📊 置信度: {result['confidence']}%")
    
    if verbose:
        lines.append("")
        lines.append("📋 详细分析:")
        lines.append(f"  - 消息复杂度: {result['complexity']}")
        lines.append(f"  - 检测任务类型: {', '.join(result['task_types']) or '无'}")
        lines.append("")
        lines.append("📈 各池得分:")
        for pool, score in result['all_scores'].items():
            bar = "█" * int(score * 2)
            lines.append(f"  - {pool}: {score} {bar}")
    
    return '\n'.join(lines)


def route_from_stdin():
    """从stdin读取并路由"""
    text = sys.stdin.read().strip()
    if not text:
        print("❌ 没有输入内容")
        sys.exit(1)
    return route_message(text)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='会话路由器 - 分析消息内容自动推荐模型池')
    parser.add_argument('message', nargs='?', help='消息内容 (使用 - 从stdin读取)')
    parser.add_argument('-v', '--verbose', action='store_true', help='显示详细信息')
    parser.add_argument('-j', '--json', action='store_true', help='输出JSON格式')
    parser.add_argument('-p', '--pool', choices=['highspeed', 'intelligent', 'text', 'vision'], 
                        help='只输出推荐的模型池名称')
    
    args = parser.parse_args()
    
    # 获取输入
    if args.message == '-' or (args.message is None and not sys.stdin.isatty()):
        text = sys.stdin.read().strip()
    elif args.message:
        text = args.message
    else:
        parser.print_help()
        sys.exit(1)
    
    if not text:
        print("❌ 没有输入内容")
        sys.exit(1)
    
    # 路由
    result = route_message(text, verbose=args.verbose)
    
    # 输出
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.pool:
        print(result['recommended_pool'])
    else:
        print(format_result(result, verbose=args.verbose))


if __name__ == "__main__":
    main()
