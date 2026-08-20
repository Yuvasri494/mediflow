import API from './api';

export const getAdminDashboardApi = () => API.get('/admin/dashboard').then(res => res.data);
export const getAllDoctorsApi = () => API.get('/admin/doctors').then(res => res.data);
export const createDoctorApi = (data) => API.post('/admin/doctors', data).then(res => res.data);
export const toggleDoctorStatusApi = (id) => API.patch(`/admin/doctors/${id}/toggle-status`).then(res => res.data);
export const deleteDoctorApi = (id) => API.delete(`/admin/doctors/${id}`).then(res => res.data);
export const getAllPatientsApi = (search = '') => API.get(`/admin/patients?search=${search}`).then(res => res.data);
export const getAllAppointmentsApi = (status = '') => API.get(`/admin/appointments?status=${status}`).then(res => res.data);
export const getAdminAnalyticsApi = () => API.get('/admin/analytics').then(res => res.data);