const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clean existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Cleared existing collections...');

    // 1. Create Department
    const department = await Department.create({
      name: 'Cardiology',
      description: 'Heart and cardiovascular care'
    });

    // 2. Create Admin Account
    await User.create({
      name: 'System Admin',
      email: 'admin@mediflow.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9876543210',
      isActive: true
    });

    // 3. Create Doctor Account & Doctor Profile
    const doctorUser = await User.create({
      name: 'Dr. Sarah Smith',
      email: 'doctor@mediflow.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '9876543211',
      isActive: true
    });

    // ⚡ FIX: Added missing 'qualification' field required by Doctor schema
    await Doctor.create({
      userId: doctorUser._id,
      department: department._id,
      specialization: 'Cardiologist',
      qualification: 'MBBS, MD (Cardiology)',
      experience: 8,
      fees: 500
    });

    // 4. Create Patient Account & Patient Profile
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@mediflow.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '9876543212',
      isActive: true
    });

    await Patient.create({
      userId: patientUser._id,
      age: 30,
      gender: 'Male',
      bloodGroup: 'O+',
      contactNumber: '9876543212'
    });

    console.log('✅ Database seeded successfully!');
    console.log('-----------------------------------');
    console.log('Admin:   admin@mediflow.com   / Admin@123');
    console.log('Doctor:  doctor@mediflow.com  / Doctor@123');
    console.log('Patient: patient@mediflow.com / Patient@123');
    console.log('-----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();