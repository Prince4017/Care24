import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    familyUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    medicalNeeds: String,
    address: String
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
