const express = require('express');
const router = express.Router();
const {
  getDoctorProfile,
  updateAvailability,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription,
  getPatientHistory
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes with doctor authorization
router.use(protect, authorize('doctor'));

router.get('/profile', getDoctorProfile);
router.put('/availability', updateAvailability);
router.get('/appointments', getDoctorAppointments);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.post('/prescriptions', addPrescription);
router.get('/patient-history/:patientId', getPatientHistory);

module.exports = router;