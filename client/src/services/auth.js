import { login as apiLogin, getProfile, changePassword } from './api';

export const login = async (email, password) => {
  try {
    const response = await apiLogin(email, password);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const updateProfile = async (userData) => {
  const response = await getProfile();
  return response.data;
};

export const changeUserPassword = async (data) => {
  const response = await changePassword(data);
  return response.data;
};