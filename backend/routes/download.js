import express from 'express';
import CV from '../models/CV.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Download CV as text file
router.get('/:id/text', async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const content = cv.editedContent || cv.content;
    const fileName = cv.originalFileName.replace(/\.[^/.]+$/, '') + '_edited.txt';

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(content);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message || 'Failed to download CV' });
  }
});

// Download CV as HTML file
router.get('/:id/html', async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const content = cv.editedContent || cv.content;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${cv.originalFileName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  ${content.replace(/\n/g, '<br>')}
</body>
</html>`;

    const fileName = cv.originalFileName.replace(/\.[^/.]+$/, '') + '_edited.html';

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(htmlContent);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message || 'Failed to download CV' });
  }
});

export default router;

