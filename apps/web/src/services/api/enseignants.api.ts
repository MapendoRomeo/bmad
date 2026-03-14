import api from './client';

export const enseignantsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/enseignants', { params }),
  getById: (id: string) => api.get(`/enseignants/${id}`),
  create: (data: Record<string, unknown>) => api.post('/enseignants', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/enseignants/${id}`, data),
  delete: (id: string) => api.delete(`/enseignants/${id}`),
  affecter: (id: string, data: { classeId: string; matiereId?: string }) => api.post(`/enseignants/${id}/affecter`, data),
};
