const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  uploadLabReport
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { cancelAppointment } = require('../controllers/appointmentController');

router.get('/available-slots', protect, getAvailableSlots);
router.get('/my-appointments', protect, getMyAppointments);
router.post('/', protect, authorize('patient'), bookAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);

// 📄 Upload Lab Report (uses 'upload' from cloudinary.js)
router.post(
  '/:id/lab-reports',
  protect,
  upload.single('report'),
  uploadLabReport
);

module.exports = router;