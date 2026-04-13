import express from 'express';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { level, academicYear, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (level) query.level = level;
    if (academicYear) query.academicYear = academicYear;
    
    const skip = (page - 1) * limit;
    const total = await Class.countDocuments(query);
    const data = await Class.find(query).skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await Class.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/students', authenticate, async (req, res, next) => {
  try {
    const data = await Student.find({ classId: req.params.id });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, level, stream, academicYear } = req.body;
    
    const data = await Class.create({ name, level, stream, academicYear });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Class.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;