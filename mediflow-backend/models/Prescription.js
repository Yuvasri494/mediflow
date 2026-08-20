const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },    // e.g., "500mg"
  duration: { type: String, required: true },  // e.g., "5 Days"
  instructions: { type: String, default: 'Take after meals' }
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    medicines: [medicineSchema],
    treatmentNotes: { type: String, required: [true, 'Treatment notes are required'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);