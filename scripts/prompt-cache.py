#!/usr/bin/env python3
"""
🔄 OpenClaw 静态/动态提示分离系统
基于 Claude Code 的 prompt cache 优化

Usage:
    python prompt_cache.py build     # 构建静态提示缓存
    python prompt_cache.py show      # 显示当前缓存状态
    python prompt_cache.py invalidate # 失效缓存
"""

import json
import os
import sys
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# 路径配置
WORKSPACE = Path.home() / ".openclaw/workspace"
DATA_DIR = WORKSPACE / "data"
CACHE_DIR = DATA_DIR / "prompt-cache"
MANIFEST_FILE = CACHE_DIR / "manifest.json"

# 静态文件定义
STATIC_FILES = {
    "AGENTS.md": {
        "description": "工作规则和流程",
        "cache_key": "workspace_rules",
    },
    "SOUL.md": {
        "description": "人格定义",
        "cache_key": "agent_persona",
    },
    "USER.md": {
        "description": "用户基本信息",
        "cache_key": "user_basic",
    },
    "IDENTITY.md": {
        "description": "AI身份定义",
        "cache_key": "agent_identity",
    },
    "MEMORY.md": {
        "description": "长期记忆摘要",
        "cache_key": "longterm_memory",
    },
    "config/tool-permissions.yaml": {
        "description": "工具权限配置",
        "cache_key": "tool_permissions",
    },
}


def get_file_hash(filepath: Path) -> str:
    """计算文件hash"""
    if not filepath.exists():
        return "missing"
    return hashlib.md5(filepath.read_bytes()).hexdigest()[:8]


def build_static_cache() -> dict:
    """构建静态提示缓存"""
    print("🔄 构建静态提示缓存...")

    cache_data = {
        "version": "1.0",
        "generated_at": datetime.now().isoformat(),
        "static_parts": {},
        "total_size": 0,
    }

    for filename, info in STATIC_FILES.items():
        filepath = WORKSPACE / filename

        if not filepath.exists():
            print(f"  ⚠️ 跳过 (不存在): {filename}")
            continue

        content = filepath.read_text(encoding='utf-8', errors='ignore')
        file_hash = get_file_hash(filepath)

        cache_data["static_parts"][info["cache_key"]] = {
            "filename": filename,
            "description": info["description"],
            "content": content,
            "hash": file_hash,
            "size": len(content),
            "lines": len(content.split('\n')),
        }

        cache_data["total_size"] += len(content)

        print(f"  ✅ {filename}: {len(content)} chars, hash={file_hash}")

    # 保存缓存
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(cache_data, indent=2, ensure_ascii=False))

    print(f"\n✅ 缓存构建完成")
    print(f"  总大小: {cache_data['total_size']} chars")
    print(f"  文件数: {len(cache_data['static_parts'])}")

    return cache_data


def show_cache_status():
    """显示缓存状态"""
    if not MANIFEST_FILE.exists():
        print("❌ 缓存不存在，请先运行 build")
        return

    with open(MANIFEST_FILE, 'r') as f:
        cache_data = json.load(f)

    print(f"\n🔄 静态提示缓存状态")
    print(f"{'='*50}")
    print(f"版本: {cache_data['version']}")
    print(f"生成时间: {cache_data['generated_at']}")
    print(f"总大小: {cache_data['total_size']} chars")
    print(f"文件数: {len(cache_data['static_parts'])}")

    print(f"\n📦 缓存内容:")
    for key, info in cache_data['static_parts'].items():
        print(f"  • {info['description']}")
        print(f"    文件: {info['filename']}")
        print(f"    大小: {info['size']} chars, {info['lines']} lines")
        print(f"    Hash: {info['hash']}")

    # 检查文件变化
    print(f"\n🔍 文件变化检测:")
    for key, info in cache_data['static_parts'].items():
        filepath = WORKSPACE / info['filename']
        current_hash = get_file_hash(filepath)
        if current_hash != info['hash']:
            print(f"  ⚠️ {info['filename']} - 已修改")
        else:
            print(f"  ✅ {info['filename']} - 未变化")


def invalidate_cache():
    """失效缓存"""
    if MANIFEST_FILE.exists():
        MANIFEST_FILE.unlink()
        print("✅ 缓存已失效")

    # 清理缓存文件
    if CACHE_DIR.exists():
        for f in CACHE_DIR.glob("*.cache"):
            f.unlink()
        print("✅ 缓存文件已清理")


def generate_prompt_segments() -> dict:
    """生成提示片段（供集成使用）"""
    if not MANIFEST_FILE.exists():
        build_static_cache()

    with open(MANIFEST_FILE, 'r') as f:
        cache_data = json.load(f)

    # 静态部分
    static_parts = []
    for key, info in cache_data['static_parts'].items():
        static_parts.append({
            "type": "static",
            "key": key,
            "content": info['content'],
            "cached": True,
        })

    # 动态部分标记
    dynamic_marker = {
        "type": "dynamic_boundary",
        "content": "__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__",
    }

    return {
        "static": static_parts,
        "dynamic_marker": dynamic_marker,
        "estimated_savings": f"~{cache_data['total_size']} chars per request",
    }


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "build":
        build_static_cache()
    elif command == "show":
        show_cache_status()
    elif command == "invalidate":
        invalidate_cache()
    elif command == "segments":
        result = generate_prompt_segments()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()