import api from './client';

export const utilisateursApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/utilisateurs', { params }),
  getById: (id: string) => api.get(`/utilisateurs/${id}`),
  create: (data: Record<string, unknown>) => api.post('/utilisateurs', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/utilisateurs/${id}`, data),
  delete: (id: string) => api.delete(`/utilisateurs/${id}`),
};
