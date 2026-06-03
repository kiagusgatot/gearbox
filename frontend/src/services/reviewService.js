import api from './api';
export const reviewService = {
  create: (data) => api.post('/reviews', data).then(r => r.data),
};
