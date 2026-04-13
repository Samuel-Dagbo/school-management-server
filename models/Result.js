import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  termId: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true },
  score: { type: Number, min: 0, max: 100 },
  grade: { type: String },
  comment: { type: String },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

resultSchema.index({ studentId: 1, subjectId: 1, termId: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);