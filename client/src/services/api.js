import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (userData) => API.post('/auth/register', userData);
export const getProfile = () => API.get('/auth/profile');
export const changePassword = (data) => API.post('/auth/change-password', data);
export const getActivities = () => API.get('/auth/activities');

// Projects API
export const fetchProjects = () => API.get('/projects');
export const fetchProject = (id) => API.get(`/projects/${id}`);
export const createProject = (project) => API.post('/projects', project);
export const updateProject = (id, project) => API.put(`/projects/${id}`, project);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Clients API
export const fetchClients = () => API.get('/clients');
export const fetchClient = (id) => API.get(`/clients/${id}`);
export const createClient = (client) => API.post('/clients', client);
export const updateClient = (id, client) => API.put(`/clients/${id}`, client);
export const deleteClient = (id) => API.delete(`/clients/${id}`);

export default API;