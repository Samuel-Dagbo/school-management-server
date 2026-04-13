import express from 'express';
import Gallery from '../models/Gallery.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = {};
    
    if (category) query.category = category;
    
    const skip = (page - 1) * limit;
    const total = await Gallery.countDocuments(query);
    const data = await Gallery.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const data = await Gallery.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { title, description, imageUrl, category } = req.body;
    
    const data = await Gallery.create({ title, description, imageUrl, category, createdBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Gallery.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;