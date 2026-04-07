# -*- coding: utf-8 -*-
"""
四种记忆系统
四种记忆类型:
1. User Memory - 用户角色、专长、风格
2. Feedback Memory - 纠正确认记录
3. Project Memory - 项目级决策、截止日期
4. Reference Memory - 外部资源指针
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, Dict, List


class BaseMemory:
    """记忆基类"""
    
    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    def _load(self) -> Dict:
        """加载记忆"""
        if self.storage_path.exists():
            with open(self.storage_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _save(self, data: Dict) -> None:
        """保存记忆"""
        with open(self.storage_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取值"""
        data = self._load()
        return data.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """设置值"""
        data = self._load()
        data[key] = value
        self._save(data)
    
    def delete(self, key: str) -> None:
        """删除值"""
        data = self._load()
        data.pop(key, None)
        self._save(data)
    
    def list_keys(self) -> List[str]:
        """列出所有键"""
        data = self._load()
        return list(data.keys())


class UserMemory(BaseMemory):
    """用户记忆 - 个性化服务"""
    
    def __init__(self, base_path: str, user_id: str):
        self.user_id = user_id
        super().__init__(f"{base_path}/user_{user_id}.json")
    
    def get_profile(self) -> Dict:
        """获取用户档案"""
        return self.get('profile', {})
    
    def set_profile(self, profile: Dict) -> None:
        """设置用户档案"""
        self.set('profile', profile)
    
    def get_preferences(self) -> Dict:
        """获取偏好设置"""
        return self.get('preferences', {})
    
    def set_preferences(self, preferences: Dict) -> None:
        """设置偏好设置"""
        self.set('preferences', preferences)
    
    def get_service_history(self) -> List[Dict]:
        """获取服务历史"""
        return self.get('service_history', [])
    
    def add_service_record(self, service_type: str, result: str) -> None:
        """添加服务记录"""
        history = self.get_service_history()
        history.append({
            'type': service_type,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        self.set('service_history', history[-100:])  # 保留最近100条


class FeedbackMemory(BaseMemory):
    """反馈记忆 - 方法优化"""
    
    def __init__(self, base_path: str, user_id: str):
        self.user_id = user_id
        super().__init__(f"{base_path}/feedback_{user_id}.json")
    
    def get_corrections(self) -> List[Dict]:
        """获取纠正记录"""
        return self.get('corrections', [])
    
    def add_correction(self, original: str, corrected: str, context: str = '') -> None:
        """添加纠正"""
        corrections = self.get_corrections()
        corrections.append({
            'original': original,
            'corrected': corrected,
            'context': context,
            'timestamp': datetime.now().isoformat()
        })
        self.set('corrections', corrections)
    
    def get_confirmations(self) -> List[Dict]:
        """获取确认记录"""
        return self.get('confirmations', [])
    
    def add_confirmation(self, action: str, approved: bool, reason: str = '') -> None:
        """添加确认记录"""
        confirmations = self.get_confirmations()
        confirmations.append({
            'action': action,
            'approved': approved,
            'reason': reason,
            'timestamp': datetime.now().isoformat()
        })
        self.set('confirmations', confirmations)
    
    def get_approval_pattern(self) -> Dict:
        """分析用户授权模式"""
        confirmations = self.get_confirmations()
        approved = [c for c in confirmations if c.get('approved')]
        denied = [c for c in confirmations if not c.get('approved')]
        
        return {
            'total': len(confirmations),
            'approved': len(approved),
            'denied': len(denied),
            'approval_rate': len(approved) / len(confirmations) if confirmations else 0
        }


class ProjectMemory(BaseMemory):
    """项目记忆 - 项目级上下文"""
    
    def __init__(self, base_path: str, project_id: str):
        self.project_id = project_id
        super().__init__(f"{base_path}/project_{project_id}.json")
    
    def get_decisions(self) -> List[Dict]:
        """获取决策记录"""
        return self.get('decisions', [])
    
    def add_decision(self, decision: str, reason: str = '') -> None:
        """添加决策"""
        decisions = self.get_decisions()
        decisions.append({
            'decision': decision,
            'reason': reason,
            'timestamp': datetime.now().isoformat()
        })
        self.set('decisions', decisions)
    
    def get_deadlines(self) -> List[Dict]:
        """获取截止日期"""
        return self.get('deadlines', [])
    
    def add_deadline(self, title: str, deadline: str, priority: str = 'normal') -> None:
        """添加截止日期"""
        deadlines = self.get_deadlines()
        deadlines.append({
            'title': title,
            'deadline': deadline,
            'priority': priority,
            'created': datetime.now().isoformat()
        })
        self.set('deadlines', deadlines)
    
    def get_context(self) -> Dict:
        """获取项目上下文"""
        return {
            'decisions': self.get_decisions(),
            'deadlines': self.get_deadlines(),
            'artifacts': self.get('artifacts', [])
        }
    
    def add_artifact(self, name: str, path: str, description: str = '') -> None:
        """添加产物"""
        artifacts = self.get('artifacts', [])
        artifacts.append({
            'name': name,
            'path': path,
            'description': description,
            'created': datetime.now().isoformat()
        })
        self.set('artifacts', artifacts)


class ReferenceMemory(BaseMemory):
    """外部记忆 - 知识链接"""
    
    def __init__(self, base_path: str, user_id: str):
        self.user_id = user_id
        super().__init__(f"{base_path}/reference_{user_id}.json")
    
    def get_documents(self) -> List[Dict]:
        """获取文档指针"""
        return self.get('documents', [])
    
    def add_document(self, title: str, url: str, doc_type: str = 'doc') -> None:
        """添加文档"""
        documents = self.get_documents()
        documents.append({
            'title': title,
            'url': url,
            'type': doc_type,
            'added': datetime.now().isoformat()
        })
        self.set('documents', documents)
    
    def get_api_links(self) -> List[Dict]:
        """获取API链接"""
        return self.get('api_links', [])
    
    def add_api_link(self, name: str, url: str, description: str = '') -> None:
        """添加API链接"""
        links = self.get_api_links()
        links.append({
            'name': name,
            'url': url,
            'description': description,
            'added': datetime.now().isoformat()
        })
        self.set('api_links', links)
    
    def search(self, keyword: str) -> List[Dict]:
        """搜索记忆"""
        results = []
        for doc in self.get_documents():
            if keyword.lower() in doc.get('title', '').lower():
                results.append(doc)
        for link in self.get_api_links():
            if keyword.lower() in link.get('name', '').lower():
                results.append(link)
        return results


class MemoryManager:
    """记忆管理器 - 统一接口"""
    
    def __init__(self, base_path: str, user_id: str, project_id: Optional[str] = None):
        self.base_path = base_path
        self.user_id = user_id
        self.project_id = project_id
        
        # 初始化四种记忆
        self.user = UserMemory(base_path, user_id)
        self.feedback = FeedbackMemory(base_path, user_id)
        self.project = ProjectMemory(base_path, project_id) if project_id else None
        self.reference = ReferenceMemory(base_path, user_id)
    
    def get_context(self) -> Dict:
        """获取完整上下文"""
        context = {
            'user_profile': self.user.get_profile(),
            'user_preferences': self.user.get_preferences(),
            'approval_pattern': self.feedback.get_approval_pattern(),
            'reference_documents': self.reference.get_documents()
        }
        
        if self.project:
            context['project'] = self.project.get_context()
        
        return context
    
    def save_context(self) -> None:
        """保存上下文 (各记忆自行持久化)"""
        pass  # 每次set自动保存


# 便捷函数
def get_memory_manager(user_id: str, project_id: Optional[str] = None) -> MemoryManager:
    """获取记忆管理器"""
    base_path = os.path.expanduser('~/.openclaw/ai-agent-service/memory')
    return MemoryManager(base_path, user_id, project_id)