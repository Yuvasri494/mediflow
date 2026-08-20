const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Validate token string is not empty or literal string "undefined"/"null"
      if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        res.status(401);
        throw new Error('Not authorized, no token provided');
      }

      // Verify token with fallback for missing env secret
      const secret = process.env.JWT_SECRET || 'fallbacksecret';
      const decoded = jwt.verify(token, secret);
      
      // Support tokens signed with either id or _id
      const userId = decoded.id || decoded._id;

      req.user = await User.findById(userId).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (!req.user.isActive) {
        res.status(403);
        throw new Error('Account deactivated. Please contact administrator.');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error(error.message || 'Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role '${req.user?.role || 'Guest'}' is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { protect, authorize };