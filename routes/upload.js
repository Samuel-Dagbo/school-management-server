import express from 'express';
import { upload } from '../config/cloudinary.js';
import { authenticate, authorize } from '../middleware/auth.js';
import Gallery from '../models/Gallery.js';

const router = express.Router();

router.post('/image', authenticate, authorize('admin'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    res.json({
      success: true,
      data: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/gallery', authenticate, authorize('admin'), upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    const gallery = await Gallery.create({
      title,
      description,
      imageUrl: req.file.path,
      category,
      createdBy: req.user._id
    });
    
    res.status(201).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
});

export default router;