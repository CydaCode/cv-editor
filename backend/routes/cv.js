import express from 'express';
import CV from '../models/CV.js';
import atsAnalyzer from '../services/atsAnalyzer.js';

const router = express.Router();

// Get CV by ID
router.get('/:id', async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    res.json({
      success: true,
      cv: {
        id: cv._id,
        originalFileName: cv.originalFileName,
        content: cv.content,
        editedContent: cv.editedContent,
        atsAnalysis: cv.atsAnalysis,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt
      }
    });
  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve CV' });
  }
});

// Update CV content
router.put('/:id', async (req, res) => {
  try {
    const { editedContent } = req.body;

    if (!editedContent) {
      return res.status(400).json({ error: 'editedContent is required' });
    }

    const cv = await CV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    cv.editedContent = editedContent;
    await cv.save();

    res.json({
      success: true,
      cv: {
        id: cv._id,
        editedContent: cv.editedContent,
        updatedAt: cv.updatedAt
      }
    });
  } catch (error) {
    console.error('Update CV error:', error);
    res.status(500).json({ error: error.message || 'Failed to update CV' });
  }
});

// Analyze CV (re-analyze with current content)
router.post('/:id/analyze', async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // Use edited content if available, otherwise use original
    const contentToAnalyze = cv.editedContent || cv.content;
    
    // Perform ATS analysis
    const atsAnalysis = atsAnalyzer.analyze(contentToAnalyze);
    
    cv.atsAnalysis = {
      score: atsAnalysis.score,
      feedback: atsAnalysis.feedback,
      analyzedAt: new Date()
    };

    await cv.save();

    res.json({
      success: true,
      atsAnalysis: cv.atsAnalysis
    });
  } catch (error) {
    console.error('Analyze CV error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze CV' });
  }
});

// Get all CVs for a user (optional)
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const query = userId ? { userId } : {};
    
    const cvs = await CV.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      cvs: cvs.map(cv => ({
        id: cv._id,
        originalFileName: cv.originalFileName,
        atsAnalysis: cv.atsAnalysis,
        createdAt: cv.createdAt
      }))
    });
  } catch (error) {
    console.error('Get CVs error:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve CVs' });
  }
});

// Delete CV
router.delete('/:id', async (req, res) => {
  try {
    const cv = await CV.findByIdAndDelete(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // Optionally delete the file from filesystem
    // fs.unlink(cv.filePath, (err) => { ... });

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete CV' });
  }
});

export default router;

