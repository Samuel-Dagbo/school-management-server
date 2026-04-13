import express from 'express';
import Subject from '../models/Subject.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { classId, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (classId) query.classId = classId;
    
    const skip = (page - 1) * limit;
    const total = await Subject.countDocuments(query);
    const data = await Subject.find(query).populate('classId', 'name').skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await Subject.findById(req.params.id).populate('classId', 'name');
    if (!data) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, code, classId } = req.body;
    
    const data = await Subject.create({ name, code, classId });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Subject.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;