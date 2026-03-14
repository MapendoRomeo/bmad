import api from './client';

export const etablissementsApi = {
  get: (id: string) => api.get(`/etablissements/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/etablissements/${id}`, data),
  getAnneesScolaires: (etabId: string) => api.get(`/etablissements/${etabId}/annees-scolaires`),
  createAnneeScolaire: (etabId: string, data: Record<string, unknown>) => api.post(`/etablissements/${etabId}/annees-scolaires`, data),
  activerAnnee: (anneeId: string) => api.put(`/etablissements/annees-scolaires/${anneeId}/activer`),
};
