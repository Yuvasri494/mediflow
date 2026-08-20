const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'] // e.g. "10:00 AM - 10:30 AM"
    },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    },
    prescription: {
      diagnosis: String,
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          duration: String
        }
      ],
      instructions: String,
      issuedAt: Date
    },
    labReports: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);