const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Função auxiliar para fazer requisições
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API de Autenticação
export const authAPI = {
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getProfile: () => request('/auth/profile'),

  updateProfile: (data) => request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (data) => request('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  forgotPassword: (data) => request('/auth/forgot', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  resetPassword: (data) => request('/auth/reset', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// API de Hábitos
export const habitsAPI = {
  getAll: () => request('/habits'),

  create: (habitData) => request('/habits', {
    method: 'POST',
    body: JSON.stringify(habitData),
  }),

  update: (id, habitData) => request(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(habitData),
  }),

  delete: (id) => request(`/habits/${id}`, {
    method: 'DELETE',
  }),

  toggleComplete: (id, data) => request(`/habits/${id}/toggle`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getHistory: (id, params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/habits/${id}/history?${query}`);
  },

  getCalendar: () => request('/habits/calendar/all'),
};

// API de Estatísticas
export const statsAPI = {
  getStats: () => request('/stats'),
  getProgress: () => request('/stats/progress'),
  getHeatmap: () => request('/stats/heatmap'),
};

export default {
  auth: authAPI,
  habits: habitsAPI,
  stats: statsAPI,
};
