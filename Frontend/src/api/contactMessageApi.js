import api from '../services/api';

export const contactMessageApi = {
  // Public
  submit: (payload) =>
    api.post('/contact-messages', payload).then((r) => r.data),

  // Admin
  getAll: (params = {}) =>
    api.get('/contact-messages/admin', { params }).then((r) => r.data),
  getById: (id) =>
    api.get(`/contact-messages/admin/${id}`).then((r) => r.data.data),
  getUnreadCount: () =>
    api.get('/contact-messages/admin/unread-count').then((r) => r.data.data),
  updateStatus: (id, payload) =>
    api.patch(`/contact-messages/admin/${id}`, payload).then((r) => r.data.data),
  remove: (id) =>
    api.delete(`/contact-messages/admin/${id}`).then((r) => r.data),
};