const crypto = require('crypto');
const User = require('../models/User');
const Patient = require('../models/Patient');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');

// Validation Regex Helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// @desc    Register new Patient
// @route   POST /api/auth/register
// @access  Public
exports.registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, age, gender, contactNumber } = req.body;

  // 1. Required fields check
  if (!name || !email || !password || !contactNumber || age === undefined) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // 2. Email format validation
  if (!EMAIL_REGEX.test(email.trim())) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  // 3. Password strength validation
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    res.status(400);
    throw new Error(
      'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    );
  }

  // 4. Contact number validation (10-digit Indian phone number)
  if (!PHONE_REGEX.test(contactNumber.toString().trim())) {
    res.status(400);
    throw new Error('Please provide a valid 10-digit mobile number starting with 6-9');
  }

  // 5. Age range validation
  const ageNum = Number(age);
  if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
    res.status(400);
    throw new Error('Age must be a valid number between 1 and 120');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: email.trim() });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    password,
    role: 'patient'
  });

  await Patient.create({
    userId: user._id,
    age: ageNum,
    gender: gender || 'Other',
    contactNumber: contactNumber.toString().trim()
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    }
  });
});

// @desc    Authenticate User & Get Token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.trim() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated. Contact admin.');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id)
    }
  });
});

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, data: user });
});

// @desc    Forgot Password Token Generator & Email Dispatcher
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;

  if (typeof email === 'object' && email !== null) {
    email = email.email;
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const user = await User.findOne({ email: email.trim() });

  if (!user) {
    res.status(404);
    throw new Error('No account registered with that email address');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">MediFlow Password Recovery</h2>
      <p>Hello ${user.name},</p>
      <p>Please click the button below to reset your password (valid for 10 minutes):</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #2563eb; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
      <p style="font-size: 12px; color: #666;">If you did not request this email, please ignore it.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'MediFlow Password Reset Request',
      htmlMessage
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your email address'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent. Check backend EMAIL credentials in .env');
  }
});

// @desc    Reset Password via Token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // Validate new password strength
  if (!password || !STRONG_PASSWORD_REGEX.test(password)) {
    res.status(400);
    throw new Error(
      'New password must be at least 8 characters long and contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    );
  }

  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully. You can now login.',
    token: generateToken(user._id)
  });
});