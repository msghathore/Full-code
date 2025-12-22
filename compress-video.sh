#!/bin/bash

# Video compression script for hero-video.mp4
# Target: <3 MB, 1920x1080, H.264, 1.5 Mbps

INPUT="hero-video.mp4"
OUTPUT="optimized-hero-video.mp4"

echo "=== Video Compression Script ==="
echo "Checking FFmpeg installation..."

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null
then
    echo "FFmpeg not found. Installing..."

    # Detect OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            echo "Installing Homebrew first..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install ffmpeg
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y ffmpeg
        elif command -v yum &> /dev/null; then
            sudo yum install -y ffmpeg
        else
            echo "Please install FFmpeg manually: https://ffmpeg.org/download.html"
            exit 1
        fi
    else
        echo "Unsupported OS. Please install FFmpeg manually."
        exit 1
    fi
fi

echo "FFmpeg version: $(ffmpeg -version | head -n1)"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "Error: $INPUT not found in current directory"
    exit 1
fi

echo "Compressing $INPUT..."
echo "Target: 2-3 MB, 1920x1080, H.264, no audio"

# Two-pass encoding for optimal size/quality
# Pass 1: Analysis
ffmpeg -y -i "$INPUT" \
    -c:v libx264 \
    -b:v 1500k \
    -maxrate 1500k \
    -bufsize 3000k \
    -vf "scale='min(1920,iw)':min(1080,ih)':force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -preset slow \
    -profile:v high \
    -level 4.2 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -an \
    -pass 1 \
    -f mp4 /dev/null

# Pass 2: Encoding
ffmpeg -i "$INPUT" \
    -c:v libx264 \
    -b:v 1500k \
    -maxrate 1500k \
    -bufsize 3000k \
    -vf "scale='min(1920,iw)':min(1080,ih)':force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -preset slow \
    -profile:v high \
    -level 4.2 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -an \
    -pass 2 \
    "$OUTPUT"

# Cleanup pass files
rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree

if [ -f "$OUTPUT" ]; then
    ORIGINAL_SIZE=$(du -h "$INPUT" | cut -f1)
    COMPRESSED_SIZE=$(du -h "$OUTPUT" | cut -f1)

    echo "✅ Compression complete!"
    echo "Original: $ORIGINAL_SIZE"
    echo "Compressed: $COMPRESSED_SIZE"
    echo "Output: $OUTPUT"
else
    echo "❌ Compression failed"
    exit 1
fi
