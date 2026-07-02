import express from 'express';
import User from '../models/User.js';
import Caregiver from '../models/Caregiver.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalFamilies, totalCaregiverUsers, totalCaregiverProfiles, verifiedCaregivers, totalBookings, bookingsByStatus] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'family' }),
        User.countDocuments({ role: 'caregiver' }),
        Caregiver.countDocuments(),
        Caregiver.countDocuments({ isVerified: true }),
        Booking.countDocuments(),
        Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      ]);

    res.json({ totalUsers, totalFamilies, totalCaregiverUsers, totalCaregiverProfiles, verifiedCaregivers, totalBookings, bookingsByStatus });
  } catch (err) {
    res.status(500).json({ error: 'Could not load stats' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

router.get('/caregivers', async (req, res) => {
  try {
    const caregivers = await Caregiver.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(caregivers);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch caregivers' });
  }
});

router.patch('/caregivers/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;
    const caregiver = await Caregiver.findByIdAndUpdate(
      req.params.id,
      { isVerified: !!isVerified },
      { returnDocument: 'after' }
    ).populate('user', 'name email');
    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });
    res.json(caregiver);
  } catch (err) {
    res.status(500).json({ error: 'Could not update caregiver' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('patient', 'name')
      .populate('service', 'name')
      .populate({ path: 'caregiver', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch bookings' });
  }
});

export default router;
