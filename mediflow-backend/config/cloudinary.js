const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. Storage for Profile Photos (Images only)
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mediflow_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

// 2. Storage for Diagnostic Lab Reports (PDFs + Images)
const labReportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mediflow_lab_reports',
    resource_type: 'auto', // Allows both PDFs & Images
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  }
});

const uploadProfile = multer({ storage: profileStorage });
const uploadLabReport = multer({ storage: labReportStorage });

// Export both uploaders alongside cloudinary
module.exports = { 
  cloudinary, 
  upload: uploadProfile, // Keeps existing code working seamlessly
  uploadProfile,
  uploadLabReport 
};