#!/usr/bin/env python3
"""
上下文压缩工具 (Context Compressor)

按配置规则压缩对话历史，节省 tokens。
用法: python3 context-compressor.py <input_file> [output_file]
      或 echo "text" | python3 context-compressor.py -
"""

import os
import sys
import re
from datetime import datetime
from pathlib import Path

# 配置
MAX_OUTPUT_CHARS = 5000  # 最大输出字符数
TARGET_COMPRESSION_RATIO = 0.78  # 目标压缩率 (22%节省)

# 保留优先级
HIGH_PRIORITY_PATTERNS = [
    r'用户指令|任务要求|明确要求',
    r'决定|决策|选择|decision',
    r'```[\s\S]*?```',  # 代码块
    r'错误|error|失败|fail|bug|exception',
    r'/[\w/-]+\.\w+',  # 文件路径
    r'https?://\S+',  # URL
]

LOW_PRIORITY_PATTERNS = [
    r'好的|没问题|收到|了解|明白',
    r'让我想想|我来帮你|让我看一下',
    r'谢谢|感谢|thank',
    r'你好|嗨|hello|hi',
]

DELETE_PATTERNS = [
    r'调试|debug|log:|console\.log',
    r'临时|temp|temporary',
]


def count_tokens_estimate(text: str) -> int:
    """估算 token 数（中文约1.5字/token，英文约4字/token）"""
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    other_chars = len(text) - chinese_chars
    return int(chinese_chars / 1.5 + other_chars / 4)


def is_high_priority(line: str) -> bool:
    """检查是否为高优先级内容"""
    for pattern in HIGH_PRIORITY_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    return False


def is_low_priority(line: str) -> bool:
    """检查是否为低优先级内容"""
    for pattern in LOW_PRIORITY_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    return False


def should_delete(line: str) -> bool:
    """检查是否应该删除"""
    for pattern in DELETE_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    return False


def simplify_greetings(text: str) -> str:
    """简化礼貌用语"""
    replacements = [
        (r'好的，没问题', '好的'),
        (r'好的，收到', '收到'),
        (r'我来帮你处理', '处理中'),
        (r'让我想想', '思考中'),
        (r'让我帮你', '处理中'),
        (r'我来帮你', '处理中'),
        (r'谢谢你的', ''),
        (r'感谢你的', ''),
    ]
    
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    
    return text


def merge_repeated_lines(lines: list) -> list:
    """合并重复行"""
    seen = set()
    result = []
    
    for line in lines:
        line_normalized = line.strip().lower()
        if line_normalized and line_normalized not in seen:
            seen.add(line_normalized)
            result.append(line)
        elif not line_normalized:  # 保留空行
            result.append(line)
    
    return result


def extract_summary(text: str, max_lines: int = 3) -> str:
    """提取摘要"""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # 找到最重要的几行
    important_lines = []
    for line in lines:
        if is_high_priority(line):
            important_lines.append(line)
            if len(important_lines) >= max_lines:
                break
    
    if not important_lines and lines:
        important_lines = lines[:max_lines]
    
    return " | ".join(important_lines)


def compress_text(text: str, aggressive: bool = False) -> dict:
    """
    压缩文本
    
    Args:
        text: 输入文本
        aggressive: 是否使用激进压缩
    
    Returns:
        dict: 压缩结果
    """
    original_tokens = count_tokens_estimate(text)
    original_chars = len(text)
    
    # 分行处理
    lines = text.split('\n')
    compressed_lines = []
    
    # 第一遍：删除低优先级和标记删除的内容
    for line in lines:
        if should_delete(line) and aggressive:
            continue
        if is_low_priority(line) and aggressive:
            continue
        compressed_lines.append(line)
    
    # 第二遍：简化礼貌用语
    simplified_lines = []
    for line in compressed_lines:
        simplified = simplify_greetings(line)
        if simplified.strip():  # 只保留非空行
            simplified_lines.append(simplified)
    
    # 第三遍：合并重复
    merged_lines = merge_repeated_lines(simplified_lines)
    
    # 第四遍：转换长段落为列表
    final_lines = []
    for line in merged_lines:
        if len(line) > 200 and not line.startswith('#') and not line.startswith('-'):
            # 长段落转为要点
            sentences = re.split(r'[。！？.!?]', line)
            for s in sentences:
                s = s.strip()
                if s and len(s) > 5:
                    final_lines.append(f"- {s}")
        else:
            final_lines.append(line)
    
    # 组合结果
    compressed = '\n'.join(final_lines)
    
    # 如果还是太长，进一步压缩
    compressed_chars = len(compressed)
    if compressed_chars > original_chars * TARGET_COMPRESSION_RATIO and aggressive:
        # 提取关键信息
        summary = extract_summary(text, max_lines=5)
        key_info = []
        
        # 保留代码块
        code_blocks = re.findall(r'```[\s\S]*?```', text)
        key_info.extend(code_blocks[:3])
        
        # 保留文件路径
        paths = re.findall(r'/[\w/-]+\.\w+', text)
        key_info.extend([f"路径: {p}" for p in paths[:5]])
        
        # 保留URL
        urls = re.findall(r'https?://\S+', text)
        key_info.extend([f"链接: {u}" for u in urls[:5]])
        
        compressed = f"## 摘要\n{summary}\n\n## 关键信息\n" + '\n'.join(key_info)
    
    compressed_tokens = count_tokens_estimate(compressed)
    compressed_chars = len(compressed)
    
    # 计算压缩率
    if original_tokens > 0:
        token_saving = (1 - compressed_tokens / original_tokens) * 100
    else:
        token_saving = 0
    
    return {
        'original': text,
        'compressed': compressed,
        'original_tokens': original_tokens,
        'compressed_tokens': compressed_tokens,
        'original_chars': original_chars,
        'compressed_chars': compressed_chars,
        'token_saving_percent': round(token_saving, 1),
        'char_saving_percent': round((1 - compressed_chars / original_chars) * 100, 1) if original_chars > 0 else 0,
    }


def format_result(result: dict, show_stats: bool = True) -> str:
    """格式化输出结果"""
    output = []
    
    if show_stats:
        output.append("📊 压缩统计:")
        output.append(f"  原始: {result['original_chars']:,} 字符 (~{result['original_tokens']:,} tokens)")
        output.append(f"  压缩: {result['compressed_chars']:,} 字符 (~{result['compressed_tokens']:,} tokens)")
        output.append(f"  节省: {result['token_saving_percent']}% tokens, {result['char_saving_percent']}% 字符")
        output.append("")
        output.append("-" * 40)
        output.append("")
    
    output.append(result['compressed'])
    
    return '\n'.join(output)


def compress_file(input_path: str, output_path: str = None, aggressive: bool = False) -> dict:
    """压缩文件"""
    input_file = Path(input_path)
    
    if not input_file.exists():
        raise FileNotFoundError(f"文件不存在: {input_path}")
    
    text = input_file.read_text(encoding='utf-8')
    result = compress_text(text, aggressive=aggressive)
    
    if output_path:
        output_file = Path(output_path)
    else:
        output_file = input_file.with_suffix('.compressed.md')
    
    output_file.write_text(result['compressed'], encoding='utf-8')
    result['output_file'] = str(output_file)
    
    return result


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='上下文压缩工具')
    parser.add_argument('input', help='输入文件路径 (使用 - 从stdin读取)')
    parser.add_argument('output', nargs='?', help='输出文件路径 (可选)')
    parser.add_argument('-a', '--aggressive', action='store_true', help='使用激进压缩')
    parser.add_argument('-s', '--stats-only', action='store_true', help='只显示统计信息')
    parser.add_argument('-q', '--quiet', action='store_true', help='安静模式，只输出压缩结果')
    
    args = parser.parse_args()
    
    # 读取输入
    if args.input == '-':
        text = sys.stdin.read()
        result = compress_text(text, aggressive=args.aggressive)
        
        if args.quiet:
            print(result['compressed'])
        elif args.stats_only:
            print(f"原始: {result['original_chars']:,} 字符 (~{result['original_tokens']:,} tokens)")
            print(f"压缩: {result['compressed_chars']:,} 字符 (~{result['compressed_tokens']:,} tokens)")
            print(f"节省: {result['token_saving_percent']}% tokens")
        else:
            print(format_result(result))
    else:
        try:
            result = compress_file(args.input, args.output, aggressive=args.aggressive)
            
            if not args.quiet:
                print(f"✅ 压缩完成!")
                print(f"  原始: {result['original_chars']:,} 字符 (~{result['original_tokens']:,} tokens)")
                print(f"  压缩: {result['compressed_chars']:,} 字符 (~{result['compressed_tokens']:,} tokens)")
                print(f"  节省: {result['token_saving_percent']}% tokens")
                print(f"  输出: {result['output_file']}")
            else:
                print(result['compressed'])
                
        except FileNotFoundError as e:
            print(f"❌ {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
