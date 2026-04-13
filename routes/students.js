import express from 'express';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'teacher'));

router.get('/', async (req, res, next) => {
  try {
    const { classId, search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (classId) query.classId = classId;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const total = await Student.countDocuments(query);
    const data = await Student.find(query).populate('classId', 'name').skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await Student.findById(req.params.id).populate('classId', 'name');
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { userId, studentId, firstName, lastName, gender, dateOfBirth, classId, phone, address, parentName, parentPhone } = req.body;
    
    const data = await Student.create({ userId, studentId, firstName, lastName, gender, dateOfBirth, classId, phone, address, parentName, parentPhone });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, classId, phone, address, parentName, parentPhone } = req.body;
    
    const data = await Student.findByIdAndUpdate(req.params.id, 
      { firstName, lastName, gender, dateOfBirth, classId, phone, address, parentName, parentPhone },
      { new: true }
    );
    
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/promote', authorize('admin'), async (req, res, next) => {
  try {
    const { newClassId } = req.body;
    
    const data = await Student.findByIdAndUpdate(req.params.id, { classId: newClassId }, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    
    res.json({ success: true, data, message: 'Student promoted successfully' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const data = await Student.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/class/:classId', async (req, res, next) => {
  try {
    const data = await Student.find({ classId: req.params.classId }).sort({ lastName: 1, firstName: 1 });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;