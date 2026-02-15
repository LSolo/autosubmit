import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

export const api = {
  processImages: (formData: FormData) => apiClient.post('/images/icons', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generateMetadata: (data: { appName: string; features: string[]; keywords: string[]; language: string }) => apiClient.post('/ai/generate-metadata', data),
  submitAndroid: (formData: FormData) => apiClient.post('/submit/android', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  submitIOS: (formData: FormData) => apiClient.post('/submit/ios', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generateReleaseNotes: (data: { input: string, tone: string }) => apiClient.post('/ai/release-notes', data),
  getConfig: () => apiClient.get('/config'),
  saveConfig: (config: any) => apiClient.post('/config', config),
};
