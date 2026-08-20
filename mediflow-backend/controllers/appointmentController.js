const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');

// Available standard time slots
const TIME_SLOTS = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM'
];

// Helper: Normalize any date string into exact UTC day start & end boundaries
const getUTCDateBoundaries = (dateStr) => {
  const d = new Date(dateStr);
  const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
  return { startOfDay, endOfDay };
};

// @desc    Get booked and available slots for a doctor & date
// @route   GET /api/appointments/available-slots
// @access  Private
exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    res.status(400);
    throw new Error('Please provide doctorId and date');
  }

  const { startOfDay, endOfDay } = getUTCDateBoundaries(date);

  // Search using both doctor and doctorId fields across non-cancelled appointments
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $not: /cancelled|rejected/i }
  }).select('timeSlot');

  const bookedSlots = bookedAppointments.map((app) => app.timeSlot);
  const availableSlots = TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

  res.json({
    success: true,
    data: {
      allSlots: TIME_SLOTS,
      bookedSlots,
      availableSlots
    }
  });
});

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
exports.bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, departmentId, appointmentDate, timeSlot, reason } = req.body;

  let patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    // Auto-create profile if missing
    patient = await Patient.create({ userId: req.user._id, age: 25, gender: 'Not Specified' });
  }

  const { startOfDay, endOfDay } = getUTCDateBoundaries(appointmentDate);

  // Strict double-booking validation across schema fields
  const existingBooking = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    timeSlot: timeSlot,
    status: { $not: /cancelled|rejected/i }
  });

  if (existingBooking) {
    res.status(400);
    throw new Error('Selected time slot is already booked for this doctor. Please select another slot.');
  }

 const appointment = await Appointment.create({
  patient: patient._id,
  doctor: doctorId,
  department: departmentId,
  appointmentDate: new Date(appointmentDate),
  timeSlot: timeSlot,
  reason: reason || 'General Consultation',
  status: 'Scheduled'
});

  res.status(201).json({
    success: true,
    data: appointment
  });
});

// @desc    Get patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
exports.getMyAppointments = asyncHandler(async (req, res) => {
  let patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    patient = await Patient.create({ userId: req.user._id, age: 25, gender: 'Not Specified' });
  }

  const appointments = await Appointment.find({ patient: patient._id })
  .populate({
    path: 'doctor',
    populate: { path: 'userId', select: 'name email profilePhoto' }
  })
  .populate('department', 'name')
  .sort({ appointmentDate: -1, createdAt: -1 });

  res.json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Upload lab report
// @route   POST /api/appointments/:id/lab-reports
// @access  Private
exports.uploadLabReport = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const newReport = {
    title: title?.trim() || req.file.originalname,
    fileUrl: req.file.path || req.file.secure_url,
    uploadedAt: new Date()
  };

  appointment.labReports = appointment.labReports || [];
  appointment.labReports.push(newReport);
  await appointment.save();

  res.status(201).json({ success: true, message: 'Lab report uploaded successfully', data: appointment.labReports });
});

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  appointment.status = 'Cancelled';
  await appointment.save();

  res.json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
});