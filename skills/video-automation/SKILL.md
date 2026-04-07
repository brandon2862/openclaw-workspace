# Video Automation Skill - 视频自动化能力

基于 OpenClaw + ffmpeg 的全自动视频剪裁能力

## 🎯 核心能力

### 1. 自动去静音 (Auto-Remove Silences)
```bash
ffmpeg -i input.mp4 \
  -af "silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-40dB" \
  -c:v copy output_no_silence.mp4
```

### 2. 自动生成字幕 (Auto-Generate Subtitles)
- 使用 Whisper API 转写音频为 SRT 字幕
- 烧录字幕到视频：
```bash
ffmpeg -i input.mp4 \
  -vf "subtitles=subtitles.srt:force_style='FontSize=24'" \
  -c:a copy output_subtitled.mp4
```

### 3. 平台尺寸自动调整 (Platform Resize)
- YouTube: 16:9 (1920x1080)
- TikTok/Shorts: 9:16 (1080x1920) - center crop
- Instagram: 1:1 (1080x1080)

### 4. 批量处理 (Batch Processing)
批量处理整个文件夹的视频

### 5. AI 视频生成 (ClawVid Pipeline)
完整 AI 生成视频工作流（需要 fal.ai API）

---

## 🎨 风格滤镜 (Style Filters)

预设 6 种风格，一键应用：

| 风格 | 说明 | 命令 |
|------|------|------|
| `warm` | 暖色调 - 适合发给妈妈 | `./video-style.sh input.mp4 output.mp4 warm` |
| `vintage` | 复古胶片感 | `./video-style.sh input.mp4 output.mp4 vintage` |
| `cinematic` | 电影感 - 高对比 | `./video-style.sh input.mp4 output.mp4 cinematic` |
| `fresh` | 小清新 - 明亮轻盈 | `./video-style.sh input.mp4 output.mp4 fresh` |
| `cyberpunk` | 赛博朋克 - 霓虹色 | `./video-style.sh input.mp4 output.mp4 cyberpunk` |
| `bw` | 黑白风格 | `./video-style.sh input.mp4 output.mp4 bw` |

---

## 🎬 片头片尾 (Intro/Outro)

自动添加固定片头片尾模板：
```bash
./add-intro-outro.sh input.mp4 output.mp4 [intro.mp4] [outro.mp4]
```

---

## 📦 批量处理 (Batch Processing)

一键批量处理文件夹：
```bash
./batch-process.sh ./raw ./processed
```

---

## 🔧 工具要求

- **必须**: ffmpeg (`brew install ffmpeg` 或 `sudo apt install ffmpeg`)
- **可选**: OpenAI API Key (Whisper 字幕)
- **可选**: fal.ai API (AI 生成)

---

## 📁 脚本文件

```
scripts/video/
├── video-style.sh        # 风格滤镜
├── add-intro-outro.sh    # 片头片尾
├── batch-process.sh      # 批量处理
├── add-subtitles.sh      # 字幕生成 (需要API key)
└── video-automation.sh   # 主自动化脚本
```

---

## 📝 使用示例

"帮我把视频转成复古风格"
"给视频加个片头 intro.mp4"
"批量处理 videos/raw/ 文件夹"

---
*Updated: 2026-04-07*
*Features: 6 style filters, intro/outro, batch processing, subtitles*