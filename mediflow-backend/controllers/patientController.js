const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');

// Helper to find or auto-create Patient profile for logged-in user
const getOrCreatePatient = async (userId) => {
  let patient = await Patient.findOne({ userId });
  if (!patient) {
    patient = await Patient.create({
      userId,
      age: 25,
      gender: 'Not Specified',
      bloodGroup: 'O+'
    });
  }
  return patient;
};

// @desc    Get Patient Profile
// @route   GET /api/patient/profile
// @access  Private (Patient)
exports.getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await getOrCreatePatient(req.user._id);
  const populatedPatient = await Patient.findById(patient._id).populate(
    'userId',
    'name email phone profilePhoto'
  );
  res.json({ success: true, data: populatedPatient });
});

// @desc    Update Patient Profile
// @route   PUT /api/patient/profile
// @access  Private (Patient)
exports.updatePatientProfile = asyncHandler(async (req, res) => {
  const { age, gender, contactNumber, medicalHistory, bloodGroup } = req.body;

  const patient = await getOrCreatePatient(req.user._id);

  patient.age = age !== undefined ? age : patient.age;
  patient.gender = gender || patient.gender;
  patient.bloodGroup = bloodGroup || patient.bloodGroup;
  patient.contactNumber = contactNumber || patient.contactNumber;
  patient.medicalHistory = medicalHistory || patient.medicalHistory;

  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.profilePhoto = req.file.path || req.file.secure_url;
      await user.save();
    }
  }

  await patient.save();

  const updatedPatient = await Patient.findById(patient._id).populate(
    'userId',
    'name email phone profilePhoto'
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedPatient
  });
});

// @desc    Browse / Search / Filter Doctors
// @route   GET /api/patient/doctors
// @access  Private (Patient)
exports.browseDoctors = asyncHandler(async (req, res) => {
  const { search, specialization } = req.query;

  let doctors = await Doctor.find()
    .populate({
      path: 'userId',
      select: 'name email profilePhoto isActive'
    })
    .populate('department', 'name specialization');

  // Filter out any entries missing linked user accounts
  doctors = doctors.filter((doc) => doc.userId !== null);

  if (specialization) {
    const specTerm = specialization.toLowerCase();
    doctors = doctors.filter(
      (doc) =>
        doc.specialization?.toLowerCase().includes(specTerm) ||
        doc.department?.name?.toLowerCase().includes(specTerm)
    );
  }

  if (search) {
    const term = search.toLowerCase();
    doctors = doctors.filter(
      (doc) =>
        doc.userId?.name?.toLowerCase().includes(term) ||
        doc.specialization?.toLowerCase().includes(term) ||
        doc.department?.name?.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, count: doctors.length, data: doctors });
});
// @desc    Get Patient Prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private (Patient)
exports.getPatientPrescriptions = asyncHandler(async (req, res) => {
  const patient = await getOrCreatePatient(req.user._id);

  const prescriptions = await Prescription.find({ patientId: patient._id })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name email profilePhoto' },
      select: 'specialization'
    })
    .populate('appointmentId')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: prescriptions.length, data: prescriptions });
});