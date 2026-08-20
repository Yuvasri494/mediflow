const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Admin Dashboard Overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const doctorCount = await Doctor.countDocuments();
  const patientCount = await Patient.countDocuments();
  const appointmentCount = await Appointment.countDocuments();
  const departmentCount = await Department.countDocuments();

  res.json({
    success: true,
    data: { doctorCount, patientCount, appointmentCount, departmentCount }
  });
});

// @desc    Get Dynamic System Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAdminAnalytics = asyncHandler(async (req, res) => {
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalDepartments = await Department.countDocuments();
  const totalAppointments = await Appointment.countDocuments();

  const completed = await Appointment.countDocuments({ status: { $regex: /^completed$/i } });
  const scheduled = await Appointment.countDocuments({ status: { $regex: /^scheduled$|^approved$/i } });
  const inProgress = await Appointment.countDocuments({ status: { $regex: /^in-progress$|^pending$/i } });
  const cancelled = await Appointment.countDocuments({ status: { $regex: /^cancelled$|^rejected$/i } });


  const departments = await Department.find();
  const deptLabels = [];
  const deptCounts = [];

  for (const dept of departments) {
    deptLabels.push(dept.name);
    const docCount = await Doctor.countDocuments({ department: dept._id });
    deptCounts.push(docCount);
  }

  // Monthly patient registration trend (last 6 months)
  const monthLabels = [];
  const monthCounts = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    monthLabels.push(start.toLocaleString('default', { month: 'short' }));
    const count = await Patient.countDocuments({ createdAt: { $gte: start, $lt: end } });
    monthCounts.push(count);
  }

  res.json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      departmentDistribution: {
        labels: deptLabels.length > 0 ? deptLabels : ['General'],
        counts: deptCounts.length > 0 ? deptCounts : [totalDoctors]
      },
      appointmentStatuses: {
        labels: ['Completed', 'Scheduled', 'In-Progress', 'Cancelled'],
        counts: [completed, scheduled, inProgress, cancelled]
      },
      monthlyTrends: {
        labels: monthLabels,
        registrations: monthCounts
      }
    }
  });
});
// @desc    Get All Doctors
// @route   GET /api/admin/doctors
// @access  Private (Admin)
exports.getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .populate('userId', 'name email phone profilePhoto isActive')
    .populate('department', 'name specialization')
    .sort({ createdAt: -1 });

  const validDoctors = doctors.filter((doc) => doc.userId !== null);
  res.json({ success: true, count: validDoctors.length, data: validDoctors });
});

// Alias export to prevent route import mismatches
exports.getDoctors = exports.getAllDoctors;

// @desc    Create New Doctor Account & Profile
// @route   POST /api/admin/doctors
// @access  Private (Admin)
exports.createDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, phone, department, specialization, qualification, experience, fees } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in required fields: name, email, and password.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check if user email already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(400);
    throw new Error(`A user with email "${email}" already exists. Please use a different email.`);
  }

  // 2. Validate department input (ObjectId vs Name vs Null)
  let validDepartmentId = null;
  if (department && mongoose.Types.ObjectId.isValid(department)) {
    validDepartmentId = department;
  } else if (department && typeof department === 'string' && department.trim() !== '') {
    const foundDept = await Department.findOne({ name: { $regex: new RegExp(`^${department.trim()}$`, 'i') } });
    if (foundDept) {
      validDepartmentId = foundDept._id;
    }
  }

  // 3. Create User Account
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone || '9876543210',
    role: 'doctor',
    isActive: true
  });

  try {
    // 4. Create Doctor Profile
    const doctor = await Doctor.create({
      userId: user._id,
      department: validDepartmentId,
      specialization: specialization || 'General Physician',
      qualification: qualification || 'MBBS',
      experience: Number(experience) || 1,
      fees: Number(fees) || 500
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone profilePhoto isActive')
      .populate('department', 'name specialization');

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: populatedDoctor
    });
  } catch (error) {
    // Rollback user account if doctor creation fails
    await User.findByIdAndDelete(user._id);
    res.status(400);
    throw new Error(error.message || 'Failed to create doctor profile');
  }
});

// @desc    Toggle Doctor Account Active Status
// @route   PATCH /api/admin/doctors/:id/toggle-status
// @access  Private (Admin)
exports.toggleDoctorStatus = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor record not found');
  }

  const user = await User.findById(doctor.userId);
  if (user) {
    user.isActive = !user.isActive;
    await user.save();
  }

  res.json({ success: true, message: `Doctor status updated to ${user?.isActive ? 'active' : 'inactive'}` });
});

// @desc    Delete Doctor Record & Account
// @route   DELETE /api/admin/doctors/:id
// @access  Private (Admin)
exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (doctor) {
    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(req.params.id);
  }
  res.json({ success: true, message: 'Doctor deleted successfully' });
});

// @desc    Get All Registered Patients
// @route   GET /api/admin/patients
// @access  Private (Admin)
exports.getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find()
    .populate('userId', 'name email phone profilePhoto isActive createdAt')
    .sort({ createdAt: -1 });

  const validPatients = patients.filter((p) => p.userId !== null);
  res.json({ success: true, count: validPatients.length, data: validPatients });
});

exports.getAllPatients = exports.getPatients;

// @desc    Get All System Appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin)
// @desc    Get All System Appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin)
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate({
      path: 'patient',
      populate: { path: 'userId', select: 'name email profilePhoto' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'userId', select: 'name email profilePhoto' }
    })
    .populate('department', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: appointments.length, data: appointments });
});