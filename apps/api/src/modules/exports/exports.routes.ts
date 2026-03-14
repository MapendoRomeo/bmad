import { Router } from 'express';
import { requireRole } from '../../middleware/rbac.js';
import * as exportsController from './exports.controller.js';

const router = Router();

// GET /exports/eleves - Export students to Excel
router.get(
  '/eleves',
  requireRole('directeur', 'admin', 'secretaire'),
  exportsController.exportEleves,
);

// GET /exports/paiements - Export payments to Excel
router.get(
  '/paiements',
  requireRole('directeur', 'admin', 'comptable'),
  exportsController.exportPaiements,
);

// GET /exports/factures - Export invoices to Excel
router.get(
  '/factures',
  requireRole('directeur', 'admin', 'comptable'),
  exportsController.exportFactures,
);

export default router;
