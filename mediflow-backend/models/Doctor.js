const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    specialization: {
      type: String,
      default: 'General Physician'
    },
    qualification: {
      type: String,
      default: 'MBBS'
    },
    experience: {
      type: Number,
      default: 1
    },
    fees: {
      type: Number,
      default: 500
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);