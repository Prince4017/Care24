import express from 'express';
import Booking from './Booking.js';
import Caregiver from './Caregiver.js';
import Patient from './Patient.js';
import CareNote from './CareNote.js';
import { protect } from './auth.js';

const router = express.Router();

router.get('/mine', protect, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'caregiver') {
      const caregiverProfile = await Caregiver.findOne({ user: req.user._id });
      if (!caregiverProfile) return res.json([]);
      bookings = await Booking.find({ caregiver: caregiverProfile._id })
        .populate('patient', 'name age')
        .populate('service', 'name')
        .populate({ path: 'caregiver', populate: { path: 'user', select: 'name' } });
    } else {
      const myPatients = await Patient.find({ familyUser: req.user._id }).select('_id');
      const patientIds = myPatients.map((p) => p._id);
      bookings = await Booking.find({ patient: { $in: patientIds } })
        .populate('patient', 'name age')
        .populate('service', 'name')
        .populate({ path: 'caregiver', populate: { path: 'user', select: 'name' } });
    }
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch bookings' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { patientId, caregiverId, serviceId, scheduleType, startDate } = req.body;
    if (!patientId || !caregiverId || !serviceId || !scheduleType || !startDate) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });

    const booking = await Booking.create({
      patient: patientId,
      caregiver: caregiverId,
      service: serviceId,
      scheduleType,
      startDate,
      price: caregiver.hourlyRate
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Could not create booking' });
  }
});

// Caregiver updates a booking's status (accept, decline/cancel, start, complete)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['accepted', 'in-progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id).populate('caregiver');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (String(booking.caregiver.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not your booking' });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Could not update booking' });
  }
});

// Caregiver adds a care note to a booking
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ error: 'Note text is required' });

    const booking = await Booking.findById(req.params.id).populate('caregiver');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (String(booking.caregiver.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not your booking' });
    }

    const careNote = await CareNote.create({
      booking: booking._id,
      note,
      addedBy: req.user._id
    });

    res.status(201).json(careNote);
  } catch (err) {
    res.status(500).json({ error: 'Could not add note' });
  }
});

// Either the assigned caregiver or the owning family can view a booking's notes
router.get('/:id/notes', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('caregiver')
      .populate('patient');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isCaregiver = String(booking.caregiver.user) === String(req.user._id);
    const isFamily = String(booking.patient.familyUser) === String(req.user._id);
    if (!isCaregiver && !isFamily) {
      return res.status(403).json({ error: 'Not authorized to view these notes' });
    }

    const notes = await CareNote.find({ booking: booking._id })
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch notes' });
  }
});

export default router;
