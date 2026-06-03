import api from './api';

const unwrap = (res) => { const d = res.data; return d?.data !== undefined ? d.data : d; };

export const bookingService = {
  // Existing
  getAll:           ()         => api.get('/bookings').then(r => unwrap(r)),
  getById:          (id)       => api.get(`/bookings/${id}`).then(r => unwrap(r)),
  create:           (data)     => api.post('/bookings', data).then(r => unwrap(r)),
  updateStatus:     (id, data) => api.put(`/bookings/${id}`, data).then(r => unwrap(r)),
  getInvoice:       (id)       => api.get(`/bookings/${id}/invoice`).then(r => unwrap(r)),
  getDocumentation: (id)       => api.get(`/bookings/${id}/documentation`).then(r => unwrap(r)),
  getDetails:       (id)       => api.get(`/bookings/${id}/details`).then(r => unwrap(r)),

  // NEW: Expanded flow endpoints
  sendEstimation:    (id, data) => api.put(`/bookings/${id}/send-estimation`, data).then(r => unwrap(r)),
  startService:      (id, data) => api.put(`/bookings/${id}/start-service`, data).then(r => unwrap(r)),
  getEstimation:     (id)       => api.get(`/bookings/${id}/estimation`).then(r => unwrap(r)),
  approveEstimation: (id, data) => api.put(`/bookings/${id}/approve-estimation`, data).then(r => unwrap(r)),
  confirmStart:      (id)       => api.put(`/bookings/${id}/confirm-start`).then(r => unwrap(r)),
  getChecklist:      (id)       => api.get(`/bookings/${id}/checklist`).then(r => r.data),
  toggleChecklist:   (bookingId, itemId, data) => api.put(`/bookings/${bookingId}/checklist/${itemId}`, data).then(r => unwrap(r)),
  completeService:   (id)       => api.put(`/bookings/${id}/complete-service`).then(r => unwrap(r)),
};
