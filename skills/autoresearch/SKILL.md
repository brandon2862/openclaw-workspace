# autoresearch - AI模型自动训练研究

让AI agent自主运行LLM训练实验，自动改进模型效果。

## 概述

**autoresearch** 是Karpathy开发的AI研究自动化框架。核心理念：
- 给定一个单GPU的LLM训练环境
- Agent自主修改代码、训练5分钟、检查结果、保留或丢弃、重复
- 早晨醒来查看实验日志和更好的模型

## 核心文件

```
autoresearch/
├── prepare.py    # 固定常量、数据准备、tokenizer、评估（不修改）
├── train.py    # 模型、优化器、训练循环（agent修改此文件）
├── program.md  # agent指令（人类迭代修改）
├── pyproject.toml
└── results.tsv # 实验结果日志
```

## 使用场景

- 运行 autonomous research mode
- 让agent帮你做LLM超参数实验
- 自动化模型架构探索

## 使用条件

- NVIDIA GPU (H100测试通过)
- Python 3.10+
- uv 包管理器

## 快速开始

```bash
# 1. 安装依赖
cd ~/autoresearch
uv sync

# 2. 数据准备（一次）
uv run prepare.py

# 3. 手动运行单次实验
uv run train.py
```

## 实验流程

### 1. Setup阶段

1. **商定run tag**: 基于日期 (如 `apr9`)
2. **创建分支**: `git checkout -b autoresearch/<tag>`
3. **读取in-scope文件**:
   - `README.md` — 仓库上下文
   - `prepare.py` — 固定常量（不修改）
   - `train.py` — 唯一可修改文件
4. **验证数据**: 检查 `~/.cache/autoresearch/` 有数据
5. **初始化results.tsv**: 创建表头

### 2. 实验循环

**固定5分钟时间预算**（不含启动/编译）：

- **可修改**: `train.py` 任何内容（架构、超参、优化器等）
- **不可修改**: `prepare.py`、依赖、评估函数
- **目标**: 最低 val_bpb（bits per byte，越低越好）

### 3. 关键指标

```
val_bpb: 0.997900          # 验证bits/byte，越低越好
training_seconds: 300.1    # 训练时间
peak_vram_mb: 45060.2     # 显存
mfu_percent: 39.80         # MFU利用率
total_tokens_M: 499.6       # 总token数
num_steps: 953             # 步数
num_params_M: 50.3        # 参数量
depth: 8                  # 层数
```

## 实验日志格式

TSV格式（tab分隔）：

```
commit	val_bpb	memory_gb	status	description
a1b2c3d	0.997900	44.0	keep	baseline
b2c3d4e	0.993200	44.2	keep	increase LR to 0.04
```

## 可调超参 (train.py)

```python
# 模型架构
ASPECT_RATIO = 64       # model_dim = depth * ASPECT_RATIO
HEAD_DIM = 128          # attention头维度
WINDOW_PATTERN = "SSSL" # 滑动窗口模式

# 优化
TOTAL_BATCH_SIZE = 2**19 # ~524K tokens/step
EMBEDDING_LR = 0.6      # embedding学习率
UNEMBEDDING_LR = 0.004  # lm_head学习率
MATRIX_LR = 0.04       # 矩阵参数学习率(Muon)
SCALAR_LR = 0.5        # 标量学习率

# 模型大小
DEPTH = 8               # transformer层数
DEVICE_BATCH_SIZE = 128 # 设备batch size
```

## 小显存平台建议

- 使用 TinyStories 数据集
- 降低 vocab_size (8192→4096→1024→256)
- 降低 MAX_SEQ_LEN
- 降低 DEPTH (8→4)
- 使用 WINDOW_PATTERN = "L"

## 典型实验想法

1. 调整学习率 (LR)
2. 调整模型深度/宽度
3. 尝试不同激活函数 (ReLU→GeLU→SwiGLU)
4. 调整batch size
5. 调整window pattern
6. 调整weight decay
7. 调整optimizer参数
8. 调整 warmup/warmdown 比例

## 判断标准

- **效果优先**: val_bpb降低
- **简单优先**: 同样效果下越简单越好
- **显存软约束**: 允许适度增加，禁止爆炸式增长

## 自动化运行

```bash
# 进入repo，启动agent（禁用权限）
cd ~/autoresearch
# 然后对agent说: "Hi have a look at program.md and let's kick off a new experiment!"

# 或手动运行多次实验
for i in {1..10}; do
    uv run train.py > run.log 2>&1
    # 记录结果
    grep "^val_bpb:" run.log
done
```

## 安装位置

- **工作目录**: `~/autoresearch` 或 `~/.openclaw/workspace/autoresearch`
- **数据缓存**: `~/.cache/autoresearch/`
- **结果日志**: `results.tsv`

## 相关项目

- [nanochat](https://github.com/karpathy/nanochat) - 完整实现
- [autoresearch-macos](https://github.com/miolini/autoresearch-macos)
- [autoresearch-mlx](https://github.com/trevin-creator/autoresearch-mlx)
- [autoresearch-win-rtx](https://github.com/jsegov/autoresearch-win-rtx)