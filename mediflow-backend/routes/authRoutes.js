const express = require('express');
const router = express.Router();
const {
  registerPatient,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Auth Routes
router.post('/register', registerPatient);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected Profile Route
router.get('/me', protect, getMe);

module.exports = router;