import api from '../services/api';   // ✅ your existing axios instance

export const heroApi = {
  getActive: () => api.get('/hero-slides').then((r) => r.data.data),
  getAll: () => api.get('/hero-slides/admin').then((r) => r.data.data),
  getById: (id) => api.get(`/hero-slides/admin/${id}`).then((r) => r.data.data),
  create: (fd) =>
    api.post('/hero-slides', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data),
  update: (id, fd) =>
    api.put(`/hero-slides/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data),
  toggle: (id) => api.patch(`/hero-slides/${id}/toggle`).then((r) => r.data.data),
  reorder: (order) => api.patch('/hero-slides/reorder', { order }),
  remove: (id) => api.delete(`/hero-slides/${id}`),
  trackClick: (id) => api.post(`/hero-slides/${id}/click`).catch(() => {}),
};