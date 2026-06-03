import api from './api';
export const paymentService = {
  getAll:    ()        => api.get('/payments').then(r => r.data),
  // Kasir: buat transaksi baru untuk booking yang sudah waiting_payment
  create:    (data)    => api.post('/payments', data).then(r => r.data),
  // Kasir: mark as paid → auto trigger booking status = completed
  markAsPaid:(id)      => api.put(`/payments/${id}`, { status: 'success' }).then(r => r.data),
  markFailed:(id)      => api.put(`/payments/${id}`, { status: 'failed' }).then(r => r.data),
};
