import express from 'express';
import Session from '../models/Session.js';
import Term from '../models/Term.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await Session.find().sort({ startDate: -1 });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req, res, next) => {
  try {
    const data = await Session.findOne({ isActive: true }).populate('terms');
    if (!data) return res.status(404).json({ success: false, message: 'No active session' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await Session.findById(req.params.id).populate('terms');
    if (!data) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    
    const data = await Session.create({ name, startDate, endDate, isActive: isActive || false });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Session.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/terms', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, termNumber, startDate, endDate } = req.body;
    const sessionId = req.params.id;
    
    const data = await Term.create({ name, sessionId, termNumber, startDate, endDate });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/terms/:id', async (req, res, next) => {
  try {
    const data = await Term.findById(req.params.id).populate('sessionId', 'name');
    if (!data) return res.status(404).json({ success: false, message: 'Term not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/terms/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Term.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Term not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;