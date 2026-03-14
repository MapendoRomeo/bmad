import { Router } from 'express';
import { requireRole } from '../../middleware/rbac.js';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

// GET /dashboard - Role-specific dashboard data (all authenticated users)
router.get(
  '/',
  dashboardController.getDashboard,
);

// GET /dashboard/alertes - Alerts for directeur/admin only
router.get(
  '/alertes',
  requireRole('directeur', 'admin'),
  dashboardController.getAlertes,
);

export default router;
