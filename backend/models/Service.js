import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    durationOptions: [String],
    basePrice: { type: Number, required: true },
    requiredQualification: String
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);
