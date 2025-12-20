const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed!'));
    }
  }
});

// Careers application endpoint
app.post('/api/careers/apply', upload.single('resume'), async (req, res) => {
  try {
    console.log('Received career application submission');

    // Extract form data
    const {
      fullName,
      email,
      phone,
      position,
      experience,
      coverLetter
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !position) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if resume file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Create application data object
    const applicationData = {
      fullName,
      email,
      phone,
      position,
      experience: experience || 'Not specified',
      coverLetter: coverLetter || '',
      resume: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      },
      submittedAt: new Date().toISOString(),
      status: 'received'
    };

    // Log the application (in a real app, you'd save to database)
    console.log('New career application received:', {
      fullName: applicationData.fullName,
      email: applicationData.email,
      position: applicationData.position,
      resumeFile: applicationData.resume.originalName,
      submittedAt: applicationData.submittedAt
    });

    // In a production app, you would:
    // 1. Save to database (Supabase, MongoDB, etc.)
    // 2. Send confirmation email
    // 3. Send notification to HR team
    // 4. Store file in cloud storage (AWS S3, etc.)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully! We will review your application and get back to you soon.',
      applicationId: Date.now().toString(),
      data: {
        fullName: applicationData.fullName,
        position: applicationData.position,
        submittedAt: applicationData.submittedAt
      }
    });

  } catch (error) {
    console.error('Error processing career application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Zavira Backend API'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }

  if (error.message.includes('Only PDF, DOC, DOCX, and TXT files are allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Zavira Backend API running on port ${PORT}`);
  console.log(`📁 File uploads will be stored in: ${uploadsDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});