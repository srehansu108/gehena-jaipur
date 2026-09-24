import api from '../services/api';

export const aboutPageApi = {
  // Public
  get: () => api.get('/pages/about').then((r) => r.data.data),

  // Admin
  getAdmin: () => api.get('/pages/about/admin').then((r) => r.data.data),
  save: (payload) => api.put('/pages/about', payload).then((r) => r.data.data),
  reset: () => api.post('/pages/about/reset').then((r) => r.data.data),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', 'about-page');
    return api
      .post('/pages/about/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },
};