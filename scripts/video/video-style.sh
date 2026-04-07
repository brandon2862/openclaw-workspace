#!/bin/bash
# Video Style Filters - 风格滤镜预设
# 用法: ./video-style.sh input.mp4 output.mp4 [style]

STYLE=${3:-warm}

case $STYLE in
  warm)
    # 暖色调 - 妈妈喜欢
    ffmpeg -i "$1" -vf "eq=saturation=1.15:contrast=0.95:brightness=0.03:gamma=1.05" \
           -c:v libx264 -preset fast -crf 22 -c:a copy "$2" -y
    ;;
  vintage)
    # 复古风格 - 降低饱和度，偏黄
    ffmpeg -i "$1" -vf "eq=saturation=0.7:contrast=1.15:brightness=0.02:gamma=1.15,format=yuv420p" \
           -c:v libx264 -preset fast -crf 22 -c:a copy "$2" -y
    ;;
  cinematic)
    # 电影感
    ffmpeg -i "$1" -vf "eq=saturation=0.9:contrast=1.15:brightness=-0.02:gamma=1.1,unsharp=5:5:0.8:3:3:0.3" \
           -c:v libx264 -preset fast -crf 20 -c:a copy "$2" -y
    ;;
  fresh)
    # 小清新
    ffmpeg -i "$1" -vf "eq=saturation=1.1:contrast=0.9:brightness=0.05:gamma=0.95" \
           -c:v libx264 -preset fast -crf 22 -c:a copy "$2" -y
    ;;
  cyberpunk)
    # 赛博朋克
    ffmpeg -i "$1" -vf "hue=s=1.5:val=200,eq=saturation=1.3:contrast=1.2:gamma=1.15" \
           -c:v libx264 -preset fast -crf 22 -c:a copy "$2" -y
    ;;
  bw)
    # 黑白
    ffmpeg -i "$1" -vf "hue=s=0" -c:v libx264 -preset fast -crf 22 -c:a copy "$2" -y
    ;;
  *)
    echo "未知风格: $STYLE"
    echo "可用: warm, vintage, cinematic, fresh, cyberpunk, bw"
    exit 1
    ;;
esac

echo "✅ 风格应用完成: $STYLE"