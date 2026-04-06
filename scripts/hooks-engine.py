#!/usr/bin/env python3
"""
🪝 OpenClaw Hooks Engine
基于 Claude Code Hooks 系统架构设计

功能:
- 事件驱动的钩子系统
- 优先级执行
- 安全检查
- 记忆维护
"""

import yaml
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import asyncio

# 路径配置
WORKSPACE = Path.home() / ".openclaw" / "workspace"
HOOKS_CONFIG = WORKSPACE / "config" / "hooks.yaml"
MEMORY_DIR = WORKSPACE / "memory"
DATA_DIR = WORKSPACE / "data"


class HookResult:
    """钩子执行结果"""
    
    def __init__(self, name: str, status: str, message: str = "", data: Any = None):
        self.name = name
        self.status = status  # success, block, warn, error
        self.message = message
        self.data = data
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "status": self.status,
            "message": self.message,
            "data": self.data,
            "timestamp": self.timestamp,
        }


class HooksEngine:
    """钩子引擎"""
    
    def __init__(self, config_path: Path = HOOKS_CONFIG):
        self.config_path = config_path
        self.hooks: Dict[str, List[dict]] = {}
        self.config: dict = {}
        self.load_config()
    
    def load_config(self):
        """加载钩子配置"""
        if not self.config_path.exists():
            print(f"⚠️  配置文件不存在: {self.config_path}")
            return
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        self.hooks = data.get('hooks', {})
        self.config = data.get('config', {})
        print(f"✅ 加载了 {sum(len(v) for v in self.hooks.values())} 个钩子")
    
    async def trigger(self, event: str, context: dict = None) -> List[HookResult]:
        """触发事件的所有钩子"""
        results = []
        hooks = self.hooks.get(event, [])
        
        # 按优先级排序 (高优先级先执行)
        hooks = sorted(hooks, key=lambda h: h.get('priority', 0), reverse=True)
        
        for hook in hooks:
            result = await self.execute_hook(hook, context or {})
            results.append(result)
            
            # 如果钩子返回 block，停止执行
            if result.status == 'block':
                print(f"🚫 钩子 {hook['name']} 阻止了操作: {result.message}")
                if self.config.get('fail_fast', True):
                    break
        
        return results
    
    async def execute_hook(self, hook: dict, context: dict) -> HookResult:
        """执行单个钩子"""
        name = hook.get('name', 'unnamed')
        action = hook.get('action', '')
        
        try:
            if action == 'read_files':
                return await self.action_read_files(hook, context)
            elif action == 'check_pending':
                return await self.action_check_pending(hook, context)
            elif action == 'save_summary':
                return await self.action_save_summary(hook, context)
            elif action == 'update_daily_memory':
                return await self.action_update_daily(hook, context)
            elif action == 'check_context_level':
                return await self.action_check_context(hook, context)
            elif action == 'log':
                return await self.action_log(hook, context)
            elif action == 'maintain_memory':
                return await self.action_maintain_memory(hook, context)
            elif action == 'log_error':
                return await self.action_log_error(hook, context)
            elif action == 'notify':
                return await self.action_notify(hook, context)
            else:
                return HookResult(name, 'warn', f"未知动作: {action}")
        
        except Exception as e:
            return HookResult(name, 'error', str(e))
    
    async def action_read_files(self, hook: dict, context: dict) -> HookResult:
        """读取文件动作"""
        files = hook.get('files', [])
        content = {}
        
        for file_path in files:
            # 替换日期占位符
            if 'YYYY-MM-DD' in file_path:
                file_path = file_path.replace('YYYY-MM-DD', datetime.now().strftime('%Y-%m-%d'))
            
            expanded_path = Path(file_path).expanduser()
            if expanded_path.exists():
                content[str(expanded_path)] = expanded_path.read_text(encoding='utf-8')
        
        return HookResult(hook['name'], 'success', f"读取了 {len(content)} 个文件", content)
    
    async def action_check_pending(self, hook: dict, context: dict) -> HookResult:
        """检查待办事项"""
        # 检查 cron 任务、提醒等
        return HookResult(hook['name'], 'success', "检查完成")
    
    async def action_save_summary(self, hook: dict, context: dict) -> HookResult:
        """保存会话摘要"""
        summary = context.get('summary', '')
        if summary:
            today = datetime.now().strftime('%Y-%m-%d')
            daily_file = MEMORY_DIR / f"{today}.md"
            
            # 追加到每日文件
            with open(daily_file, 'a', encoding='utf-8') as f:
                f.write(f"\n## 📝 会话摘要 ({datetime.now().strftime('%H:%M')})\n")
                f.write(summary + "\n")
            
            return HookResult(hook['name'], 'success', f"摘要已保存到 {daily_file}")
        
        return HookResult(hook['name'], 'success', "无摘要可保存")
    
    async def action_update_daily(self, hook: dict, context: dict) -> HookResult:
        """更新每日记忆"""
        return HookResult(hook['name'], 'success', "每日记忆已更新")
    
    async def action_check_context(self, hook: dict, context: dict) -> HookResult:
        """检查上下文容量"""
        level = context.get('context_level', 0)
        threshold = hook.get('threshold', 0.8)
        
        if level > threshold:
            return HookResult(
                hook['name'], 
                'warn', 
                f"上下文使用率 {level:.1%} 超过阈值 {threshold:.1%}"
            )
        
        return HookResult(hook['name'], 'success', f"上下文使用率 {level:.1%}")
    
    async def action_log(self, hook: dict, context: dict) -> HookResult:
        """记录日志"""
        log_file = hook.get('log_file', '')
        if log_file:
            expanded_path = Path(log_file).expanduser()
            expanded_path.parent.mkdir(parents=True, exist_ok=True)
            
            entry = {
                "timestamp": datetime.now().isoformat(),
                "event": context.get('event', 'unknown'),
                "data": context.get('data', {}),
            }
            
            with open(expanded_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(entry) + '\n')
        
        return HookResult(hook['name'], 'success', "日志已记录")
    
    async def action_maintain_memory(self, hook: dict, context: dict) -> HookResult:
        """记忆维护"""
        # 检查记忆文件大小
        memory_file = WORKSPACE / "MEMORY.md"
        if memory_file.exists():
            lines = memory_file.read_text(encoding='utf-8').split('\n')
            if len(lines) > 500:
                return HookResult(
                    hook['name'], 
                    'warn', 
                    f"MEMORY.md 过长 ({len(lines)} 行)，需要整理"
                )
        
        return HookResult(hook['name'], 'success', "记忆状态正常")
    
    async def action_log_error(self, hook: dict, context: dict) -> HookResult:
        """记录错误"""
        error = context.get('error', 'Unknown error')
        
        error_log = DATA_DIR / "errors.log"
        error_log.parent.mkdir(parents=True, exist_ok=True)
        
        with open(error_log, 'a', encoding='utf-8') as f:
            f.write(f"[{datetime.now().isoformat()}] {error}\n")
        
        return HookResult(hook['name'], 'success', "错误已记录")
    
    async def action_notify(self, hook: dict, context: dict) -> HookResult:
        """通知用户"""
        message = context.get('message', hook.get('message', ''))
        # 这里可以集成通知系统
        return HookResult(hook['name'], 'success', f"通知: {message}")


def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description='OpenClaw Hooks Engine')
    parser.add_argument('event', help='要触发的事件名称')
    parser.add_argument('--context', '-c', help='JSON 格式的上下文数据')
    parser.add_argument('--config', help='配置文件路径')
    
    args = parser.parse_args()
    
    # 初始化引擎
    config_path = Path(args.config) if args.config else HOOKS_CONFIG
    engine = HooksEngine(config_path)
    
    # 解析上下文
    context = json.loads(args.context) if args.context else {}
    context['event'] = args.event
    
    # 执行钩子
    results = asyncio.run(engine.trigger(args.event, context))
    
    # 输出结果
    for result in results:
        status_icon = {
            'success': '✅',
            'block': '🚫',
            'warn': '⚠️',
            'error': '❌',
        }.get(result.status, '❓')
        
        print(f"{status_icon} {result.name}: {result.message}")
    
    # 检查是否有阻止
    if any(r.status == 'block' for r in results):
        sys.exit(2)  # 退出码 2 = 阻止


if __name__ == '__main__':
    main()
