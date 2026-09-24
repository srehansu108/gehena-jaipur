import api from '../services/api';

export const contactPageApi = {
  get: () => api.get('/pages/contact').then((r) => r.data.data),
  getAdmin: () => api.get('/pages/contact/admin').then((r) => r.data.data),
  save: (payload) => api.put('/pages/contact', payload).then((r) => r.data.data),
  reset: () => api.post('/pages/contact/reset').then((r) => r.data.data),
};