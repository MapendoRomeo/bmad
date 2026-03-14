import api from './client';

export const authApi = {
  login: (data: { email: string; motDePasse: string }) => api.post('/auth/login', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, motDePasse: string) => api.post('/auth/reset-password', { token, motDePasse }),
  me: () => api.get('/auth/me'),
};
