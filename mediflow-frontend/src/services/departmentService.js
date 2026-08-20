import API from './api';

// Get all medical departments & specializations
export const getDepartmentsApi = () => API.get('/departments').then(res => res.data);

// Get single department by ID
export const getDepartmentByIdApi = (id) => API.get(`/departments/${id}`).then(res => res.data);

// Create new department (Admin only)
export const createDepartmentApi = (data) => API.post('/departments', data).then(res => res.data);