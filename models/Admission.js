import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  appliedClass: { type: String, required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  previousSchool: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Admission', admissionSchema);