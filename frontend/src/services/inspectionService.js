import api from './api';
export const inspectionService = {
  getAll:  ()     => api.get('/inspections').then(r => r.data),
  getById: (id)   => api.get(`/inspections/${id}`).then(r => r.data),
  create:  (data) => api.post('/inspections', data).then(r => r.data),
  update:  (id, data) => api.put(`/inspections/${id}`, data).then(r => r.data),
};
