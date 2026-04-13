import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);