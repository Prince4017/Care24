import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    scheduleType: { type: String, enum: ['hourly', 'daily', 'long-term'], required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    price: Number
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
