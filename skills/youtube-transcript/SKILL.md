# YouTube Transcript Skill

获取 YouTube 视频字幕/transcript 的工具。

## 安装依赖

```bash
# 安装 yt-dlp (需要 Python + pip)
pip install --break-system-packages yt-dlp
```

## 使用方法

### 方法1: 使用 yt-dlp (推荐)

```bash
# 安装
pip install yt-dlp

# 获取英文字幕
yt-dlp --write-subs --write-auto-subs --sub-lang en --skip-download -o "/tmp/video" "https://www.youtube.com/watch?v=VIDEO_ID"

# 查看字幕文件
cat /tmp/video.en.vtt
```

### 方法2: 使用 Python 库

```bash
pip install pytube
```

```python
from pytube import YouTube
yt = YouTube('https://www.youtube.com/watch?v=qcUAU2uOLKY')
print(yt.captions['en'].generate_srt_captions())
```

### 方法3: 在线服务 (备用)

- https://youtubetranscript.com/?v=VIDEO_ID
- https://yewtu.be/watch?v=VIDEO_ID (Invidious)

## 快速命令

在 workspace 中运行:
```bash
./scripts/youtube-transcript.sh <video-id>
```

## 视频信息

当前视频: `qcUAU2uOLKY`
- 标题: Claude Code 泄露的，不只是源码，而是顶级 Agent 的整套产品骨架
- 需要手动获取字幕