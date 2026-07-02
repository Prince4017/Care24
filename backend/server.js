import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Service from './models/Service.js';
import authRoutes from './routes/auth.js';
import caregiverRoutes from './routes/caregivers.js';
import patientRoutes from './routes/patients.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';


dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is up and running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch services' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
