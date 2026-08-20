const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    age: { type: Number, default: 25 },
    gender: { type: String, default: 'Not Specified' },
    bloodGroup: { type: String, default: 'O+' },
    contactNumber: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          // Allows blank/empty string OR exact 10-digit number
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Please provide a valid 10-digit mobile number'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);