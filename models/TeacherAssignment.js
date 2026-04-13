import mongoose from 'mongoose';

const teacherAssignmentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true }
}, { timestamps: true });

teacherAssignmentSchema.index({ teacherId: 1, subjectId: 1, classId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model('TeacherAssignment', teacherAssignmentSchema);