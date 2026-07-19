import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const reportApi = {
  fetchReports: () => apiClient.get('/reports'),
  deleteReport: (reportId) => apiClient.delete(`/reports/${reportId}`),
  analyzeReport: (formData) => apiClient.post('/analyze-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const chatApi = {
  fetchHistory: (reportId) => apiClient.get(`/reports/${reportId}/chat`),
  sendMessage: (payload) => apiClient.post('/chat', payload)
};

export const authApi = {
  checkAuth: () => apiClient.get('/me'),
  logout: () => apiClient.post('/logout')
};
