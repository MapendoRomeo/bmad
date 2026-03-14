import api from './client';

export const evaluationsApi = {
  // Periodes
  getPeriodes: (params?: Record<string, unknown>) => api.get('/evaluations/periodes', { params }),
  createPeriode: (data: Record<string, unknown>) => api.post('/evaluations/periodes', data),
  updatePeriode: (id: string, data: Record<string, unknown>) => api.put(`/evaluations/periodes/${id}`, data),
  // Matieres
  getMatieres: (params?: Record<string, unknown>) => api.get('/evaluations/matieres', { params }),
  createMatiere: (data: Record<string, unknown>) => api.post('/evaluations/matieres', data),
  // Notes
  getNotes: (params: Record<string, unknown>) => api.get('/evaluations/notes', { params }),
  saisirNotes: (data: Record<string, unknown>) => api.post('/evaluations/notes', data),
  validerNotes: (data: { classeId: string; matiereId: string; periodeId: string }) => api.post('/evaluations/notes/valider', data),
  // Moyennes
  getMoyennes: (params: Record<string, unknown>) => api.get('/evaluations/moyennes', { params }),
  calculerMoyennes: (data: Record<string, unknown>) => api.post('/evaluations/moyennes/calculer', data),
  // Bulletins
  genererBulletin: (eleveId: string, periodeId: string) => api.get(`/evaluations/bulletins/${eleveId}/${periodeId}`),
  // Qualitatives
  getQualitatives: (params: Record<string, unknown>) => api.get('/evaluations/qualitatives', { params }),
  saisirQualitatives: (data: Record<string, unknown>) => api.post('/evaluations/qualitatives', data),
};
