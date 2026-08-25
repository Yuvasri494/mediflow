const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const { TIME_SLOTS, getUTCDateBoundaries } = require('./appointmentController');   // ← ADD THIS LINE

// Helper to resolve doctor profile by logged in userId
const getDoctorByUserId = async (userId, res) => {
  const doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    if (res) res.status(404);
    throw new Error('Doctor profile not found for this logged-in user');
  }
  return doctor;
};


// Recalculates today's live queue for a doctor and pushes updates to each waiting patient
const recalcAndEmitQueue = async (doctorId, io) => {
  if (!io) return;

  const { startOfDay, endOfDay } = getUTCDateBoundaries(new Date());

  const todaysQueue = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['Scheduled', 'In-Progress'] }
  }).populate('patient');

  todaysQueue.sort(
    (a, b) => TIME_SLOTS.indexOf(a.timeSlot) - TIME_SLOTS.indexOf(b.timeSlot)
  );

  todaysQueue.forEach((appt, index) => {
    const patientUserId = appt.patient?.userId?._id || appt.patient?.userId;
    if (!patientUserId) return;

    io.to(patientUserId.toString()).emit('queue_position_update', {
      appointmentId: appt._id,
      patientsAhead: index,
      message:
        index === 0
          ? "You're next in the queue!"
          : `${index} patient${index > 1 ? 's' : ''} ahead of you`
    });
  });
};

// @desc    Get Doctor Profile
// @route   GET /api/doctor/profile
// @access  Private (Doctor)
exports.getDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email profilePhoto');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }
  res.json({ success: true, data: doctor });
});

// @desc    Manage Availability Slots
// @route   PUT /api/doctor/availability
// @access  Private (Doctor)
exports.updateAvailability = asyncHandler(async (req, res) => {
  const doctor = await getDoctorByUserId(req.user._id, res);
  doctor.availabilitySlots = req.body.availabilitySlots || [];
  await doctor.save();

  res.json({ success: true, message: 'Availability schedule updated', data: doctor.availabilitySlots });
});

// @desc    Get Doctor Appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor)
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await getDoctorByUserId(req.user._id, res);
  const { status } = req.query;

  let filter = { doctor: doctor._id };

  // Case-insensitive regex matching for appointment status
  if (status) {
    filter.status = { $regex: new RegExp(`^${status}$`, 'i') };
  }

  const appointments = await Appointment.find(filter)
    .populate({
      path: 'patient',
      populate: { path: 'userId', select: 'name email profilePhoto' }
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Update Appointment Status (Approve/Reject/Complete)
// @route   PATCH /api/doctor/appointments/:id/status
// @access  Private (Doctor)
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Scheduled', 'In-Progress', 'Completed', 'Cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status update action');
  }

  const appointment = await Appointment.findById(req.params.id).populate('patient');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  appointment.status = status;
  await appointment.save();

  const patientUserId = appointment.patient?.userId?._id || appointment.patient?.userId;

   const io = req.app.get('io');
  if (io && patientUserId) {
    io.to(patientUserId.toString()).emit('appointment_status_update', {
      appointmentId: appointment._id,
      status: status,
      message: `Your appointment status was updated to: ${status.toUpperCase()}`
    });
  }

  await recalcAndEmitQueue(appointment.doctor, io);

  res.json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
});

// @desc    Add Prescription & Treatment Notes

// @desc    Add Prescription & Treatment Notes
// @route   POST /api/doctor/prescriptions
// @access  Private (Doctor)
exports.addPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, medicines, treatmentNotes } = req.body;
  const doctor = await getDoctorByUserId(req.user._id, res);

  const appointment = await Appointment.findById(appointmentId).populate('patient');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const existingPrescription = await Prescription.findOne({ appointmentId });
  if (existingPrescription) {
    res.status(400);
    throw new Error('Prescription already exists for this appointment');
  }

  const prescription = await Prescription.create({
    appointmentId,
    patientId: appointment.patient._id,
    doctorId: doctor._id,
    medicines: medicines || [],
    treatmentNotes: treatmentNotes || ''
  });

  appointment.status = 'Completed';
  await appointment.save();

  // Notify patient via WebSockets
  const patientUserId = appointment.patient?.userId?._id || appointment.patient?.userId;
  const io = req.app.get('io');
  if (io && patientUserId) {
    io.to(patientUserId.toString()).emit('appointment_status_update', {
      appointmentId: appointment._id,
      status: 'Completed',
      message: 'A new prescription has been added to your medical records.'
    });
  }

  await recalcAndEmitQueue(appointment.doctor, io);

  res.status(201).json({ success: true, message: 'Prescription added & consultation completed', data: prescription });
});

// @desc    Get Assigned Patient History

// @desc    Get Assigned Patient History
// @route   GET /api/doctor/patient-history/:patientId
// @access  Private (Doctor)
exports.getPatientHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const patient = await Patient.findById(patientId).populate('userId', 'name email profilePhoto');
  if (!patient) {
    res.status(404);
    throw new Error('Patient record not found');
  }

  const appointments = await Appointment.find({ patient: patientId }).sort({ createdAt: -1 });

  const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { patient, appointments, prescriptions }
  });
});

// @desc    Get patient prescriptions
// @route   GET /api/doctor/prescriptions/:appointmentId
// @access  Private
exports.getPrescriptionByAppointment = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOne({
    appointmentId: req.params.appointmentId
  })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name email' }
    });

  if (!prescription) {
    res.status(404);
    throw new Error('No prescription found for this appointment');
  }

  res.json({ success: true, data: prescription });
});