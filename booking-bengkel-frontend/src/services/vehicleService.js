import api from './api';
export const vehicleService = {
  getAll: () => api.get('/vehicles').then(r => r.data),
  create: (data) => api.post('/vehicles', data).then(r => r.data),
};
