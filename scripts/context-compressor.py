#!/usr/bin/env python3
"""
📦 OpenClaw Context Compressor
基于 Claude Code 五层上下文压缩架构

五层策略:
1. Micro Compact   - 清理旧工具输出
2. Auto Compact    - 接近上限时自动总结
3. Session Memory  - 提取关键信息到文件
4. Full Compact    - 压缩整个对话
5. PTL Truncation  - 丢弃最旧消息（最后手段）
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

WORKSPACE = Path.home() / ".openclaw" / "workspace"
MEMORY_DIR = WORKSPACE / "memory"


@dataclass
class TokenBudget:
    """Token 预算管理"""
    total: int = 200_000
    reserved_output: int = 20_000
    warning_threshold: float = 0.8  # 80%
    critical_threshold: float = 0.95  # 95%
    
    @property
    def effective_limit(self) -> int:
        return self.total - self.reserved_output
    
    def usage_level(self, current_tokens: int) -> float:
        return current_tokens / self.effective_limit
    
    def should_warn(self, current_tokens: int) -> bool:
        return self.usage_level(current_tokens) > self.warning_threshold
    
    def should_compact(self, current_tokens: int) -> bool:
        return self.usage_level(current_tokens) > self.critical_threshold


@dataclass
class CompactResult:
    """压缩结果"""
    strategy: str
    original_tokens: int
    compressed_tokens: int
    messages_removed: int
    summary: Optional[str] = None
    
    @property
    def savings(self) -> float:
        if self.original_tokens == 0:
            return 0
        return 1 - (self.compressed_tokens / self.original_tokens)
    
    def to_dict(self) -> dict:
        return {
            "strategy": self.strategy,
            "original_tokens": self.original_tokens,
            "compressed_tokens": self.compressed_tokens,
            "messages_removed": self.messages_removed,
            "savings": f"{self.savings:.1%}",
            "summary": self.summary,
        }


class ContextCompressor:
    """五层上下文压缩器"""
    
    def __init__(self, budget: Optional[TokenBudget] = None):
        self.budget = budget or TokenBudget()
        self.compaction_history: List[CompactResult] = []
    
    def estimate_tokens(self, messages: List[dict]) -> int:
        """估算消息的 token 数"""
        total = 0
        for msg in messages:
            content = msg.get('content', '')
            if isinstance(content, str):
                # 粗略估算: 1 token ≈ 4 字符
                total += len(content) // 4
            elif isinstance(content, list):
                for block in content:
                    if isinstance(block, dict):
                        total += len(str(block.get('text', ''))) // 4
        return total
    
    def layer1_micro_compact(self, messages: List[dict]) -> List[dict]:
        """
        Layer 1: Micro Compact
        清理旧的工具输出，保留最近 3 轮
        """
        if len(messages) <= 6:  # 3 轮 = 6 条消息
            return messages
        
        # 保留最近 3 轮
        recent = messages[-6:]
        older = messages[:-6]
        
        # 清理旧的工具输出
        cleaned = []
        for msg in older:
            if msg.get('role') == 'user':
                content = msg.get('content', '')
                if isinstance(content, list):
                    # 清空 tool_result 内容但保留结构
                    new_content = []
                    for block in content:
                        if block.get('type') == 'tool_result':
                            new_content.append({
                                'type': 'tool_result',
                                'tool_use_id': block.get('tool_use_id'),
                                'content': '[已清理]',
                                'is_error': block.get('is_error', False),
                            })
                        else:
                            new_content.append(block)
                    cleaned.append({**msg, 'content': new_content})
                else:
                    cleaned.append(msg)
            else:
                cleaned.append(msg)
        
        result = cleaned + recent
        
        self.compaction_history.append(CompactResult(
            strategy="micro",
            original_tokens=self.estimate_tokens(messages),
            compressed_tokens=self.estimate_tokens(result),
            messages_removed=len(messages) - len(result),
        ))
        
        return result
    
    def layer2_auto_compact(self, messages: List[dict], summary_fn=None) -> List[dict]:
        """
        Layer 2: Auto Compact
        接近上下文上限时，总结对话并保留最近 3 轮
        """
        current_tokens = self.estimate_tokens(messages)
        
        if not self.budget.should_compact(current_tokens):
            return messages
        
        # 保留最近 3 轮
        recent = messages[-6:] if len(messages) > 6 else messages
        older = messages[:-6] if len(messages) > 6 else []
        
        # 生成摘要
        summary = ""
        if summary_fn and older:
            summary = summary_fn(older)
        elif older:
            # 简单摘要: 提取关键信息
            summary = self._generate_simple_summary(older)
        
        # 构建压缩后的消息
        compacted = [
            {
                "role": "system",
                "content": f"[对话摘要]\n{summary}\n\n[以上是之前对话的摘要，下面是最近的对话]"
            }
        ] + recent
        
        result = CompactResult(
            strategy="auto",
            original_tokens=current_tokens,
            compressed_tokens=self.estimate_tokens(compacted),
            messages_removed=len(messages) - len(compacted),
            summary=summary,
        )
        self.compaction_history.append(result)
        
        return compacted
    
    def layer3_session_memory(self, messages: List[dict], memory_path: Optional[Path] = None) -> List[dict]:
        """
        Layer 3: Session Memory
        提取关键信息到文件，保留引用
        """
        if not memory_path:
            today = datetime.now().strftime('%Y-%m-%d')
            memory_path = MEMORY_DIR / f"{today}-session.md"
        
        # 提取关键信息
        key_decisions = self._extract_decisions(messages)
        key_facts = self._extract_facts(messages)
        
        # 保存到文件
        memory_path.parent.mkdir(parents=True, exist_ok=True)
        with open(memory_path, 'a', encoding='utf-8') as f:
            f.write(f"\n## 📝 会话记录 ({datetime.now().strftime('%H:%M')})\n")
            f.write("### 关键决策\n")
            for d in key_decisions:
                f.write(f"- {d}\n")
            f.write("### 关键事实\n")
            for f_ in key_facts:
                f.write(f"- {f_}\n")
        
        # 在消息中添加引用
        reference = {
            "role": "system",
            "content": f"[关键信息已保存到 {memory_path.name}]"
        }
        
        return [reference] + messages[-6:] if len(messages) > 6 else messages
    
    def layer4_full_compact(self, messages: List[dict], summary_fn=None) -> List[dict]:
        """
        Layer 4: Full Compact
        压缩整个对话为摘要，预算 50K tokens
        """
        current_tokens = self.estimate_tokens(messages)
        
        # 生成完整摘要
        if summary_fn:
            summary = summary_fn(messages)
        else:
            summary = self._generate_simple_summary(messages)
        
        # 压缩后的消息
        compacted = [
            {
                "role": "system",
                "content": f"[完整对话摘要]\n{summary}"
            }
        ]
        
        result = CompactResult(
            strategy="full",
            original_tokens=current_tokens,
            compressed_tokens=self.estimate_tokens(compacted),
            messages_removed=len(messages) - 1,
            summary=summary,
        )
        self.compaction_history.append(result)
        
        return compacted
    
    def layer5_ptl_truncation(self, messages: List[dict]) -> List[dict]:
        """
        Layer 5: PTL Truncation
        最后手段: 丢弃最旧的消息组
        """
        # 保留系统消息 + 最近 2 轮
        system_msgs = [m for m in messages if m.get('role') == 'system']
        non_system = [m for m in messages if m.get('role') != 'system']
        
        keep_count = min(4, len(non_system))  # 最多保留 2 轮
        result = system_msgs + non_system[-keep_count:]
        
        result_obj = CompactResult(
            strategy="ptl_truncation",
            original_tokens=self.estimate_tokens(messages),
            compressed_tokens=self.estimate_tokens(result),
            messages_removed=len(messages) - len(result),
        )
        self.compaction_history.append(result_obj)
        
        return result
    
    def _generate_simple_summary(self, messages: List[dict]) -> str:
        """生成简单摘要"""
        # 提取用户消息作为摘要基础
        user_msgs = [m for m in messages if m.get('role') == 'user']
        
        summary_parts = ["对话涉及以下主题:"]
        for msg in user_msgs[-5:]:  # 最近 5 条用户消息
            content = msg.get('content', '')
            if isinstance(content, str):
                # 截取前 100 字符
                summary_parts.append(f"- {content[:100]}...")
        
        return "\n".join(summary_parts)
    
    def _extract_decisions(self, messages: List[dict]) -> List[str]:
        """提取关键决策"""
        decisions = []
        for msg in messages:
            content = msg.get('content', '')
            if isinstance(content, str):
                # 查找决策关键词
                keywords = ['决定', '选择', '确认', '采用', 'decided', 'chosen']
                for kw in keywords:
                    if kw in content.lower():
                        # 提取包含关键词的句子
                        for sentence in content.split('。'):
                            if kw in sentence.lower():
                                decisions.append(sentence.strip()[:200])
                                break
        return decisions[:10]  # 最多 10 条
    
    def _extract_facts(self, messages: List[dict]) -> List[str]:
        """提取关键事实"""
        facts = []
        for msg in messages:
            content = msg.get('content', '')
            if isinstance(content, str):
                # 查找事实关键词
                keywords = ['是', '等于', '包含', '位于', 'is:', '=', 'contains']
                for kw in keywords:
                    if kw in content:
                        for sentence in content.split('。'):
                            if kw in sentence and len(sentence) < 200:
                                facts.append(sentence.strip())
                                break
        return facts[:10]  # 最多 10 条
    
    def smart_compact(self, messages: List[dict], summary_fn=None) -> List[dict]:
        """
        智能压缩: 自动选择合适的压缩策略
        """
        current_tokens = self.estimate_tokens(messages)
        usage = self.budget.usage_level(current_tokens)
        
        if usage < 0.5:
            # 50% 以下: 不需要压缩
            return messages
        elif usage < 0.7:
            # 50-70%: Micro Compact
            return self.layer1_micro_compact(messages)
        elif usage < 0.85:
            # 70-85%: Auto Compact
            return self.layer2_auto_compact(messages, summary_fn)
        elif usage < 0.95:
            # 85-95%: Session Memory
            return self.layer3_session_memory(messages)
        else:
            # 95%+: Full Compact
            return self.layer4_full_compact(messages, summary_fn)


def main():
    """命令行测试"""
    import argparse
    
    parser = argparse.ArgumentParser(description='OpenClaw Context Compressor')
    parser.add_argument('--test', action='store_true', help='运行测试')
    parser.add_argument('--tokens', type=int, default=100000, help='模拟 token 数')
    
    args = parser.parse_args()
    
    if args.test:
        # 创建测试消息
        messages = [
            {"role": "user", "content": f"测试消息 {i} " * 50}
            for i in range(100)
        ]
        
        compressor = ContextCompressor()
        original_tokens = compressor.estimate_tokens(messages)
        print(f"原始 tokens: {original_tokens:,}")
        
        # 测试各层压缩
        print("\n📊 压缩测试:")
        
        result = compressor.layer1_micro_compact(messages.copy())
        print(f"  Layer 1 (Micro): {compressor.estimate_tokens(result):,} tokens")
        
        result = compressor.layer2_auto_compact(messages.copy())
        print(f"  Layer 2 (Auto): {compressor.estimate_tokens(result):,} tokens")
        
        result = compressor.layer4_full_compact(messages.copy())
        print(f"  Layer 4 (Full): {compressor.estimate_tokens(result):,} tokens")
        
        result = compressor.layer5_ptl_truncation(messages.copy())
        print(f"  Layer 5 (PTL): {compressor.estimate_tokens(result):,} tokens")


if __name__ == '__main__':
    main()
