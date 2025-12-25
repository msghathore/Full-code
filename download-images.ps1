# Zavira Website - Auto Image Downloader
# This script downloads all professional stock photos for your website

Write-Host "🎨 Zavira Image Downloader" -ForegroundColor Cyan
Write-Host "Downloading professional photos from free sources..." -ForegroundColor Green
Write-Host ""

# Create images directory if it doesn't exist
$imagesDir = ".\public\images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir
}

# Function to download with progress
function Download-Image {
    param($Url, $Output, $Description)
    Write-Host "⬇️  Downloading: $Description" -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $Url -OutFile $Output -UseBasicParsing
        Write-Host "✅ Saved: $Output" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $Description - $_" -ForegroundColor Red
    }
}

Write-Host "📸 Phase 1: Service Category Images (Mobile Optimized 1:1)" -ForegroundColor Cyan
Write-Host ""

# SERVICE CATEGORY IMAGES (1024x1024 square for mobile)
# Using Picsum Photos (Lorem Picsum) - completely free, no attribution required

Download-Image `
    -Url "https://picsum.photos/1024/1024?random=hair" `
    -Output "$imagesDir\hair-service.jpg" `
    -Description "Hair Services"

Download-Image `
    -Url "https://picsum.photos/1024/1024?random=massage" `
    -Output "$imagesDir\massage-service.jpg" `
    -Description "Massage Services"

Download-Image `
    -Url "https://picsum.photos/1024/1024?random=nails" `
    -Output "$imagesDir\nails-service.jpg" `
    -Description "Nails Services"

Download-Image `
    -Url "https://picsum.photos/1024/1024?random=piercing" `
    -Output "$imagesDir\piercing-service.jpg" `
    -Description "Piercing Services"

Download-Image `
    -Url "https://picsum.photos/1024/1024?random=skin" `
    -Output "$imagesDir\skin-service.jpg" `
    -Description "Skin/Facial Services"

Download-Image `
    -Url "https://picsum.photos/1024/1024?random=tattoo" `
    -Output "$imagesDir\tattoo-service.jpg" `
    -Description "Tattoo Services"

Download-Image `
    -Url "https://picsum.photos/1024/1024?random=waxing" `
    -Output "$imagesDir\waxing-service.jpg" `
    -Description "Waxing Services"

Write-Host ""
Write-Host "📦 Phase 2: Product Images (1:1 Square)" -ForegroundColor Cyan
Write-Host ""

# PRODUCT IMAGES
for ($i = 1; $i -le 25; $i++) {
    Download-Image `
        -Url "https://picsum.photos/1024/1024?random=product$i" `
        -Output "$imagesDir\product-$i.jpg" `
        -Description "Product $i"
}

Write-Host ""
Write-Host "📝 Phase 3: Blog Images (16:9 Landscape)" -ForegroundColor Cyan
Write-Host ""

# BLOG IMAGES (1280x720 for headers)
for ($i = 1; $i -le 11; $i++) {
    Download-Image `
        -Url "https://picsum.photos/1280/720?random=blog$i" `
        -Output "$imagesDir\blog-$i.jpg" `
        -Description "Blog Post $i"
}

Write-Host ""
Write-Host "👥 Phase 4: Testimonial/Client Images (1:1 Square)" -ForegroundColor Cyan
Write-Host ""

# CLIENT/TESTIMONIAL IMAGES
for ($i = 1; $i -le 5; $i++) {
    Download-Image `
        -Url "https://picsum.photos/768/768?random=client$i" `
        -Output "$imagesDir\client-$i.jpg" `
        -Description "Client/Testimonial $i"
}

Write-Host ""
Write-Host "🎉 Download Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT NOTE:" -ForegroundColor Yellow
Write-Host "These are placeholder images from Lorem Picsum (free stock photos)."
Write-Host "For REAL professional salon photos, you should:"
Write-Host "1. Visit https://unsplash.com or https://www.pexels.com"
Write-Host "2. Search for: 'hair salon', 'massage therapy', 'nail art', etc."
Write-Host "3. Download high-quality photos manually"
Write-Host "4. Replace the files in .\public\images\"
Write-Host ""
Write-Host "Or use AI generation when GPU quota resets (in 22 hours)"
Write-Host ""
