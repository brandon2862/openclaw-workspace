# -*- coding: utf-8 -*-
"""
Hooks 自动化系统
支持的钩子:
- pre-tool: 工具执行前
- post-tool: 工具执行后
- prompt-submit: 提交前
- session-start: 会话开始
- session-end: 会话结束
"""

import os
import subprocess
import yaml
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime


class HookType(Enum):
    """钩子类型"""
    PRE_TOOL = "pre-tool"
    POST_TOOL = "post-tool"
    PROMPT_SUBMIT = "prompt-submit"
    SESSION_START = "session-start"
    SESSION_END = "session-end"
    TOOL_ERROR = "tool-error"


class ExitCodeAction(Enum):
    """退出码动作"""
    ALLOW = "allow"      # 允许继续
    BLOCK = "block"      # 阻止
    WARN = "warn"        # 警告但继续


@dataclass
class Hook:
    """钩子定义"""
    name: str
    enabled: bool = True
    action: str = ""           # 脚本路径或函数名
    exit_codes: Dict[int, str] = field(default_factory=dict)
    timeout: int = 30          # 超时秒数
    env: Dict[str, str] = field(default_factory=dict)
    
    def execute(self, context: Dict) -> Tuple[int, str, str]:
        """执行钩子"""
        if not self.enabled:
            return (0, "", "disabled")
        
        # 构建环境变量
        env = os.environ.copy()
        env.update(self.env)
        env.update({k: str(v) for k, v in context.items()})
        
        # 执行脚本
        try:
            result = subprocess.run(
                self.action,
                shell=True,
                input=context.get('input', ''),
                capture_output=True,
                timeout=self.timeout,
                env=env
            )
            return (result.returncode, result.stdout.decode('utf-8', errors='ignore'), 
                    result.stderr.decode('utf-8', errors='ignore'))
        except subprocess.TimeoutExpired:
            return (124, "", "timeout")
        except Exception as e:
            return (1, "", str(e))
    
    def should_continue(self, exit_code: int) -> ExitCodeAction:
        """根据退出码决定动作"""
        action = self.exit_codes.get(exit_code)
        if action == "block":
            return ExitCodeAction.BLOCK
        elif action == "warn":
            return ExitCodeAction.WARN
        return ExitCodeAction.ALLOW


@dataclass
class HookContext:
    """钩子上下文"""
    hook_type: HookType
    tool_name: Optional[str] = None
    tool_input: Optional[Dict] = None
    tool_output: Optional[str] = None
    user_id: str = "default"
    session_id: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """转字典"""
        return {
            'hook_type': self.hook_type.value,
            'tool_name': self.tool_name or '',
            'tool_input': str(self.tool_input) if self.tool_input else '',
            'tool_output': self.tool_output or '',
            'user_id': self.user_id,
            'session_id': self.session_id or '',
            'timestamp': self.timestamp,
            **{k: str(v) for k, v in self.metadata.items()}
        }


class HookExecutor:
    """钩子执行器"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.hooks: Dict[HookType, List[Hook]] = {
            hook_type: [] for hook_type in HookType
        }
        self._python_hooks: Dict[HookType, List[Callable]] = {
            hook_type: [] for hook_type in HookType
        }
        
        if config_path:
            self.load_config(config_path)
    
    def load_config(self, config_path: str) -> None:
        """从YAML加载配置"""
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        
        hooks_config = config.get('hooks', {})
        for hook_type in HookType:
            type_str = hook_type.value
            if type_str in hooks_config:
                for hook_data in hooks_config[type_str]:
                    hook = Hook(
                        name=hook_data.get('name', ''),
                        enabled=hook_data.get('enabled', True),
                        action=hook_data.get('action', ''),
                        exit_codes=hook_data.get('exit_codes', {}),
                        timeout=hook_data.get('timeout', 30),
                        env=hook_data.get('env', {})
                    )
                    self.hooks[hook_type].append(hook)
    
    def add_hook(self, hook_type: HookType, hook: Hook) -> None:
        """添加钩子"""
        self.hooks[hook_type].append(hook)
    
    def add_python_hook(self, hook_type: HookType, func: Callable) -> None:
        """添加Python函数钩子"""
        self._python_hooks[hook_type].append(func)
    
    def execute(self, hook_type: HookType, context: HookContext) -> Tuple[bool, List[str]]:
        """执行钩子"""
        messages = []
        
        # 执行Python钩子
        for func in self._python_hooks[hook_type]:
            try:
                result = func(context)
                if result is False:
                    messages.append(f"Python hook {func.__name__} returned False")
                    return False, messages
            except Exception as e:
                messages.append(f"Python hook error: {e}")
                # Python错误不阻止
        
        # 执行脚本钩子
        for hook in self.hooks[hook_type]:
            exit_code, stdout, stderr = hook.execute(context.to_dict())
            action = hook.should_continue(exit_code)
            
            if action == ExitCodeAction.BLOCK:
                messages.append(f"Hook {hook.name} blocked: {stderr or stdout}")
                return False, messages
            elif action == ExitCodeAction.WARN:
                messages.append(f"Hook {hook.name} warning: {stderr or stdout}")
        
        return True, messages
    
    def execute_pre_tool(self, tool_name: str, tool_input: Dict,
                       user_id: str = 'default') -> Tuple[bool, List[str]]:
        """执行工具前钩子"""
        context = HookContext(
            hook_type=HookType.PRE_TOOL,
            tool_name=tool_name,
            tool_input=tool_input,
            user_id=user_id
        )
        return self.execute(HookType.PRE_TOOL, context)
    
    def execute_post_tool(self, tool_name: str, tool_output: str,
                      user_id: str = 'default') -> Tuple[bool, List[str]]:
        """执行工具后钩子"""
        context = HookContext(
            hook_type=HookType.POST_TOOL,
            tool_name=tool_name,
            tool_output=tool_output,
            user_id=user_id
        )
        return self.execute(HookType.POST_TOOL, context)
    
    def execute_session_start(self, user_id: str) -> Tuple[bool, List[str]]:
        """执行会话开始钩子"""
        context = HookContext(
            hook_type=HookType.SESSION_START,
            user_id=user_id
        )
        return self.execute(HookType.SESSION_START, context)
    
    def execute_session_end(self, user_id: str) -> Tuple[bool, List[str]]:
        """执行会话结束钩子"""
        context = HookContext(
            hook_type=HookType.SESSION_END,
            user_id=user_id
        )
        return self.execute(HookType.SESSION_END, context)
    
    def execute_tool_error(self, tool_name: str, error: str,
                         user_id: str = 'default') -> Tuple[bool, List[str]]:
        """执行工具错误钩子"""
        context = HookContext(
            hook_type=HookType.TOOL_ERROR,
            tool_name=tool_name,
            tool_output=error,
            user_id=user_id
        )
        return self.execute(HookType.TOOL_ERROR, context)


# 内置钩子函数

def validate_params_hook(context: HookContext) -> bool:
    """参数验证钩子"""
    tool_input = context.tool_input
    if not tool_input:
        return True
    
    # 检查必要参数
    required = tool_input.get('required', [])
    for param in required:
        if param not in tool_input:
            print(f"Missing required parameter: {param}")
            return False
    
    return True


def log_action_hook(context: HookContext) -> bool:
    """日志记录钩子"""
    print(f"[{context.timestamp}] {context.hook_type.value}: {context.tool_name}")
    return True


def archive_output_hook(context: HookContext) -> bool:
    """自动归档钩子"""
    if context.tool_output and context.hook_type == HookType.POST_TOOL:
        # 这里可以添加归档逻辑
        output = context.tool_output[:1000]  # 截断
        print(f"Archive: {output}...")
    return True


# 便捷函数
_hook_executor: Optional[HookExecutor] = None

def get_hook_executor(config_path: Optional[str] = None) -> HookExecutor:
    """获取钩子执行器"""
    global _hook_executor
    if _hook_executor is None:
        _hook_executor = HookExecutor(config_path)
    return _hook_executor


def create_hook_config() -> Dict:
    """创建默认钩子配置"""
    return {
        'hooks': {
            'pre-tool': [
                {
                    'name': '参数验证',
                    'enabled': True,
                    'action': 'python -c "import sys; print(sys.stdin.read())"',
                    'exit_codes': {
                        0: 'allow',
                        1: 'warn',
                        2: 'block'
                    },
                    'timeout': 10
                }
            ],
            'post-tool': [
                {
                    'name': '自动归档',
                    'enabled': True,
                    'action': 'echo "archived"',
                    'exit_codes': {
                        0: 'allow',
                        other: 'warn'
                    },
                    'timeout': 10
                }
            ],
            'session-end': [
                {
                    'name': '检查点保存',
                    'enabled': True,
                    'action': 'echo "checkpoint saved"',
                    'exit_codes': {
                        0: 'allow'
                    },
                    'timeout': 30
                }
            ]
        }
    }