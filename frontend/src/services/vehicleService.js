import api from './api';
const unwrap = (res) => { const d = res.data; return d?.data !== undefined ? d.data : d; };

export const vehicleService = {
  getAll:  ()         => api.get('/vehicles').then(r => unwrap(r)),
  getById: (id)       => api.get(`/vehicles/${id}`).then(r => unwrap(r)),
  create:  (data)     => api.post('/vehicles', data).then(r => unwrap(r)),
  update:  (id, data) => api.put(`/vehicles/${id}`, data).then(r => unwrap(r)),
  delete:  (id)       => api.delete(`/vehicles/${id}`).then(r => unwrap(r)),
};
