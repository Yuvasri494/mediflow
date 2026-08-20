// Validation Utility Helper Functions

// Phone Number: 10-digit Indian mobile number starting with 6-9
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone.trim())) {
    return 'Enter a valid 10-digit mobile number (e.g., 9876543210)';
  }
  return null;
};

// Password: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter (A-Z)';
  if (!/[a-z]/.test(password)) return 'Must contain at least one lowercase letter (a-z)';
  if (!/\d/.test(password)) return 'Must contain at least one number (0-9)';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Must contain at least one special character (@, #, $, etc.)';
  }
  return null;
};

// Email Format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email address is required';
  if (!emailRegex.test(email.trim())) return 'Enter a valid email address';
  return null;
};