import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  dateOfBirth: { type: Date, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  phone: { type: String },
  address: { type: String },
  parentName: { type: String },
  parentPhone: { type: String }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);