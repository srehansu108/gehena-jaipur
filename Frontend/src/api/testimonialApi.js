import api from '../services/api';

export const testimonialApi = {
  // Public
  getActive: () => api.get('/testimonials').then((r) => r.data.data),

  // Admin
  getAll: () => api.get('/testimonials/admin').then((r) => r.data.data),
  getById: (id) => api.get(`/testimonials/admin/${id}`).then((r) => r.data.data),

  create: (fd) =>
    api.post('/testimonials', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data),

  update: (id, fd) =>
    api.put(`/testimonials/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data),

  toggle: (id) => api.patch(`/testimonials/${id}/toggle`).then((r) => r.data.data),
  reorder: (order) => api.patch('/testimonials/reorder', { order }),
  remove: (id) => api.delete(`/testimonials/${id}`),
};