import mongoose from 'mongoose';

const caregiverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qualification: { type: String, required: true },
    specialization: {
      type: String,
      enum: ['Nursing Care', 'Elderly Attendant', 'Physiotherapy', 'Post-Hospital Care'],
      required: true
    },
    experienceYears: { type: Number, default: 0 },
    hourlyRate: { type: Number, required: true },
    serviceAreas: [String],
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Caregiver', caregiverSchema);
