import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  phone: { type: String },
  address: { type: String },
  qualification: { type: String },
  specialties: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Teacher', teacherSchema);