import api from './client';

export const dashboardApi = {
  getData: () => api.get('/dashboard'),
  getAlerts: () => api.get('/dashboard/alertes'),
};
