import api from '../services/api';

export const productApi = {
  // Public
  getBestsellers: (limit = 8) =>
    api.get('/products/bestsellers', { params: { limit } }).then((r) => r.data.data),

  getNewArrivals: (limit = 8) =>
    api.get('/products/new-arrivals', { params: { limit } }).then((r) => r.data.data),

  // Admin
  toggleBestseller: (id) =>
    api.patch(`/products/admin/products/${id}/toggle-bestseller`).then((r) => r.data.data),

  toggleNewArrival: (id) =>
    api.patch(`/products/admin/products/${id}/toggle-new-arrival`).then((r) => r.data.data),

  reorderBestsellers: (order) =>
    api.patch('/products/admin/products/reorder-bestsellers', { order }).then((r) => r.data),

  // Existing product endpoints
  getProducts: (params = {}) =>
    api.get('/products', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/products/${id}`).then((r) => r.data),
};