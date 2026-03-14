import { Router } from 'express';
import {
  createTypeFraisSchema,
  createMontantFraisSchema,
  createFactureSchema,
  createPaiementSchema,
} from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as financierController from './financier.controller.js';

const router = Router();

// ==================== TYPES DE FRAIS ====================

// GET /financier/types-frais - List all fee types
router.get(
  '/types-frais',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getTypesFrais,
);

// POST /financier/types-frais - Create a fee type
router.post(
  '/types-frais',
  requireRole('directeur', 'admin', 'comptable'),
  validate(createTypeFraisSchema),
  financierController.createTypeFrais,
);

// PUT /financier/types-frais/:id - Update a fee type
router.put(
  '/types-frais/:id',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.updateTypeFrais,
);

// ==================== MONTANTS FRAIS ====================

// GET /financier/montants-frais - List fee amounts (optional filter: typeFraisId)
router.get(
  '/montants-frais',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getMontantsFrais,
);

// POST /financier/montants-frais - Create a fee amount
router.post(
  '/montants-frais',
  requireRole('directeur', 'admin', 'comptable'),
  validate(createMontantFraisSchema),
  financierController.createMontantFrais,
);

// PUT /financier/montants-frais/:id - Update a fee amount
router.put(
  '/montants-frais/:id',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.updateMontantFrais,
);

// ==================== FACTURES ====================

// GET /financier/factures - List invoices (paginated, filterable)
router.get(
  '/factures',
  requireRole('directeur', 'admin', 'comptable', 'secretaire'),
  financierController.getFactures,
);

// GET /financier/factures/impayees - List unpaid invoices
router.get(
  '/factures/impayees',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getFacturesImpayees,
);

// GET /financier/factures/:id - Get invoice details
router.get(
  '/factures/:id',
  requireRole('directeur', 'admin', 'comptable', 'secretaire'),
  financierController.getFactureById,
);

// POST /financier/factures - Create an invoice
router.post(
  '/factures',
  requireRole('directeur', 'admin', 'comptable'),
  validate(createFactureSchema),
  financierController.createFacture,
);

// POST /financier/factures/update-statuts - Batch update overdue invoice statuses
router.post(
  '/factures/update-statuts',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.updateFactureStatuts,
);

// ==================== PAIEMENTS ====================

// GET /financier/paiements - List payments (paginated, filterable)
router.get(
  '/paiements',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getPaiements,
);

// POST /financier/paiements - Create a payment with invoice distribution
router.post(
  '/paiements',
  requireRole('directeur', 'admin', 'comptable'),
  validate(createPaiementSchema),
  financierController.createPaiement,
);

// GET /financier/paiements/:id/recu - Generate payment receipt
router.get(
  '/paiements/:id/recu',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getRecu,
);

// ==================== SOLDES & CREDITS ====================

// GET /financier/eleves/:eleveId/solde - Get student balance
router.get(
  '/eleves/:eleveId/solde',
  requireRole('directeur', 'admin', 'comptable', 'secretaire'),
  financierController.getSoldeEleve,
);

// GET /financier/eleves/:eleveId/credits - List student credits
router.get(
  '/eleves/:eleveId/credits',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getCredits,
);

// ==================== RAPPORTS ====================

// GET /financier/rapports/recettes - Revenue report by fee type
router.get(
  '/rapports/recettes',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getRapportRecettes,
);

// GET /financier/rapports/statistiques - Financial statistics overview
router.get(
  '/rapports/statistiques',
  requireRole('directeur', 'admin', 'comptable'),
  financierController.getStatistiquesFinancieres,
);

export default router;
