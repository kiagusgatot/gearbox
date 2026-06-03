import api from './api';
export const authService = {
  login:      (email, password) => api.post('/login', { email, password }).then(r => r.data),
  register:   (data)           => api.post('/register', data).then(r => r.data),
  logout:     ()               => api.post('/logout'),
  getProfile: ()               => api.get('/user').then(r => r.data),
  forgotPassword: (email)      => api.post('/forgot-password', { email }).then(r => r.data),
  resetPassword:  (data)       => api.post('/reset-password', data).then(r => r.data),
  verifyEmail:    (data)       => api.post('/verify-email', data).then(r => r.data),
};

