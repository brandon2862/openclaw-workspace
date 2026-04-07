# -*- coding: utf-8 -*-
"""
AI Agent Service - 统一服务入口
整合记忆系统、权限系统、Hooks系统
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from .memory import (
    MemoryManager, 
    UserMemory, 
    FeedbackMemory, 
    ProjectMemory, 
    ReferenceMemory,
    get_memory_manager
)
from .permissions import (
    PermissionManager,
    PermissionLevel,
    PermissionResult,
    PermissionError,
    get_permission_manager
)
from .hooks import (
    HookExecutor,
    HookType,
    HookContext,
    get_hook_executor,
    create_hook_config
)


class AIService:
    """AI Agent 服务"""
    
    def __init__(self, 
                 user_id: str,
                 project_id: Optional[str] = None,
                 permission_level: str = 'allow',
                 config_path: Optional[str] = None):
        self.user_id = user_id
        self.project_id = project_id
        
        # 初始化各系统
        base_path = os.path.expanduser('~/.openclaw/ai-agent-service')
        
        # 记忆系统
        self.memory = get_memory_manager(user_id, project_id)
        
        # 权限系统
        self.permissions = get_permission_manager(permission_level)
        
        # Hooks系统
        self.hooks = get_hook_executor(config_path)
    
    # ========== 记忆系统接口 ==========
    
    def get_user_profile(self) -> Dict:
        """获取用户档案"""
        return self.memory.user.get_profile()
    
    def set_user_profile(self, profile: Dict) -> None:
        """设置用户档案"""
        self.memory.user.set_profile(profile)
    
    def get_preferences(self) -> Dict:
        """获取偏好"""
        return self.memory.user.get_preferences()
    
    def set_preferences(self, preferences: Dict) -> None:
        """设置偏好"""
        self.memory.user.set_preferences(preferences)
    
    def add_feedback(self, original: str, corrected: str, context: str = '') -> None:
        """添加反馈"""
        self.memory.feedback.add_correction(original, corrected, context)
    
    def get_approval_pattern(self) -> Dict:
        """获取授权模式"""
        return self.memory.feedback.get_approval_pattern()
    
    def add_project_decision(self, decision: str, reason: str = '') -> None:
        """添加项目决策"""
        if self.memory.project:
            self.memory.project.add_decision(decision, reason)
    
    def add_project_deadline(self, title: str, deadline: str, priority: str = 'normal') -> None:
        """添加截止日期"""
        if self.memory.project:
            self.memory.project.add_deadline(title, deadline, priority)
    
    def add_reference(self, title: str, url: str, doc_type: str = 'doc') -> None:
        """添加外部文档"""
        self.memory.reference.add_document(title, url, doc_type)
    
    def search_reference(self, keyword: str) -> List[Dict]:
        """搜索外部文档"""
        return self.memory.reference.search(keyword)
    
    def get_full_context(self) -> Dict:
        """获取完整上下文"""
        return self.memory.get_context()
    
    # ========== 权限系统接口 ==========
    
    def check_permission(self, action: str, additional_context: Optional[str] = None) -> PermissionResult:
        """检查权限"""
        return self.permissions.check(action, self.user_id, additional_context)
    
    def approve_action(self, action: str, reason: str = '') -> None:
        """记录批准"""
        self.permissions.approve(self.user_id, action, reason)
    
    def deny_action(self, action: str, reason: str = '') -> None:
        """记录拒绝"""
        self.permissions.deny(self.user_id, action, reason)
    
    def get_user_approval_rate(self) -> float:
        """获取授权率"""
        return self.permissions.get_approval_rate(self.user_id)
    
    def set_permission_level(self, level: str) -> None:
        """设置权限级别"""
        level_map = {
            'bypass': PermissionLevel.BYPASS,
            'allow': PermissionLevel.ALLOW_EDITS,
            'auto': PermissionLevel.AUTO,
        }
        if level in level_map:
            self.permissions.set_level(level_map[level])
    
    # ========== Hooks系统接口 ==========
    
    def execute_pre_tool(self, tool_name: str, tool_input: Dict) -> bool:
        """执行工具前钩子"""
        allowed, messages = self.hooks.execute_pre_tool(tool_name, tool_input, self.user_id)
        if not allowed:
            raise PermissionError(f"Pre-tool hook blocked: {messages}")
        return True
    
    def execute_post_tool(self, tool_name: str, tool_output: str) -> bool:
        """执行工具后钩子"""
        allowed, messages = self.hooks.execute_post_tool(tool_name, tool_output, self.user_id)
        return allowed
    
    def on_session_start(self) -> bool:
        """会话开始"""
        return self.hooks.execute_session_start(self.user_id)
    
    def on_session_end(self) -> bool:
        """会话结束"""
        return self.hooks.execute_session_end(self.user_id)
    
    def add_python_hook(self, hook_type: str, func) -> None:
        """添加Python钩子"""
        type_map = {
            'pre-tool': HookType.PRE_TOOL,
            'post-tool': HookType.POST_TOOL,
            'prompt-submit': HookType.PROMPT_SUBMIT,
            'session-start': HookType.SESSION_START,
            'session-end': HookType.SESSION_END,
            'tool-error': HookType.TOOL_ERROR,
        }
        if hook_type in type_map:
            self.hooks.add_python_hook(type_map[hook_type], func)
    
    # ========== 组合功能 ==========
    
    def process_action(self, action: str, params: Optional[Dict] = None) -> Dict:
        """处理动作 - 整合检查"""
        params = params or {}
        
        # 1. 检查权限
        perm_result = self.check_permission(action, str(params))
        if not perm_result.allowed:
            if perm_result.requires_confirmation:
                return {
                    'status': 'confirmation_required',
                    'reason': perm_result.reason,
                    'action': action
                }
            return {
                'status': 'denied',
                'reason': perm_result.reason
            }
        
        # 2. 执行pre-hook
        try:
            self.execute_pre_tool(action, params)
        except PermissionError as e:
            return {
                'status': 'blocked',
                'reason': str(e)
            }
        
        # 3. 返回允许执行
        return {
            'status': 'allowed',
            'action': action,
            'params': params
        }
    
    def record_feedback(self, action: str, approved: bool, reason: str = '') -> None:
        """记录用户反馈"""
        if approved:
            self.approve_action(action, reason)
        else:
            self.deny_action(action, reason)
        
        # 同时记录到记忆
        self.memory.feedback.add_confirmation(action, approved, reason)


# 服务工厂
_services: Dict[str, AIService] = {}

def get_service(user_id: str, 
              project_id: Optional[str] = None,
              permission_level: str = 'allow',
              config_path: Optional[str] = None) -> AIService:
    """获取AI服务实例"""
    key = f"{user_id}:{project_id or 'default'}"
    if key not in _services:
        _services[key] = AIService(user_id, project_id, permission_level, config_path)
    return _services[key]


def create_default_config() -> Dict:
    """创建默认配置"""
    return {
        'service': {
            'name': 'AI Agent Service',
            'version': '1.0.0'
        },
        'permissions': {
            'default_level': 'allow',
            'dangerous_patterns': [
                'rm -rf',
                'drop table',
                'delete from'
            ]
        },
        'hooks': create_hook_config()['hooks'],
        'storage': {
            'base_path': '~/.openclaw/ai-agent-service'
        }
    }


# CLI入口
def main():
    """CLI入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AI Agent Service')
    parser.add_argument('command', choices=['init', 'check', 'context', 'config'])
    parser.add_argument('--user', default='default')
    parser.add_argument('--project')
    parser.add_argument('--level', default='allow')
    
    args = parser.parse_args()
    
    if args.command == 'init':
        service = get_service(args.user, args.project, args.level)
        print(f"Service initialized for {args.user}")
        
    elif args.command == 'check':
        import sys
        action = ' '.join(sys.argv[3:]) if len(sys.argv) > 3 else 'test action'
        service = get_service(args.user, args.project, args.level)
        result = service.check_permission(action)
        print(f"Allowed: {result.allowed}")
        print(f"Reason: {result.reason}")
        
    elif args.command == 'context':
        service = get_service(args.user, args.project, args.level)
        print(service.get_full_context())
        
    elif args.command == 'config':
        import json
        print(json.dumps(create_default_config(), indent=2))


if __name__ == '__main__':
    main()