import express from 'express';
import Result from '../models/Result.js';
import Student from '../models/Student.js';
import TeacherAssignment from '../models/TeacherAssignment.js';
import { authenticate, authorize, teacherAssignment, canAccessResults } from '../middleware/auth.js';
import { calculateGrade, calculateGPA } from '../utils/gradeCalculator.js';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { studentId, subjectId, termId, sessionId, classId, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (studentId) query.studentId = studentId;
    if (subjectId) query.subjectId = subjectId;
    if (termId) query.termId = termId;
    if (classId) query['studentId.classId'] = classId;
    
    const skip = (page - 1) * limit;
    const total = await Result.countDocuments(query);
    const data = await Result.find(query)
      .populate('studentId', 'firstName lastName studentId classId')
      .populate('subjectId', 'name code')
      .populate('termId', 'name')
      .skip(skip)
      .limit(Number(limit));
    
    res.json({ success: true, data, pagination: { page, limit, count: total } });
  } catch (error) {
    next(error);
  }
});

router.get('/student/:studentId', authenticate, async (req, res, next) => {
  try {
    const { termId, subjectId } = req.query;
    const query = { studentId: req.params.studentId };
    
    if (termId) query.termId = termId;
    if (subjectId) query.subjectId = subjectId;
    
    const data = await Result.find(query)
      .populate('subjectId', 'name code')
      .populate('termId', 'name sessionId');
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/my-class', authenticate, authorize('teacher'), async (req, res, next) => {
  try {
    const { classId, subjectId, termId } = req.query;
    const teacherId = req.user._id;
    
    const assignments = await TeacherAssignment.find({ teacherId });
    if (!assignments || assignments.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const classIds = assignments.map(a => a.classId);
    const subjectIds = assignments.map(a => a.subjectId);
    
    const query = {
      'studentId.classId': { $in: classIds },
      subjectId: { $in: subjectIds }
    };
    
    if (classId) query['studentId.classId'] = classId;
    if (subjectId) query.subjectId = subjectId;
    if (termId) query.termId = termId;
    
    const data = await Result.find(query)
      .populate('studentId', 'firstName lastName studentId classId')
      .populate('subjectId', 'name code')
      .populate('termId', 'name');
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const data = await Result.findById(req.params.id)
      .populate('studentId')
      .populate('subjectId')
      .populate('termId');
    
    if (!data) return res.status(404).json({ success: false, message: 'Result not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/bulk', authenticate, authorize('admin', 'teacher'), teacherAssignment, async (req, res, next) => {
  try {
    const { results } = req.body;
    
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Results array required' });
    }
    
    let saved = 0;
    for (const r of results) {
      const { grade, comment } = calculateGrade(r.score);
      await Result.findOneAndUpdate(
        { studentId: r.studentId, subjectId: r.subjectId, termId: r.termId },
        { ...r, score: r.score, grade, comment, isPublished: false },
        { upsert: true }
      );
      saved++;
    }
    
    res.json({ success: true, message: `${saved} results saved successfully` });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { studentId, subjectId, termId, score, comment } = req.body;
    
    const { grade, remark } = calculateGrade(score);
    
    const data = await Result.findOneAndUpdate(
      { studentId, subjectId, termId },
      { studentId, subjectId, termId, score, grade, comment: remark },
      { upsert: true, new: true }
    );
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { score, grade, comment, isPublished } = req.body;
    const updates = {};
    if (score !== undefined) updates.score = score;
    if (grade) updates.grade = grade;
    if (comment !== undefined) updates.comment = comment;
    if (isPublished !== undefined) updates.isPublished = isPublished;
    
    const data = await Result.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Result not found' });
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/publish', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { termId, classId, isPublished } = req.query;
    
    const students = await Student.find({ classId });
    const studentIds = students.map(s => s._id);
    
    await Result.updateMany(
      { studentId: { $in: studentIds }, termId },
      { isPublished }
    );
    
    res.json({ success: true, message: `Results ${isPublished ? 'published' : 'unpublished'} successfully` });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await Result.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Result not found' });
    res.json({ success: true, message: 'Result deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;