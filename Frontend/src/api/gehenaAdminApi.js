// client/src/api/gehenaAdminApi.js
import axios from 'axios';
import { ADMIN_TOKEN_KEY } from './adminApi';

const GEHENA_ADMIN_API = 'http://localhost:8000/api/v1/gehena-admin';

const gehenaAdminApi = axios.create({
  baseURL: GEHENA_ADMIN_API,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

gehenaAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

gehenaAdminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const message = String(error.response?.data?.message || '').toLowerCase();
      const isRealAuth =
        !message.includes('does not match') && !message.includes('no match');
      if (isRealAuth) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        if (!window.location.pathname.startsWith('/admin/gehena/login')) {
          window.location.href = '/admin/gehena/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default gehenaAdminApi;