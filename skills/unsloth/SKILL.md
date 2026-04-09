---
name: unsloth
description: |
  Unsloth - 本地LLM训练与推理工具，大幅提升训练速度并降低显存占用。
  适用于：微调LLM、RL训练、Qwen/Gemma/Llama优化、本地AI部署。
  触发：当需要训练、微调、或在本地运行开源大模型时。
---

# Unsloth - 本地LLM训练与推理

## 概述

| 项目 | 说明 |
|------|------|
| **全称** | Unsloth Studio + Unsloth Core |
| **类型** | LLM训练/推理工具 |
| **官网** | https://unsloth.ai |
| **GitHub** | https://github.com/unslothai/unsloth |
| **许可证** | Apache 2.0 (核心) + AGPL-3.0 (Studio UI) |

## 核心理念

- **更快** - 训练速度提升 1.5-2x
- **更省** - 显存占用降低 50-80%
- **无损** - 训练效果与全精度一致
- **本地** - 完全离线，保护隐私

## 支持的模型

| 模型 | 加速 | 显存节省 |
|------|------|----------|
| **Gemma 4** | 1.5x | 50% |
| **Qwen3.5** | 1.5x | 60% |
| **gpt-oss** | 2x | 70% |
| **Llama 3.1/3.2** | 2x | 70% |
| **Mistral** | 1.5x | 60% |
| **DeepSeek** | 12x | 35% (MoE) |

## 核心功能

### 1. Unsloth Studio (Web UI)
- ✅ 搜索/下载/运行模型 (GGUF, LoRA, safetensors)
- ✅ 导出模型 (GGUF, 16-bit safetensors)
- ✅ Tool calling + Web search
- ✅ Code execution (在Claude artifacts中测试代码)
- ✅ 自动调优推理参数
- ✅ 支持图片/音频/PDF/DOCX聊天

### 2. 训练功能
- ✅ Full fine-tuning
- ✅ LoRA / QLoRA (4-bit/16-bit)
- ✅ RL/GRPO 训练
- ✅ Pretraining
- ✅ FP8 训练
- ✅ Multi-GPU 训练

### 3. 数据处理
- ✅ Data Recipes - 从PDF/CSV/DOCX自动创建数据集
- ✅ 可视化节点工作流编辑数据

### 4. 推理优化
- ✅ 自研Triton kernel
- ✅ 动态量化
- ✅ 128K超长上下文

## 安装

### Linux/macOS
```bash
curl -fsSL https://unsloth.ai/install.sh | sh

# 启动Studio
unsloth studio -H 0.0.0.0 -p 8888
```

### Windows
```powershell
irm https://unsloth.ai/install.ps1 | iex
unsloth studio -H 0.0.0.0 -p 8888
```

### Docker
```bash
docker run -d -e JUPYTER_PASSWORD="mypassword" \
 -p 8888:8888 -p 8000:8000 -p 2222:22 \
 -v $(pwd)/work:/workspace/work \
 --gpus all unsloth/unsloth
```

### Python (Unsloth Core)
```bash
# uv 环境
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv unsloth_env --python 3.13
source unsloth_env/bin/activate
uv pip install unsloth --torch-backend=auto
```

## 使用场景

### 场景1: 微调自己的AI助手
```python
from unsloth import FineTuner

trainer = FineTuner(
    model="Qwen/Qwen2.5-4B",
    dataset="your_data.jsonl",
    max_seq_length=2048,
)
trainer.train()
trainer.save_model("my-finetuned-model")
```

### 场景2: 用GRPO训练数学推理
```python
from unsloth importGRPOTrainer

trainer = GRPOTrainer(
    model="gpt-oss/20B",
    dataset="math_problems.jsonl",
    reward_function="correct_answer",
)
trainer.train()
```

### 场景3: 本地运行模型
```python
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    "unsloth/Llama-3.2-3B-Instruct",
    max_seq_length=2048,
)
FastLanguageModel.for_inference(model)
# 开始对话
```

## 性能对比

| 方法 | 速度 | 显存 (7B) | 精度 |
|------|------|-----------|------|
| 原始 BF16 | 1x | 14GB | 100% |
| **Unsloth 4-bit** | 2x | 6GB | ~99% |
| **Unsloth QLoRA** | 2x | 4GB | ~98% |
| LoRA+ | 1.3x | 8GB | ~99% |

## 对比其他工具

| 特性 | Unsloth | llama.cpp | LM Studio |
|------|---------|-----------|------------|
| 训练 | ✅ | ❌ | ❌ |
| GRPO/RL | ✅ | ❌ | ❌ |
| 4-bit训练 | ✅ | ❌ | ❌ |
| Web UI | ✅ | ❌ | ✅ |
| 纯推理 | ✅ | ✅ | ✅ |
| 免费 | ✅ | ✅ | ❌ |

## 创业应用

结合你的AI Agent创业：

1. **定制模型** - 用Unsloth微调一个专属于马来西亚市场的AI助手
2. **本地部署** - 不依赖API，保护数据隐私
3. **低成本** - 消费级GPU就能训练
4. **快速迭代** - 2x训练速度，更快验证想法

## 资源

- [文档](https://unsloth.ai/docs)
- [模型目录](https://unsloth.ai/docs/get-started/unsloth-model-catalog)
- [Notebooks](https://github.com/unslothai/notebooks)
- [Discord](https://discord.com/invite/unsloth)