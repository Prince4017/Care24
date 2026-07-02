import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Service from './models/Service.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const services = [
  {
    name: 'Nursing Care',
    description: 'Skilled nursing support for medication, wound care, and monitoring vital signs at home.',
    durationOptions: ['hourly', 'daily', 'long-term'],
    basePrice: 500,
    requiredQualification: 'Registered Nurse (RN/GNM/ANM)'
  },
  {
    name: 'Elderly Attendant',
    description: 'Day-to-day non-medical support: mobility assistance, meals, hygiene, and companionship.',
    durationOptions: ['hourly', 'daily', 'long-term'],
    basePrice: 300,
    requiredQualification: 'Certified Caregiver Training'
  },
  {
    name: 'Physiotherapy',
    description: 'In-home physical therapy sessions for mobility, recovery, and pain management.',
    durationOptions: ['hourly'],
    basePrice: 700,
    requiredQualification: 'Licensed Physiotherapist (BPT/MPT)'
  },
  {
    name: 'Post-Hospital Care',
    description: 'Transitional care after a hospital stay, including recovery monitoring and follow-up support.',
    durationOptions: ['daily', 'long-term'],
    basePrice: 600,
    requiredQualification: 'Registered Nurse or Certified Attendant'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await Service.deleteMany({});
    await Service.insertMany(services);

    console.log(`Seeded ${services.length} services`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
