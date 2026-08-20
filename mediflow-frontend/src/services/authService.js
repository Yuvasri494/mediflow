import API from './api';

export const loginApi = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (token, password) => {
  const response = await API.put(`/auth/reset-password/${token}`, { password });
  return response.data;
};