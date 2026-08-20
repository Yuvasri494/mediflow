import API from './api';

// @desc Get public doctor directory for patient booking
export const getAllDoctorsApi = () =>
  API.get('/admin/doctors').then(res => res.data);

// @desc Get logged-in doctor profile
export const getDoctorProfileApi = () =>
  API.get('/doctor/profile').then(res => res.data);

// @desc Manage doctor availability slots
export const updateAvailabilityApi = (availabilitySlots) =>
  API.put('/doctor/availability', { availabilitySlots }).then(res => res.data);

// @desc Get doctor appointment queue (optional status filter)
export const getDoctorAppointmentsApi = (status) =>
  API.get(`/doctor/appointments${status ? `?status=${status}` : ''}`).then(res => res.data);

// @desc Update status (approved / rejected / completed)
export const updateAppointmentStatusApi = (id, status) =>
  API.patch(`/doctor/appointments/${id}/status`, { status }).then(res => res.data);

// @desc Add new prescription & consultation notes
export const addPrescriptionApi = (payload) =>
  API.post('/doctor/prescriptions', payload).then(res => res.data);

// @desc Fetch prescription by appointment ID
export const getPrescriptionApi = (appointmentId) =>
  API.get(`/doctor/prescriptions/${appointmentId}`).then(res => res.data);

// @desc Get complete medical history for a patient
export const getPatientHistoryApi = (patientId) =>
  API.get(`/doctor/patient-history/${patientId}`).then(res => res.data);