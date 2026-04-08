#!/usr/bin/env python3
"""
🛡️ OpenClaw 工具权限执行器
基于 Claude Code 权限模型实现四级分类

Usage:
    python tool_permission.py check <tool_name> <user_id>
    python tool_permission.py list
    python tool_permission.py trust add <tool_name> <user_id>
    python tool_permission.py trust clear <user_id>
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# 配置路径
CONFIG_DIR = Path.home() / ".openclaw/workspace/config"
DATA_DIR = Path.home() / ".openclaw/workspace/data"
TRUST_FILE = DATA_DIR / "tool-trust.json"

# 权限等级定义
PERMISSION_LEVELS = {
    "L0": {
        "name": "Always",
        "description": "自动允许，无风险",
        "auto_allow": True,
        "tools": [
            "read", "glob", "grep", "web_search", "web_fetch",
            "memory_search", "memory_get", "image", "session_status",
            "cron_list", "nodes", "sessions_list", "sessions_history"
        ]
    },
    "L1": {
        "name": "First-Confirm",
        "description": "首次确认后自动允许",
        "auto_allow": False,
        "first_confirm": True,
        "tools": [
            "write", "edit", "task_create", "task_list", "task_get",
            "sessions_spawn", "sessions_send", "tts", "image_generate",
            "message", "cron", "subagents"
        ]
    },
    "L2": {
        "name": "Always-Confirm",
        "description": "每次都需确认",
        "auto_allow": False,
        "always_confirm": True,
        "tools": [
            "exec", "git_push", "git_force", "gateway", "browser",
            "process", "sessions_yield", "cron_add", "cron_remove"
        ]
    },
    "L3": {
        "name": "Block",
        "description": "阻止并警告",
        "auto_allow": False,
        "block": True,
        "tools": [
            "rm_rf_pattern", "drop_database", "system_reboot",
            "format_disk", "user_management"
        ]
    }
}

# 危险命令模式
DANGEROUS_PATTERNS = {
    "exec": [
        r"rm\s+-rf\s+/",           # 递归删除根目录
        r"rm\s+-rf\s+\.",          # 递归删除当前目录
        r"dd\s+if=",               # 磁盘写入
        r"mkfs",                   # 格式化
        r">\s*/dev/",              # 设备写入
        r"chmod\s+-R\s+777",       # 危险权限
        r"chown\s+-R",             # 危险所有权
        r"wget\|curl.*\|\s*bash", # 远程脚本执行
    ],
    "git": [
        r"git\s+push\s+--force",
        r"git\s+push\s+--delete",
        r"git\s+reset\s+--hard",
    ],
    "database": [
        r"DROP\s+TABLE",
        r"DELETE\s+FROM.*WHERE",
        r"TRUNCATE",
    ]
}


def load_trust_list():
    """加载信任列表"""
    if TRUST_FILE.exists():
        with open(TRUST_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_trust_list(trust_list):
    """保存信任列表"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(TRUST_FILE, 'w') as f:
        json.dump(trust_list, f, indent=2)


def get_tool_level(tool_name: str) -> str:
    """获取工具的权限等级"""
    tool_name = tool_name.lower()
    for level, info in PERMISSION_LEVELS.items():
        if tool_name in info.get("tools", []):
            return level
    return "L2"  # 默认需要确认


def check_permission(tool_name: str, args: str = "", user_id: str = "default") -> dict:
    """
    检查工具权限
    
    返回:
        {
            "allowed": bool,
            "level": str,
            "action": "allow" | "confirm" | "block",
            "reason": str,
            "requires_confirmation": bool
        }
    """
    level = get_tool_level(tool_name)
    level_info = PERMISSION_LEVELS[level]
    
    result = {
        "tool": tool_name,
        "level": level,
        "level_name": level_info["name"],
        "allowed": True,
        "action": "allow",
        "reason": "",
        "requires_confirmation": False
    }
    
    # L0: Always allow
    if level == "L0":
        return result
    
    # L3: Block
    if level == "L3":
        result.update({
            "allowed": False,
            "action": "block",
            "reason": "危险操作被阻止"
        })
        return result
    
    # 检查危险命令模式
    if tool_name == "exec" and args:
        for category, patterns in DANGEROUS_PATTERNS.items():
            import re
            for pattern in patterns:
                if re.search(pattern, args, re.IGNORECASE):
                    result.update({
                        "allowed": False,
                        "action": "block",
                        "reason": f"危险命令模式匹配: {category}"
                    })
                    return result
    
    # L1: First-Confirm
    if level == "L1":
        trust_list = load_trust_list()
        user_trust = trust_list.get(user_id, {})
        
        # 检查是否已信任
        if tool_name in user_trust.get("trusted_tools", []):
            result["reason"] = "已信任的工具"
            return result
        
        # 需要首次确认
        result.update({
            "requires_confirmation": True,
            "action": "confirm",
            "reason": "首次使用需要确认"
        })
        return result
    
    # L2: Always-Confirm
    if level == "L2":
        result.update({
            "requires_confirmation": True,
            "action": "confirm",
            "reason": "需要确认"
        })
        return result
    
    return result


def add_trust(tool_name: str, user_id: str = "default"):
    """添加工具到信任列表"""
    trust_list = load_trust_list()
    
    if user_id not in trust_list:
        trust_list[user_id] = {
            "trusted_tools": [],
            "trusted_at": {}
        }
    
    if tool_name not in trust_list[user_id]["trusted_tools"]:
        trust_list[user_id]["trusted_tools"].append(tool_name)
        trust_list[user_id]["trusted_at"][tool_name] = datetime.now().isoformat()
    
    save_trust_list(trust_list)
    print(f"✅ 已信任工具: {tool_name}")


def clear_trust(user_id: str = "default"):
    """清空信任列表"""
    trust_list = load_trust_list()
    if user_id in trust_list:
        del trust_list[user_id]
        save_trust_list(trust_list)
    print(f"✅ 已清空信任列表: {user_id}")


def list_permissions():
    """列出所有权限等级"""
    print("\n🛡️ OpenClaw 工具权限四级分类\n")
    
    for level, info in PERMISSION_LEVELS.items():
        print(f"**{level}: {info['name']}** - {info['description']}")
        print(f"   工具: {', '.join(info['tools'][:10])}{'...' if len(info['tools']) > 10 else ''}\n")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        list_permissions()
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "check":
        if len(sys.argv) < 3:
            print("Usage: tool_permission.py check <tool_name> [args]")
            sys.exit(1)
        tool_name = sys.argv[2]
        args = sys.argv[3] if len(sys.argv) > 3 else ""
        result = check_permission(tool_name, args)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif command == "list":
        list_permissions()
    
    elif command == "trust":
        if len(sys.argv) < 3:
            print("Usage: tool_permission.py trust add|clear <tool_name>")
            sys.exit(1)
        
        action = sys.argv[2]
        if action == "add":
            tool_name = sys.argv[3] if len(sys.argv) > 3 else ""
            if tool_name:
                add_trust(tool_name)
            else:
                print("Usage: tool_permission.py trust add <tool_name>")
        elif action == "clear":
            clear_trust()
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()