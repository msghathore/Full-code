const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Banner dimensions in inches (converted to points for PDF)
const BANNER_WIDTH_INCHES = 195;
const BANNER_HEIGHT_INCHES = 25;
const PDF_POINTS_PER_INCH = 72;
const BANNER_WIDTH = BANNER_WIDTH_INCHES * PDF_POINTS_PER_INCH; // 14040 points
const BANNER_HEIGHT = BANNER_HEIGHT_INCHES * PDF_POINTS_PER_INCH; // 1800 points

// Input and output paths
const inputImagePath = path.join(__dirname, 'supabase/Zavira Board Logo (2).png');
const outputPdfPath = path.join(__dirname, 'Zavira-Shop-Banner.pdf');

async function generateBanner() {
    try {
        console.log('Starting banner generation...');
        
        // Read and process the image
        console.log('Reading and processing image...');
        
        // First, get the original image dimensions
        const imageInfo = await sharp(inputImagePath).metadata();
        console.log(`Original image dimensions: ${imageInfo.width}x${imageInfo.height}`);
        
        // Convert banner dimensions to pixels (assuming 300 DPI for print quality)
        const DPI = 300;
        const targetWidthPixels = Math.round(BANNER_WIDTH_INCHES * DPI);
        const targetHeightPixels = Math.round(BANNER_HEIGHT_INCHES * DPI);
        
        console.log(`Target dimensions: ${targetWidthPixels}x${targetHeightPixels} pixels`);
        
        // Resize the image maintaining aspect ratio and fit within banner dimensions
        const resizedImageBuffer = await sharp(inputImagePath)
            .resize(targetWidthPixels, targetHeightPixels, {
                fit: 'inside',
                withoutEnlargement: false,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toBuffer();
        
        console.log('Image resized successfully');
        
        // Create PDF document
        const doc = new PDFDocument({
            size: [BANNER_WIDTH, BANNER_HEIGHT],
            margin: 0
        });
        
        // Create write stream
        const writeStream = fs.createWriteStream(outputPdfPath);
        doc.pipe(writeStream);
        
        // Calculate positioning to center the image
        const imgInfo = await sharp(resizedImageBuffer).metadata();
        const imgWidth = imgInfo.width;
        const imgHeight = imgInfo.height;
        
        const x = (BANNER_WIDTH - imgWidth) / 2;
        const y = (BANNER_HEIGHT - imgHeight) / 2;
        
        console.log(`Positioning image at: (${x}, ${y})`);
        console.log(`Image will be placed at ${imgWidth}x${imgHeight} pixels`);
        
        // Add the resized image to the PDF
        doc.image(resizedImageBuffer, x, y, {
            width: imgWidth,
            height: imgHeight
        });
        
        // Finalize the PDF
        doc.end();
        
        // Wait for the file to be written
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        
        console.log(`PDF banner generated successfully: ${outputPdfPath}`);
        console.log(`Banner dimensions: ${BANNER_WIDTH_INCHES}" x ${BANNER_HEIGHT_INCHES}"`);
        console.log(`Final image dimensions: ${imgWidth}x${imgHeight} pixels at 300 DPI`);
        
        return outputPdfPath;
        
    } catch (error) {
        console.error('Error generating banner:', error);
        throw error;
    }
}

// Run the function
generateBanner()
    .then(() => {
        console.log('Banner generation completed successfully!');
    })
    .catch((error) => {
        console.error('Failed to generate banner:', error);
        process.exit(1);
    });