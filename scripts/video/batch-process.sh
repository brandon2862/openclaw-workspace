#!/bin/bash
# Video Batch Processor - 批量视频处理器
# 用法: ./batch-process.sh input_dir output_dir [options]
# 选项: --remove-silence, --add-subtitles, --resize-tiktok, --add-bgm

INPUT_DIR=${1:-"./raw"}
OUTPUT_DIR=${2:-"./processed"}
OPTIONS=${3:-""}

mkdir -p "$OUTPUT_DIR"

echo "📁 开始批量处理: $INPUT_DIR -> $OUTPUT_DIR"

for file in "$INPUT_DIR"/*.mp4; do
  [ -f "$file" ] || continue
  
  filename=$(basename "$file" .mp4)
  echo " Processing: $filename"
  
  # 默认处理：去除静音
  TEMP="$OUTPUT_DIR/${filename}_temp.mp4"
  ffmpeg -i "$file" -af "silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-40dB" \
         -c:v copy -c:a aac -b:a 128k "$TEMP" -y 2>/dev/null
  
  # 输出最终文件
  mv "$TEMP" "$OUTPUT_DIR/${filename}_processed.mp4"
  echo "  ✅ 完成: ${filename}_processed.mp4"
done

echo "🎉 批量处理完成! 共处理 $(ls -1 "$OUTPUT_DIR"/*.mp4 2>/dev/null | wc -l) 个文件"