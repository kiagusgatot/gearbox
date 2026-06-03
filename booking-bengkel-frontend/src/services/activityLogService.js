import api from './api';
export const activityLogService = {
  getAll:       (params = {}) => api.get('/activity-logs', { params }).then(r => r.data),
  getByBooking: (bookingId)   => api.get(`/bookings/${bookingId}/logs`).then(r => r.data),
};
