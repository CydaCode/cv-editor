import express from 'express';
import multer from 'multer';
import path from 'path';
import { parseFileFromBuffer } from '../services/fileParser.js';
import CV from '../models/CV.js';
import atsAnalyzer from '../services/atsAnalyzer.js';
import { uploadToS3 } from '../services/s3Client.js';

const router = express.Router();

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
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Upload CV endpoint
router.post('/', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
    const userId = req.body.userId || null;

    // Upload to S3
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const s3Key = `uploads/${uniqueSuffix}${path.extname(req.file.originalname)}`;
    const s3Result = await uploadToS3(fileBuffer, s3Key, req.file.mimetype);

    // Parse the file from buffer
    const parsedData = await parseFileFromBuffer(fileBuffer, fileType);
    const content = parsedData.text || '';

    // Create CV document
    const cv = new CV({
      userId,
      originalFileName: req.file.originalname,
      filePath: s3Result.key,
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

