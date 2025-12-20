#!/bin/bash
# Quick Deploy Script for Zavira Salon Website

echo "🚀 Starting deployment process..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo ""
    echo "🎯 Deployment options:"
    echo "1. Netlify - Drag 'dist' folder to https://netlify.com"
    echo "2. Vercel - Upload 'dist' folder to https://vercel.com"
    echo "3. GitHub Pages - Upload to GitHub repository"
    echo ""
    echo "📁 Your built files are ready in the 'dist' folder"
    echo "🌐 Drag the 'dist' folder to any of the hosting sites above"
    echo ""
    echo "✨ Your Zavira salon website will be live in minutes!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi