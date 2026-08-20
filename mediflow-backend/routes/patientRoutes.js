const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile,
  browseDoctors,
  getPatientPrescriptions
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.use(protect, authorize('patient'));

router.get('/profile', getPatientProfile);
router.put('/profile', upload.single('profilePhoto'), updatePatientProfile);
router.get('/doctors', browseDoctors);
router.get('/prescriptions', getPatientPrescriptions);

module.exports = router;