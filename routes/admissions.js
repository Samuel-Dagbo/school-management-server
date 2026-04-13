import express from 'express';
import Admission from '../models/Admission.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import bcrypt from 'bcryptjs';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', async (req, res, next) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, email, phone, address, appliedClass, parentName, parentPhone, previousSchool } = req.body;
    
    const data = await Admission.create({ firstName, lastName, gender, dateOfBirth, email, phone, address, appliedClass, parentName, parentPhone, previousSchool, status: 'pending' });
    res.status(201).json({ success: true, message: 'Application submitted successfully', data });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const total = await Admission.countDocuments(query);
    const data = await Admission.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const pending = await Admission.countDocuments({ status: 'pending' });
    const accepted = await Admission.countDocuments({ status: 'accepted' });
    const rejected = await Admission.countDocuments({ status: 'rejected' });
    
    res.json({ success: true, data: { pending, accepted, rejected } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Admission.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    const data = await Admission.findByIdAndUpdate(req.params.id, { status, notes }, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Application not found' });
    
    res.json({ success: true, message: `Application ${status}`, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Admission.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    next(error);
  }
});

// Enroll accepted student
router.post('/:id/enroll', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { classId } = req.body;
    const admission = await Admission.findById(req.params.id);
    
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    if (admission.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted applications can be enrolled' });
    }
    
    // Find class
    const classObj = await Class.findOne({ name: admission.appliedClass });
    if (!classObj) {
      return res.status(400).json({ success: false, message: 'Class not found' });
    }
    
    // Generate student ID
    const count = await Student.countDocuments() + 1;
    const studentId = `STU${count.toString().padStart(4, '0')}`;
    
    // Create user account
    const password = await bcrypt.hash('student123', 12);
    const email = `${admission.firstName.toLowerCase()}.${admission.lastName.toLowerCase()}@student.edu`;
    
    const user = await User.create({
      email,
      password,
      role: 'student',
      firstName: admission.firstName,
      lastName: admission.lastName,
      isActive: true,
      isVerified: true
    });
    
    // Create student
    const student = await Student.create({
      userId: user._id,
      studentId,
      firstName: admission.firstName,
      lastName: admission.lastName,
      gender: admission.gender,
      dateOfBirth: admission.dateOfBirth,
      classId: classObj._id,
      phone: admission.phone,
      address: admission.address,
      parentName: admission.parentName,
      parentPhone: admission.parentPhone
    });
    
    // Mark admission as enrolled
    admission.status = 'enrolled';
    await admission.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Student enrolled successfully',
      data: { studentId, email }
    });
  } catch (error) {
    next(error);
  }
});

export default router;