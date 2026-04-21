const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

router.post('/photo', protect, upload.single('photo'), (req, res) => {
  try {
    res.json({ 
      fileUrl: `/uploads/${req.file.filename}`,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/notice', protect, upload.single('file'), (req, res) => {
  try {
    res.json({ 
      fileUrl: `/uploads/${req.file.filename}`,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/timetable', protect, upload.single('file'), (req, res) => {
  try {
    res.json({ 
      fileUrl: `/uploads/${req.file.filename}`,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;