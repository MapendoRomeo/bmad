import api from './client';

export const classesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/classes', { params }),
  getById: (id: string) => api.get(`/classes/${id}`),
  create: (data: Record<string, unknown>) => api.post('/classes', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getEleves: (id: string) => api.get(`/classes/${id}/eleves`),
  getEnseignants: (id: string) => api.get(`/classes/${id}/enseignants`),
};
