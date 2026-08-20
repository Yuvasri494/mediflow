import API from './api';

// @desc Get logged-in patient profile
export const getPatientProfileApi = () =>
  API.get('/patient/profile').then(res => res.data);

// @desc Update patient profile
export const updatePatientProfileApi = (formData) =>
  API.put('/patient/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);

// @desc Fetch patient prescriptions (supported under both naming conventions)
export const getMyPrescriptionsApi = () =>
  API.get('/patient/prescriptions').then(res => res.data);

export const getPatientPrescriptionsApi = getMyPrescriptionsApi;

// @desc Browse & search doctors (supported under both naming conventions)
export const browseDoctorsApi = (search = '', specialization = '') => {
  return API.get(`/patient/doctors?search=${search}&specialization=${specialization}`).then(res => res.data);
};

export const getDoctorsDirectoryApi = browseDoctorsApi;

// @desc Fetch single doctor details
export const getDoctorDetailsApi = (id) =>
  API.get(`/patient/doctors/${id}`).then(res => res.data);