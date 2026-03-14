import api from './client';

export const elevesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/eleves', { params }),
  getById: (id: string) => api.get(`/eleves/${id}`),
  create: (data: Record<string, unknown>) => api.post('/eleves', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/eleves/${id}`, data),
  delete: (id: string) => api.delete(`/eleves/${id}`),
  admettre: (id: string) => api.put(`/eleves/${id}/admettre`),
  affecter: (id: string, classeId: string) => api.post(`/eleves/${id}/affecter`, { classeId }),
  transferer: (id: string, classeId: string) => api.post(`/eleves/${id}/transferer`, { classeId }),
  desinscrire: (id: string) => api.put(`/eleves/${id}/desinscrire`),
};
