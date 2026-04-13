import express from 'express';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Session from '../models/Session.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const promotionOrder = [
  'Creche', 'KG 1', 'KG 2', 'Primary 1', 'Primary 2', 'Primary 3',
  'Primary 4', 'Primary 5', 'Primary 6', 'JHS 1', 'JHS 2', 'JHS 3'
];

router.post('/students', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    
    const currentSession = await Session.findById(sessionId);
    if (!currentSession) {
      return res.status(400).json({ success: false, message: 'Session not found' });
    }
    
    const nextYear = parseInt(currentSession.name.split('-')[1]) + 1;
    const nextSessionName = `${currentSession.name.split('-')[1]}-${nextYear}`;
    
    let nextSession = await Session.findOne({ name: nextSessionName });
    
    if (!nextSession) {
      nextSession = await Session.create({
        name: nextSessionName,
        startDate: new Date(`${nextYear}-09-01`),
        endDate: new Date(`${nextYear + 1}-07-31`),
        isActive: true
      });
      
      await Session.findByIdAndUpdate(sessionId, { isActive: false });
    }
    
    const classes = await Class.find({ academicYear: parseInt(currentSession.name.split('-')[0]) }).sort({ name: 1 });
    
    const classPromotions = {};
    for (let i = 0; i < classes.length - 1; i++) {
      classPromotions[classes[i]._id.toString()] = classes[i + 1]._id;
    }
    
    const students = await Student.find({ classId: { $ne: null } });
    
    let promoted = 0;
    for (const student of students) {
      if (student.classId && classPromotions[student.classId.toString()]) {
        await Student.findByIdAndUpdate(student._id, { classId: classPromotions[student.classId.toString()] });
        promoted++;
      }
    }
    
    res.json({
      success: true,
      message: `Successfully promoted ${promoted} students`,
      data: { promoted, nextSession: nextSessionName }
    });
  } catch (error) {
    next(error);
  }
});

export default router;