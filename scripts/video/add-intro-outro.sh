#!/bin/bash
# Video Intro/Outro Adder - 片头片尾添加器
# 用法: ./add-intro-outro.sh input.mp4 output.mp4 [intro.mp4] [outro.mp4]

INPUT=$1
OUTPUT=$2
INTRO=${3:-""}
OUTRO=${4:-""}

WORKDIR=$(mktemp -d)
trap "rm -rf $WORKDIR" EXIT

# 复制输入视频
cp "$INPUT" "$WORKDIR/input.mp4"

# 获取输入时长
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1 "$INPUT")

# 准备文件列表
CONCAT_FILE="$WORKDIR/concat.txt"

> "$CONCAT_FILE"

# 添加片头
if [ -n "$INTRO" ] && [ -f "$INTRO" ]; then
  echo "file '$INTRO'" >> "$CONCAT_FILE"
fi

echo "file '$WORKDIR/input.mp4'" >> "$CONCAT_FILE"

# 添加片尾
if [ -n "$OUTRO" ] && [ -f "$OUTRO" ]; then
  echo "file '$OUTRO'" >> "$CONCAT_FILE"
fi

# 合并
ffmpeg -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$OUTPUT" -y 2>/dev/null

echo "✅ 片头片尾添加完成 (输入时长: ${DURATION}s)"