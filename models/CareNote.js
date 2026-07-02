import mongoose from 'mongoose';

const careNoteSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    note: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('CareNote', careNoteSchema);
