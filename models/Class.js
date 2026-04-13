import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['creche', 'kg', 'primary', 'jhs'], required: true },
  stream: { type: String },
  academicYear: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Class', classSchema);