#!/bin/bash
# Video Subtitle Generator - 视频字幕生成器
# 用法: ./add-subtitles.sh input.mp4 output.mp4 [whisper-api-key]
# 注意: 需要 OpenAI API key 来生成字幕 (可选)

INPUT=$1
OUTPUT=$2
API_KEY=${3:-""}

if [ -z "$API_KEY" ]; then
  echo "⚠️ 未提供 OpenAI API key，跳过自动字幕生成"
  echo "   如需自动字幕，请: ./add-subtitles.sh input.mp4 output.mp4 YOUR_API_KEY"
  cp "$INPUT" "$OUTPUT"
  exit 0
fi

# 提取音频
AUDIO_DIR=$(mktemp -d)
ffmpeg -i "$INPUT" -vn -acodec libmp3lame -y "$AUDIO_DIR/audio.mp3" 2>/dev/null

# 调用 Whisper API
echo "🎤 正在转写音频..."
RESPONSE=$(curl -s -X POST "https://api.openai.com/v1/audio/transcriptions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@$AUDIO_DIR/audio.mp3" \
  -F "model=whisper-1" \
  -F "response_format=srt")

echo "$RESPONSE" > "$AUDIO_DIR/subtitles.srt"

# 烧录字幕到视频
ffmpeg -i "$INPUT" -vf "subtitles=$AUDIO_DIR/subtitles.srt:force_style='FontSize=20,PrimaryColour=&HFFFFFF,BackColour=&H80000000,BorderStyle=3'" \
       -c:v libx264 -preset fast -crf 22 -c:a copy "$OUTPUT" -y 2>/dev/null

rm -rf "$AUDIO_DIR"

echo "✅ 字幕添加完成!"