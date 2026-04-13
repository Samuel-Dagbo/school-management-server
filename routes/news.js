import express from 'express';
import News from '../models/News.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = {};
    
    if (category) query.category = category;
    
    const skip = (page - 1) * limit;
    const total = await News.countDocuments(query);
    const data = await News.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/latest', async (req, res, next) => {
  try {
    const data = await News.find().sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const data = await News.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'News not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { title, content, summary, category, imageUrl, isPublished } = req.body;
    
    const data = await News.create({ title, content, summary, category, imageUrl, isPublished: isPublished ?? true, createdBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'News not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await News.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'News not found' });
    res.json({ success: true, message: 'News deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;