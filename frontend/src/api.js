import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getDevices = () => api.get('/devices').then(r => r.data);
export const deleteDevice = (id) => api.delete(`/devices/${id}`).then(r => r.data);
export const getStats = () => api.get('/stats').then(r => r.data);
export const createDevice = (device) => api.post('/devices', device).then(r => r.data);
export const updateDevice = (id, device) => api.put(`/devices/${id}`, device).then(r => r.data);
export const getDeviceLogs = (id) => api.get(`/logs/${id}`).then(r => r.data);
export const getSettings = () => api.get('/settings').then(r => r.data);
export const updateSettings = (s) => api.put('/settings', s).then(r => r.data);
export const triggerDiscovery = () => api.post('/discover').then(r => r.data);

export default api;
