import mongoose from 'mongoose';

const termSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  termNumber: { type: Number, required: true, min: 1, max: 3 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('Term', termSchema);