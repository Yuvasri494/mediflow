import API from './api';

export const getAvailableSlotsApi = (doctorId, date) =>
  API.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`).then(res => res.data);

export const bookAppointmentApi = (data) =>
  API.post('/appointments', data).then(res => res.data);

export const getMyAppointmentsApi = () =>
  API.get('/appointments/my-appointments').then(res => res.data);

export const cancelAppointmentApi = (id) =>
  API.patch(`/appointments/${id}/cancel`, {}).then(res => res.data);
export const getQueuePositionApi = (appointmentId) =>
  API.get(`/appointments/queue-position/${appointmentId}`).then(res => res.data);