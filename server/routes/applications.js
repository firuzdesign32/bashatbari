const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../config/dataStore');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'resumes');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '-' + cleanFilename);
  }
});

// Multer File Type Validation Filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents (.doc, .docx) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// @route   POST api/applications
// @desc    Submit job application (public candidate application with resume upload)
// @access  Public
router.post('/', (req, res) => {
  upload.single('resume')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeded. Maximum limit is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Check required fields
    const { name, email, phone, jobId, coverLetter } = req.body;
    if (!name || !email || !phone || !jobId) {
      // Remove uploaded file if validation failed
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your resume / CV file' });
    }

    try {
      // Save application. The file path stored will be relative to public folder (e.g. /uploads/resumes/filename.pdf)
      const relativeResumePath = '/uploads/resumes/' + req.file.filename;

      const newApplication = await dataStore.createApplication({
        name,
        email,
        phone,
        coverLetter: coverLetter || '',
        resumePath: relativeResumePath,
        jobId: jobId
      });

      console.log(`💼 NEW JOB APPLICATION: Candidate "${name}" applied for Job ID: ${jobId}. Resume: ${relativeResumePath}`);

      res.json({ success: true, message: 'Application submitted successfully', application: newApplication });
    } catch (dbErr) {
      console.error('Database application creation error:', dbErr.message);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).send('Server Error');
    }
  });
});

// @route   GET api/applications
// @desc    Get all applications
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const applications = await dataStore.getAllApplications();
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
