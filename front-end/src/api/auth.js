import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/api-auth/login/', { username, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/api-auth/logout/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/current-user/');
    return response.data;
  } catch (error) {
    return null;
  }
};