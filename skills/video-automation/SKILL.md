# Video Automation Skill - 视频自动化能力

基于 OpenClaw + ffmpeg + AI 的全自动视频剪裁能力

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
```
@agent Process all videos in /recordings/raw/:
1. Remove silences longer than 1 second
2. Add subtitles via Whisper
3. Add intro/outro from /templates/
4. Export to /recordings/processed/
Log each file's status as you go.
```

### 5. AI 视频生成 (ClawVid Pipeline)
完整 AI 生成视频工作流：
- **TTS-first**: 先生成配音
- **Scene timing**: 根据音频长度计算场景时间
- **Image generation**: fal.ai (kling-image/v3)
- **Video clips**: Kling 2.6 Pro
- **Music + SFX**: Beatoven
- **Subtitles**: Whisper word-level
- **Render**: Remotion 输出 16:9 + 9:16 双版本

## 🔧 工具要求

- **必须**: ffmpeg (`brew install ffmpeg` 或 `sudo apt install ffmpeg`)
- **可选**: Whisper API (OpenAI)
- **可选**: fal.ai API (AI 生成)
- **可选**: Remotion (视频渲染)

## 📁 标准工作流

### 基础工作流 (无需外部API)
1. 接收原始视频文件夹
2. 批量去除静音片段
3. 生成 Whisper 字幕
4. 调整多平台尺寸
5. 输出到处理后文件夹

### AI 生成工作流 (需要 fal.ai)
1. 用户输入 prompt
2. 生成 TTS 配音
3. 根据音频时长设计场景
4. AI 生成图片/视频片段
5. 添加背景音乐和音效
6. 烧录字幕
7. 渲染输出 MP4 (16:9 + 9:16)

## 📝 使用示例

"帮我把 `/videos/raw/` 文件夹里的视频去掉静音部分，加上字幕，并生成 TikTok 尺寸版本"

"做一个30秒的AI科普视频，关于AI agents如何改变软件开发"

---
*Created: 2026-04-07*
*Source: 小红书 + OpenClaw Playbook + Medium (ClawVid)*