import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
