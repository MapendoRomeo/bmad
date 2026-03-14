import api from './client';

export const exportsApi = {
  exportEleves: (params?: Record<string, unknown>) => api.get('/exports/eleves', { params, responseType: 'blob' }),
  exportPaiements: (params?: Record<string, unknown>) => api.get('/exports/paiements', { params, responseType: 'blob' }),
  exportFactures: (params?: Record<string, unknown>) => api.get('/exports/factures', { params, responseType: 'blob' }),
};
