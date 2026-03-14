import api from './client';

export const financierApi = {
  // Types de frais
  getTypesFrais: () => api.get('/financier/types-frais'),
  createTypeFrais: (data: Record<string, unknown>) => api.post('/financier/types-frais', data),
  updateTypeFrais: (id: string, data: Record<string, unknown>) => api.put(`/financier/types-frais/${id}`, data),
  // Montants
  getMontants: (params?: Record<string, unknown>) => api.get('/financier/montants', { params }),
  setMontant: (data: Record<string, unknown>) => api.post('/financier/montants', data),
  // Factures
  getFactures: (params?: Record<string, unknown>) => api.get('/financier/factures', { params }),
  getFacture: (id: string) => api.get(`/financier/factures/${id}`),
  genererFactures: (data: Record<string, unknown>) => api.post('/financier/factures/generer', data),
  createFacture: (data: Record<string, unknown>) => api.post('/financier/factures', data),
  // Paiements
  getPaiements: (params?: Record<string, unknown>) => api.get('/financier/paiements', { params }),
  enregistrerPaiement: (data: Record<string, unknown>) => api.post('/financier/paiements', data),
  // Soldes
  getSoldes: (params?: Record<string, unknown>) => api.get('/financier/soldes', { params }),
  // Rapports
  getRapports: (params?: Record<string, unknown>) => api.get('/financier/rapports', { params }),
};
