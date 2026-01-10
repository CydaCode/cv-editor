import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseFile } from '../services/fileParser.js';
import CV from '../models/CV.js';
import atsAnalyzer from '../services/atsAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Upload CV endpoint
router.post('/', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
    const userId = req.body.userId || null;

    // Parse the file
    const parsedData = await parseFile(filePath, fileType);
    const content = parsedData.text || '';

    // Create CV document
    const cv = new CV({
      userId,
      originalFileName: req.file.originalname,
      filePath: filePath,
      fileType: fileType,
      content: content,
      editedContent: content
    });

    // Perform ATS analysis
    const atsAnalysis = atsAnalyzer.analyze(content);
    cv.atsAnalysis = {
      score: atsAnalysis.score,
      feedback: atsAnalysis.feedback,
      analyzedAt: new Date()
    };

    await cv.save();

    res.json({
      success: true,
      cv: {
        id: cv._id,
        originalFileName: cv.originalFileName,
        content: cv.content,
        editedContent: cv.editedContent,
        atsAnalysis: cv.atsAnalysis,
        createdAt: cv.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload and process CV' });
  }
});

export default router;

