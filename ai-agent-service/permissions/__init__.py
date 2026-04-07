# -*- coding: utf-8 -*-
"""
权限分级系统 (三级)
- L1 Bypass: 无检查 (内部开发)
- L2 Allow Edits: 工作目录内 (常规任务)
- L3 Auto: LLM预测授权 (生产环境)
"""

import os
import re
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Tuple
from dataclasses import dataclass, field


class PermissionLevel(Enum):
    """权限级别"""
    BYPASS = "bypass"      # 无检查
    ALLOW_EDITS = "allow"  # 工作目录内
    AUTO = "auto"         # LLM预测


# 安全边界 - 高危操作列表
DANGEROUS_PATTERNS = [
    # 删除操作
    r'rm\s+-rf',
    r'rmdir',
    r'del\s+/[sq]',  # Windows
    r'rm\s+',
    # 危险命令
    r'drop\s+table',
    r'drop\s+database',
    r'truncate',
    r'delete\s+from',
    # 系统配置
    r'sudo',
    r'chmod\s+777',
    r'chown',
    # 外部发送
    r'send\s+email',
    r'sendmail',
    r'curl.*post',
    r'wget.*-O',
    # 支付
    r'payment',
    r'checkout',
    r'\$.*charge',
]

# 工作目录限制
ALLOWED_DIRECTORIES = [
    '~/.openclaw/workspace',
    '~/projects',
    '~/work',
]

# 受限目录
RESTRICTED_DIRECTORIES = [
    '~/.ssh',
    '~/.aws',
    '~/.gnupg',
    '/etc',
    '/root',
]


@dataclass
class PermissionResult:
    """权限检查结果"""
    allowed: bool
    level: PermissionLevel
    reason: str
    warning: Optional[str] = None
    requires_confirmation: bool = False


@dataclass
class UserHistory:
    """用户授权历史"""
    user_id: str
    approved_actions: int = 0
    denied_actions: int = 0
    history: List[Dict] = field(default_factory=list)
    
    def add_record(self, action: str, approved: bool, reason: str = '') -> None:
        """添加记录"""
        self.history.append({
            'action': action,
            'approved': approved,
            'reason': reason,
        })
        if approved:
            self.approved_actions += 1
        else:
            self.denied_actions += 1
        
        # 保留最近100条
        self.history = self.history[-100:]
    
    def get_approval_rate(self) -> float:
        """授权率"""
        total = self.approved_actions + self.denied_actions
        if total == 0:
            return 0.5  # 默认50%
        return self.approved_actions / total
    
    def get_recent_actions(self, n: int = 10) -> List[Dict]:
        """获取最近N条"""
        return self.history[-n:]


class PermissionChecker:
    """权限检查器"""
    
    def __init__(self, level: PermissionLevel = PermissionLevel.ALLOW_EDITS):
        self.level = level
        self.user_histories: Dict[str, UserHistory] = {}
        self.custom_rules: List[Callable] = []
    
    def get_user_history(self, user_id: str) -> UserHistory:
        """获取用户历史"""
        if user_id not in self.user_histories:
            self.user_histories[user_id] = UserHistory(user_id)
        return self.user_histories[user_id]
    
    def check_action(self, action: str, user_id: str = 'default', 
                  additional_context: Optional[str] = None) -> PermissionResult:
        """检查动作权限"""
        
        # L1 Bypass - 无条件允许
        if self.level == PermissionLevel.BYPASS:
            return PermissionResult(
                allowed=True,
                level=self.level,
                reason="Bypass mode - no check"
            )
        
        # 获取用户历史
        user_history = self.get_user_history(user_id)
        
        # 检查是否危险操作
        is_dangerous = self._is_dangerous_action(action)
        if is_d-dangerous:
            if self.level == PermissionLevel.ALLOW_EDITS:
                # L2 - 需要确认
                return PermissionResult(
                    allowed=False,
                    level=self.level,
                    reason="Dangerous action detected",
                    requires_confirmation=True
                )
            
            # L3 Auto - 用LLM预测
            return self._auto_check(action, user_history, additional_context)
        
        # 检查工作目录
        is_in_allowed_dir = self._is_in_allowed_directory(action)
        if not is_in_allowed_dir:
            if self.level == PermissionLevel.ALLOW_EDITS:
                return PermissionResult(
                    allowed=False,
                    level=self.level,
                    reason="Outside allowed directories",
                    requires_confirmation=True
                )
            
            # L3 检查
            return self._auto_check(action, user_history, additional_context)
        
        # 安全操作 - 允许
        return PermissionResult(
            allowed=True,
            level=self.level,
            reason="Safe action in allowed directory"
        )
    
    def _is_dangerous_action(self, action: str) -> bool:
        """检查是否危险操作"""
        action_lower = action.lower()
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, action_lower):
                return True
        return False
    
    def _is_in_allowed_directory(self, action: str) -> bool:
        """检查是否在工作目录"""
        for allowed_dir in ALLOWED_DIRECTORIES:
            expanded = os.path.expanduser(allowed_dir)
            if expanded in action:
                # 检查是否在受限目录
                for restricted in RESTRICTED_DIRECTORIES:
                    if restricted in action:
                        return False
                return True
        return False
    
    def _auto_check(self, action: str, user_history: UserHistory,
                 additional_context: Optional[str] = None) -> PermissionResult:
        """Auto模式 - LLM预测授权"""
        # 简化版：基于历史统计预测
        approval_rate = user_history.get_approval_rate()
        
        # 如果历史授权率高，且不是危险操作，允许
        if approval_rate > 0.8 and not self._is_dangerous_action(action):
            return PermissionResult(
                allowed=True,
                level=PermissionLevel.AUTO,
                reason=f"High approval rate: {approval_rate:.0%}"
            )
        
        # 需要确认
        return PermissionResult(
            allowed=False,
            level=PermissionLevel.AUTO,
            reason=f"Approval rate: {approval_rate:.0%}, requires confirmation",
            requires_confirmation=True
        )
    
    def record_decision(self, user_id: str, action: str, approved: bool,
                      reason: str = '') -> None:
        """记录用户决定"""
        user_history = self.get_user_history(user_id)
        user_history.add_record(action, approved, reason)
    
    def add_custom_rule(self, rule: Callable[[str], Tuple[bool, str]]) -> None:
        """添加自定义规则"""
        self.custom_rules.append(rule)
    
    def check_custom(self, action: str) -> Optional[PermissionResult]:
        """检查自定义规则"""
        for rule in self.custom_rules:
            allowed, reason = rule(action)
            if not allowed:
                return PermissionResult(
                    allowed=False,
                    level=self.level,
                    reason=reason
                )
        return None


class PermissionManager:
    """权限管理器 - 统一接口"""
    
    def __init__(self, level: PermissionLevel = PermissionLevel.ALLOW_EDITS):
        self.checker = PermissionChecker(level)
        self.level = level
    
    def check(self, action: str, user_id: str = 'default',
            additional_context: Optional[str] = None) -> PermissionResult:
        """检查权限"""
        # 先检查自定义规则
        custom_result = self.checker.check_custom(action)
        if custom_result:
            return custom_result
        
        return self.checker.check_action(action, user_id, additional_context)
    
    def approve(self, user_id: str, action: str, reason: str = '') -> None:
        """记录批准"""
        self.checker.record_decision(user_id, action, True, reason)
    
    def deny(self, user_id: str, action: str, reason: str = '') -> None:
        """记录拒绝"""
        self.checker.record_decision(user_id, action, False, reason)
    
    def get_approval_rate(self, user_id: str) -> float:
        """获取用户授权率"""
        return self.checker.get_user_history(user_id).get_approval_rate()
    
    def set_level(self, level: PermissionLevel) -> None:
        """设置权限级别"""
        self.level = level
        self.checker.level = level


# 便捷函数
_permissions = {}

def get_permission_manager(level: str = 'allow') -> PermissionManager:
    """获取权限管理器"""
    level_map = {
        'bypass': PermissionLevel.BYPASS,
        'allow': PermissionLevel.ALLOW_EDITS,
        'auto': PermissionLevel.AUTO,
    }
    level_enum = level_map.get(level, PermissionLevel.ALLOW_EDITS)
    return PermissionManager(level_enum)


# 安全检查装饰器
def requires_permission(level: PermissionLevel = PermissionLevel.ALLOW_EDITS):
    """权限检查装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            manager = get_permission_manager(level.value)
            action = f"{func.__name__}: {args} {kwargs}"
            result = manager.check(action)
            if not result.allowed and result.requires_confirmation:
                raise PermissionError(f"Permission required: {result.reason}")
            return func(*args, **kwargs)
        return wrapper
    return decorator


class PermissionError(Exception):
    """权限错误"""
    pass