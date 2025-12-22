# Video compression script for hero-video.mp4
# Target: <3 MB, 1920x1080, H.264, 1.5 Mbps

$INPUT = "hero-video.mp4"
$OUTPUT = "optimized-hero-video.mp4"

Write-Host "=== Video Compression Script ===" -ForegroundColor Cyan
Write-Host "Checking FFmpeg installation..."

# Check if FFmpeg is installed
$ffmpegInstalled = Get-Command ffmpeg -ErrorAction SilentlyContinue

if (-not $ffmpegInstalled) {
    Write-Host "FFmpeg not found. Installing via Chocolatey..." -ForegroundColor Yellow

    # Check if Chocolatey is installed
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

    if (-not $chocoInstalled) {
        Write-Host "Installing Chocolatey first..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }

    Write-Host "Installing FFmpeg..." -ForegroundColor Yellow
    choco install ffmpeg -y

    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Verify FFmpeg
$ffmpegCheck = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegCheck) {
    Write-Host "ERROR: FFmpeg installation failed. Please install manually from https://ffmpeg.org/download.html" -ForegroundColor Red
    exit 1
}

Write-Host "FFmpeg found: $($ffmpegCheck.Source)" -ForegroundColor Green

# Check if input file exists
if (-not (Test-Path $INPUT)) {
    Write-Host "ERROR: $INPUT not found in current directory" -ForegroundColor Red
    exit 1
}

Write-Host "Compressing $INPUT..." -ForegroundColor Cyan
Write-Host "Target: 2-3 MB, 1920x1080, H.264, no audio" -ForegroundColor Cyan

# Two-pass encoding for optimal size/quality
Write-Host "`nPass 1/2: Analyzing video..." -ForegroundColor Yellow
& ffmpeg -y -i $INPUT `
    -c:v libx264 `
    -b:v 1500k `
    -maxrate 1500k `
    -bufsize 3000k `
    -vf "scale='min(1920,iw)':min(1080,ih)':force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" `
    -preset slow `
    -profile:v high `
    -level 4.2 `
    -pix_fmt yuv420p `
    -movflags +faststart `
    -an `
    -pass 1 `
    -f mp4 NUL

Write-Host "Pass 2/2: Encoding video..." -ForegroundColor Yellow
& ffmpeg -i $INPUT `
    -c:v libx264 `
    -b:v 1500k `
    -maxrate 1500k `
    -bufsize 3000k `
    -vf "scale='min(1920,iw)':min(1080,ih)':force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" `
    -preset slow `
    -profile:v high `
    -level 4.2 `
    -pix_fmt yuv420p `
    -movflags +faststart `
    -an `
    -pass 2 `
    $OUTPUT

# Cleanup pass files
Remove-Item -Path "ffmpeg2pass-0.log" -ErrorAction SilentlyContinue
Remove-Item -Path "ffmpeg2pass-0.log.mbtree" -ErrorAction SilentlyContinue

if (Test-Path $OUTPUT) {
    $originalSize = (Get-Item $INPUT).Length / 1MB
    $compressedSize = (Get-Item $OUTPUT).Length / 1MB

    Write-Host "`n✅ Compression complete!" -ForegroundColor Green
    Write-Host "Original: $([math]::Round($originalSize, 2)) MB" -ForegroundColor White
    Write-Host "Compressed: $([math]::Round($compressedSize, 2)) MB" -ForegroundColor White
    Write-Host "Output: $OUTPUT" -ForegroundColor White
} else {
    Write-Host "`n❌ Compression failed" -ForegroundColor Red
    exit 1
}
