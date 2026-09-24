import api from '../services/api';

export const categoryApi = {
  // Public
  getActive: () => api.get('/categories').then((r) => r.data.data),

  // Admin
  getAll: () => api.get('/categories/admin').then((r) => r.data.data),
  getById: (id) => api.get(`/categories/admin/${id}`).then((r) => r.data.data),

  create: (fd) =>
    api.post('/categories', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data),

  update: (id, fd) =>
    api.put(`/categories/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data),

  toggle: (id) => api.patch(`/categories/${id}/toggle`).then((r) => r.data.data),
  reorder: (order) => api.patch('/categories/reorder', { order }),
  remove: (id) => api.delete(`/categories/${id}`),
};