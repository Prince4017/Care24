import express from 'express';
import Caregiver from '../models/Caregiver.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: browse all caregivers
router.get('/', async (req, res) => {
  try {
    const caregivers = await Caregiver.find({ isVerified: true }).populate('user', 'name email phone');
    res.json(caregivers);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch caregivers' });
  }
});

// Logged-in caregiver: get my own profile (or null if not created yet)
router.get('/me', protect, async (req, res) => {
  try {
    const profile = await Caregiver.findOne({ user: req.user._id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// Logged-in caregiver: create or update my profile
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({ error: 'Only caregiver accounts can create a caregiver profile' });
    }
    const { qualification, specialization, experienceYears, hourlyRate, serviceAreas } = req.body;

    const profile = await Caregiver.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        qualification,
        specialization,
        experienceYears,
        hourlyRate,
        serviceAreas: Array.isArray(serviceAreas)
          ? serviceAreas
          : String(serviceAreas || '').split(',').map((s) => s.trim()).filter(Boolean)
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Could not save profile' });
  }
});

export default router;
