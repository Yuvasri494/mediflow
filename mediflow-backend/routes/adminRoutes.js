const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  createDoctor,
  getAllDoctors,
  toggleDoctorStatus,
  deleteDoctor,
  getPatients,
  getAllPatients,
  getAdminAnalytics,
  getAllAppointments
} = require('../controllers/adminController');

// Import both protect and authorize directly from authMiddleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply protection & admin role check to all admin routes
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);

router.route('/doctors')
  .get(getAllDoctors)
  .post(createDoctor);

router.patch('/doctors/:id/toggle-status', toggleDoctorStatus);
router.delete('/doctors/:id', deleteDoctor);

router.get('/patients', getPatients || getAllPatients);
router.get('/appointments', getAllAppointments);

module.exports = router;