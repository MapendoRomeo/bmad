import api from './client';

export const presenceApi = {
  getByClasse: (classeId: string, date: string) => api.get('/presence', { params: { classeId, date } }),
  enregistrer: (data: { classeId: string; date: string; presences: Array<{ eleveId: string; statut: string; motif?: string }> }) =>
    api.post('/presence', data),
  getStatistiques: (params: Record<string, unknown>) => api.get('/presence/statistiques', { params }),
};
