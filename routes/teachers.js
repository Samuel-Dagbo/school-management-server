import express from 'express';
import Teacher from '../models/Teacher.js';
import TeacherAssignment from '../models/TeacherAssignment.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const total = await Teacher.countDocuments(query);
    const data = await Teacher.find(query).skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await Teacher.findById(req.params.id).populate('userId', 'email firstName lastName');
    if (!data) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/assignments', authenticate, async (req, res, next) => {
  try {
    const data = await TeacherAssignment.find({ teacherId: req.params.id })
      .populate('subjectId', 'name code')
      .populate('classId', 'name');
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { userId, employeeId, firstName, lastName, gender, phone, address, qualification, specialties } = req.body;
    
    const data = await Teacher.create({ userId, employeeId, firstName, lastName, gender, phone, address, qualification, specialties });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates._id;
    
    const data = await Teacher.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Teacher not found' });
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const data = await Teacher.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/assignments', authorize('admin'), async (req, res, next) => {
  try {
    const { teacherId, subjectId, classId, sessionId } = req.body;
    
    const data = await TeacherAssignment.create({ teacherId, subjectId, classId, sessionId });
    const populated = await TeacherAssignment.findById(data._id)
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
});

router.get('/assignments/all', authorize('admin'), async (req, res, next) => {
  try {
    const data = await TeacherAssignment.find()
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName employeeId')
      .sort({ classId: 1 });
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/assignments/:id', authorize('admin'), async (req, res, next) => {
  try {
    const data = await TeacherAssignment.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    next(error);
  }
});

export default router;