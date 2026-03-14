import { Router } from 'express';
import { createEleveSchema, affectationEleveSchema } from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as elevesController from './eleves.controller.js';

const router = Router();

// GET /eleves - List all students (paginated, searchable, filterable)
router.get(
  '/',
  requireRole('directeur', 'admin', 'secretaire'),
  elevesController.getAll,
);

// GET /eleves/statistiques - Student counts by statut
router.get(
  '/statistiques',
  requireRole('directeur', 'admin', 'secretaire'),
  elevesController.getStatistiques,
);

// GET /eleves/:id - Get student details with parents and current affectation
router.get(
  '/:id',
  requireRole('directeur', 'admin', 'secretaire', 'enseignant'),
  elevesController.getById,
);

// POST /eleves/inscription - Register a new student
router.post(
  '/inscription',
  requireRole('directeur', 'admin', 'secretaire'),
  validate(createEleveSchema),
  elevesController.inscrire,
);

// POST /eleves/:id/admission - Admit a student (inscrit -> admis)
router.post(
  '/:id/admission',
  requireRole('directeur', 'secretaire'),
  elevesController.admettre,
);

// POST /eleves/:id/affectation - Assign a student to a class
router.post(
  '/:id/affectation',
  requireRole('directeur', 'admin', 'secretaire'),
  validate(affectationEleveSchema),
  elevesController.affecter,
);

// POST /eleves/:id/transfert - Transfer a student to a different class
router.post(
  '/:id/transfert',
  requireRole('directeur', 'admin', 'secretaire'),
  validate(affectationEleveSchema),
  elevesController.transferer,
);

// POST /eleves/:id/desinscription - Unregister a student
router.post(
  '/:id/desinscription',
  requireRole('directeur', 'admin', 'secretaire'),
  elevesController.desinscrire,
);

export default router;
