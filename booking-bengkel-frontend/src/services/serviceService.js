import api from './api';
const unwrap = (res) => { const d = res.data; return d?.data !== undefined ? d.data : d; };

export const serviceService = {
  getAll:          ()         => api.get('/services').then(r => unwrap(r)),
  getById:         (id)       => api.get(`/services/${id}`).then(r => unwrap(r)),
  create:          (data)     => api.post('/services', data).then(r => unwrap(r)),
  update:          (id, data) => api.put(`/services/${id}`, data).then(r => unwrap(r)),
  delete:          (id)       => api.delete(`/services/${id}`).then(r => unwrap(r)),
  getAvailability: (id, startDate, endDate) => {
    const params = {}; if (startDate) params.start_date = startDate; if (endDate) params.end_date = endDate;
    return api.get(`/services/${id}/availability`, { params }).then(r => { const d = r.data; return d?.data !== undefined ? d.data : d; });
  },
  getReviews:      (id, page = 1, limit = 10) => api.get(`/services/${id}/reviews`, { params: { page, limit, sort: '-created_at' } }).then(r => r.data),
  submitReview:    (data) => api.post('/reviews', data).then(r => unwrap(r)),

  // Image upload
  uploadImage:     (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'services');
    return api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => unwrap(r));
  },
};
