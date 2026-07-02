import express from 'express';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/mine', protect, async (req, res) => {
  try {
    const patients = await Patient.find({ familyUser: req.user._id });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch patients' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, age, medicalNeeds, address } = req.body;
    if (!name || !age) {
      return res.status(400).json({ error: 'Name and age are required' });
    }
    const patient = await Patient.create({
      familyUser: req.user._id,
      name,
      age,
      medicalNeeds,
      address
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Could not create patient profile' });
  }
});

export default router;
