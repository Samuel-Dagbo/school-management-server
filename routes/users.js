import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const data = await User.find(query).select('-password').skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await User.findById(req.params.id).select('-password');
    if (!data) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const data = await User.create({ email, password: hashedPassword, role, firstName, lastName, isActive: true });
    res.status(201).json({ success: true, data: { ...data.toObject(), password: undefined } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { firstName, lastName, isActive } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (isActive !== undefined) updates.isActive = isActive;
    
    const data = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!data) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = await User.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;