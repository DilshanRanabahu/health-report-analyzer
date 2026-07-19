import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your PC's local IP (e.g., http://192.168.1.5:8000) if running backend locally.
// Currently points to your EC2 instance.
const API_URL = 'http://10.110.9.242:8000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 minutes (matches the backend API gateway timeout)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Token securely from SecureStore
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Error reading token', e);
  }
  return config;
});

// Auth Services
export const login = async (username: string, password: string) => {
  const response = await api.post('/api/mobile/login', { username, password });
  if (response.data.access_token) {
    await SecureStore.setItemAsync('access_token', response.data.access_token);
  }
  return response.data;
};

export const registerUser = async (username: string, password: string) => {
  const response = await api.post('/api/mobile/register', { username, password });
  return response.data;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('access_token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/me');
  return response.data;
};

// Report Services
export const getReports = async () => {
  const response = await api.get('/api/reports');
  return response.data;
};

export const deleteReport = async (reportId: string | number) => {
  const response = await api.delete(`/api/reports/${reportId}`);
  return response.data;
};

export const uploadReport = async (fileUri: string, mimeType: string, filename: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: mimeType,
    name: filename,
  } as any);

  const response = await api.post('/api/analyze-report', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Chat Services
export const getChatHistory = async (reportId: string | number) => {
  const response = await api.get(`/api/reports/${reportId}/chat`);
  return response.data;
};

export const sendChatMessage = async (reportId: string | number, message: string, reportContext: string, history: any[] = []) => {
  const response = await api.post('/api/chat', {
    report_id: reportId,
    message,
    report_context: reportContext,
    history,
  });
  return response.data;
};
