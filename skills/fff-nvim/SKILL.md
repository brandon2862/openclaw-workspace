---
name: fff-nvim
description: |
  fff.nvim - AI Agent最快的文件搜索工具，带记忆功能。
  适用于：AI agent文件搜索优化、Neovim fuzzy picker、提升代码查找效率。
  触发：当需要快速搜索文件、fuzzy search、grep代码时。
---

# fff.nvim - 超快模糊文件搜索

## 概述

FFF = Freakin Fast Fuzzy file finder

- **类型:** Neovim 插件 + AI Agent MCP工具
- **语言:** Rust (高性能)
- **特点:** 
  - 内置记忆功能（frecency + history）
  - 智能排序（git状态、文件大小、定义匹配）
  - 容错搜索（typo-resistant）
- **要求:** Neovim 0.10.0+

## 核心功能

| 功能 | 描述 |
|------|------|
| `find_files` | Fuzzy文件搜索 |
| `live_grep` | 实时grep搜索 |
| `glob` | 文件名glob匹配 |
| `multigrep` | 多文件grep |

## 智能排序算法

FFF 会根据以下因素自动排序搜索结果：

1. **Frecency** - 最近打开的文件优先
2. **Git状态** - 已修改的 > 未跟踪的 > 忽略的
3. **文件大小** - 小文件优先
4. **定义匹配** - 包含函数/类定义的优先
5. **History Combo** - 重复搜索同一关键词的文件优先

## 安装

### AI Agent MCP安装（推荐）

```bash
curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh | bash
```

安装后，在你的Agent配置文件（如CLAUDE.md）中添加：

```
# CLAUDE.md
For any file search or grep in the current git indexed directory use fff tools
```

### Neovim插件安装

**使用 lazy.nvim:**

```lua
{
  'dmtrKovalenko/fff.nvim',
  build = function()
    require("fff.download").download_or_build_binary()
  end,
  opts = {
    debug = {
      enabled = true,
      show_scores = true,
    },
  },
  lazy = false,
  keys = {
    { "ff", function() require('fff').find_files() end, desc = 'Find files' },
    { "fg", function() require('fff').live_grep() end, desc = 'Live grep' },
    { "fz", function() require('fff').live_grep({ grep = { modes = { 'fuzzy', 'plain' } } }) end, desc = 'Fuzzy grep' },
    { "fc", function() require('fff').live_grep({ query = vim.fn.expand("<cword>") }) end, desc = 'Search current word' },
  },
}
```

**使用 vim.pack:**

```vim
vim.pack.add({ 'https://github.com/dmtrKovalenko/fff.nvim' })
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `ff` | 打开文件搜索 |
| `fg` | 打开live grep |
| `fz` | Fuzzy grep |
| `fc` | 搜索当前光标下的词 |
| `Esc` | 关闭 |
| `Enter` | 打开文件 |
| `Tab` | 多选 |
| `Ctrl+q` | 发送到quickfix |

## 完整配置

```lua
require('fff').setup({
  base_path = vim.fn.getcwd(),
  prompt = '🪿 ',
  title = 'FFFiles',
  max_results = 100,
  max_threads = 4,
  lazy_sync = true,
  
  layout = {
    height = 0.8,
    width = 0.8,
    preview_position = 'right',
    preview_size = 0.5,
  },
  
  preview = {
    enabled = true,
    max_size = 10 * 1024 * 1024, -- 10MB
    chunk_size = 8192,
  },
  
  frecency = {
    enabled = true,
    db_path = vim.fn.stdpath('cache') .. '/fff_nvim',
  },
  
  history = {
    enabled = true,
    db_path = vim.fn.stdpath('data') .. '/fff_queries',
    min_combo_count = 3,
    combo_boost_score_multiplier = 100,
  },
  
  grep = {
    max_file_size = 10 * 1024 * 1024,
    max_matches_per_file = 100,
    smart_case = true,
    time_budget_ms = 150,
    modes = { 'plain', 'regex', 'fuzzy' },
  },
})
```

## MCP工具使用

安装MCP后，AI Agent可以直接调用：

- `fff_find_files` - 搜索文件
- `fff_live_grep` - grep搜索
- `fff_glob` - glob匹配

## 性能

- 支持 100k+ 文件目录
- 8GB 仓库无压力
- 搜索延迟 < 150ms
- Token节省：减少roundtrip和读取无关文件

## 对比传统工具

| 特性 | fff.nvim | traditional |
|------|----------|-------------|
| 搜索速度 | <150ms | 1-3s |
| 记忆功能 | ✅ frecency | ❌ |
| 智能排序 | ✅ 多因素 | ❌ |
| 容错 | ✅ typo-resistant | ❌ |
| AI优化 | ✅ MCP集成 | ❌ |