#!/usr/bin/env python3
"""
🚀 OpenClaw Bootstrap Pipeline
基于 Claude Code 七阶段启动架构

七阶段:
1. Prefetch      - 缓存数据、项目扫描
2. Safety Checks - 安全检查、版本验证
3. Parse & Trust - 参数解析、信任验证
4. Setup         - 工具和命令并行加载
5. Deferred Init - 插件、技能延迟初始化
6. Mode Routing  - 模式路由（本地/远程）
7. Main Loop     - 进入主循环
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum

WORKSPACE = Path.home() / ".openclaw" / "workspace"


class StageStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    SKIPPED = "skipped"


@dataclass
class StageResult:
    """阶段执行结果"""
    name: str
    status: StageStatus
    duration_ms: int = 0
    message: str = ""
    data: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "status": self.status.value,
            "duration_ms": self.duration_ms,
            "message": self.message,
            "data": self.data,
        }


class BootstrapPipeline:
    """启动流水线"""
    
    def __init__(self, workspace: Path = WORKSPACE):
        self.workspace = workspace
        self.results: List[StageResult] = []
        self.context: Dict[str, Any] = {}
    
    async def run(self) -> bool:
        """运行完整启动流水线"""
        print("🚀 OpenClaw Bootstrap Pipeline 启动")
        print("=" * 50)
        
        stages = [
            ("1. Prefetch", self.stage_prefetch),
            ("2. Safety Checks", self.stage_safety_checks),
            ("3. Parse & Trust", self.stage_parse_trust),
            ("4. Setup", self.stage_setup),
            ("5. Deferred Init", self.stage_deferred_init),
            ("6. Mode Routing", self.stage_mode_routing),
            ("7. Main Loop Ready", self.stage_main_loop),
        ]
        
        for name, stage_fn in stages:
            print(f"\n⏳ {name}...")
            start = datetime.now()
            
            try:
                result = await stage_fn()
                result.duration_ms = int((datetime.now() - start).total_seconds() * 1000)
                
                status_icon = {
                    StageStatus.SUCCESS: "✅",
                    StageStatus.WARNING: "⚠️",
                    StageStatus.ERROR: "❌",
                    StageStatus.SKIPPED: "⏭️",
                }.get(result.status, "❓")
                
                print(f"{status_icon} {name}: {result.message} ({result.duration_ms}ms)")
                self.results.append(result)
                
                if result.status == StageStatus.ERROR:
                    print(f"\n❌ 启动失败: {name}")
                    return False
                    
            except Exception as e:
                print(f"❌ {name} 异常: {e}")
                self.results.append(StageResult(
                    name, StageStatus.ERROR, message=str(e)
                ))
                return False
        
        print("\n" + "=" * 50)
        print("✅ 启动完成!")
        self._print_summary()
        return True
    
    async def stage_prefetch(self) -> StageResult:
        """Stage 1: 预取数据"""
        data = {}
        
        # 扫描工作空间文件
        workspace_files = list(self.workspace.glob("**/*.md"))
        data["workspace_files"] = len(workspace_files)
        
        # 检查记忆文件
        memory_dir = self.workspace / "memory"
        if memory_dir.exists():
            memory_files = list(memory_dir.glob("*.md"))
            data["memory_files"] = len(memory_files)
        
        # 检查配置文件
        config_dir = self.workspace / "config"
        if config_dir.exists():
            config_files = list(config_dir.glob("*"))
            data["config_files"] = len(config_files)
        
        # 加载今日记忆
        today = datetime.now().strftime("%Y-%m-%d")
        today_file = memory_dir / f"{today}.md"
        if today_file.exists():
            data["today_memory"] = today_file.read_text(encoding="utf-8")[:500]
        
        self.context.update(data)
        
        return StageResult(
            "Prefetch",
            StageStatus.SUCCESS,
            message=f"扫描了 {len(workspace_files)} 个工作空间文件",
            data=data,
        )
    
    async def stage_safety_checks(self) -> StageResult:
        """Stage 2: 安全检查"""
        warnings = []
        
        # 检查敏感文件权限
        sensitive_files = [
            self.workspace / "config" / "model-pools.json",
        ]
        
        for file in sensitive_files:
            if file.exists():
                # 检查文件权限
                stat = file.stat()
                mode = oct(stat.st_mode)[-3:]
                if mode != "600" and mode != "644":
                    warnings.append(f"{file.name} 权限可能过宽: {mode}")
        
        # 检查是否有 API 密钥暴露
        env_vars = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "DEEPSEEK_API_KEY"]
        exposed = [k for k in env_vars if k in os.environ]
        
        if warnings:
            return StageResult(
                "Safety Checks",
                StageStatus.WARNING,
                message=f"发现 {len(warnings)} 个警告",
                data={"warnings": warnings, "exposed_keys": len(exposed)},
            )
        
        return StageResult(
            "Safety Checks",
            StageStatus.SUCCESS,
            message="安全检查通过",
            data={"exposed_keys": len(exposed)},
        )
    
    async def stage_parse_trust(self) -> StageResult:
        """Stage 3: 解析和信任验证"""
        # 检查工作空间完整性
        required_files = ["AGENTS.md", "SOUL.md", "USER.md", "MEMORY.md"]
        missing = []
        
        for file in required_files:
            if not (self.workspace / file).exists():
                missing.append(file)
        
        if missing:
            return StageResult(
                "Parse & Trust",
                StageStatus.WARNING,
                message=f"缺少 {len(missing)} 个标准文件",
                data={"missing": missing},
            )
        
        return StageResult(
            "Parse & Trust",
            StageStatus.SUCCESS,
            message="工作空间结构完整",
        )
    
    async def stage_setup(self) -> StageResult:
        """Stage 4: 并行加载工具和命令"""
        # 模拟并行加载
        tasks = [
            self._load_tools(),
            self._load_commands(),
            self._load_skills(),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        loaded = {
            "tools": results[0] if not isinstance(results[0], Exception) else 0,
            "commands": results[1] if not isinstance(results[1], Exception) else 0,
            "skills": results[2] if not isinstance(results[2], Exception) else 0,
        }
        
        self.context["loaded"] = loaded
        
        return StageResult(
            "Setup",
            StageStatus.SUCCESS,
            message=f"加载了 {sum(loaded.values())} 个组件",
            data=loaded,
        )
    
    async def stage_deferred_init(self) -> StageResult:
        """Stage 5: 延迟初始化"""
        # 检查插件
        plugins_dir = self.workspace / "plugins"
        plugins = list(plugins_dir.glob("*")) if plugins_dir.exists() else []
        
        # 检查定时任务
        cron_config = self.workspace / "config" / "hooks.yaml"
        has_hooks = cron_config.exists()
        
        return StageResult(
            "Deferred Init",
            StageStatus.SUCCESS,
            message=f"延迟初始化完成",
            data={
                "plugins": len(plugins),
                "hooks_config": has_hooks,
            },
        )
    
    async def stage_mode_routing(self) -> StageResult:
        """Stage 6: 模式路由"""
        # 检测运行模式
        mode = "local"
        
        if os.environ.get("OPENCLAW_REMOTE"):
            mode = "remote"
        elif os.environ.get("OPENCLAW_SSH"):
            mode = "ssh"
        
        self.context["mode"] = mode
        
        return StageResult(
            "Mode Routing",
            StageStatus.SUCCESS,
            message=f"运行模式: {mode}",
            data={"mode": mode},
        )
    
    async def stage_main_loop(self) -> StageResult:
        """Stage 7: 准备进入主循环"""
        # 最终上下文准备
        self.context["ready"] = True
        self.context["start_time"] = datetime.now().isoformat()
        
        return StageResult(
            "Main Loop Ready",
            StageStatus.SUCCESS,
            message="准备就绪，可以开始处理请求",
        )
    
    async def _load_tools(self) -> int:
        """加载工具"""
        await asyncio.sleep(0.1)  # 模拟加载
        return 10  # 返回加载的工具数
    
    async def _load_commands(self) -> int:
        """加载命令"""
        await asyncio.sleep(0.1)
        return 5
    
    async def _load_skills(self) -> int:
        """加载技能"""
        await asyncio.sleep(0.1)
        skills_dir = self.workspace / "skills"
        if skills_dir.exists():
            return len(list(skills_dir.glob("*/SKILL.md")))
        return 0
    
    def _print_summary(self):
        """打印启动摘要"""
        print("\n📊 启动摘要:")
        print(f"  总耗时: {sum(r.duration_ms for r in self.results)}ms")
        print(f"  阶段数: {len(self.results)}")
        print(f"  警告数: {sum(1 for r in self.results if r.status == StageStatus.WARNING)}")
        
        if "loaded" in self.context:
            loaded = self.context["loaded"]
            print(f"  工具: {loaded.get('tools', 0)}")
            print(f"  命令: {loaded.get('commands', 0)}")
            print(f"  技能: {loaded.get('skills', 0)}")


async def main():
    """命令行入口"""
    pipeline = BootstrapPipeline()
    success = await pipeline.run()
    
    if not success:
        sys.exit(1)
    
    # 输出 JSON 结果
    if "--json" in sys.argv:
        print("\n" + json.dumps({
            "status": "success",
            "results": [r.to_dict() for r in pipeline.results],
            "context": pipeline.context,
        }, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
