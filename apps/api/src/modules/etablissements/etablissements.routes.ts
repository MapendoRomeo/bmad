import { Router } from 'express';
import { createEtablissementSchema, createAnneeScolaireSchema } from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as etablissementsController from './etablissements.controller.js';

const router = Router();

// GET / - Lister les établissements (directeur, admin)
router.get(
  '/',
  requireRole('directeur', 'admin'),
  etablissementsController.getAll,
);

// GET /:id - Obtenir un établissement par ID
router.get(
  '/:id',
  etablissementsController.getById,
);

// POST / - Créer un établissement (directeur uniquement)
router.post(
  '/',
  requireRole('directeur'),
  validate(createEtablissementSchema),
  etablissementsController.create,
);

// PUT /:id - Modifier un établissement (directeur, admin)
router.put(
  '/:id',
  requireRole('directeur', 'admin'),
  etablissementsController.update,
);

// GET /:id/annees-scolaires - Lister les années scolaires
router.get(
  '/:id/annees-scolaires',
  etablissementsController.getAnneeScolaires,
);

// POST /:id/annees-scolaires - Créer une année scolaire (directeur, admin)
router.post(
  '/:id/annees-scolaires',
  requireRole('directeur', 'admin'),
  validate(createAnneeScolaireSchema),
  etablissementsController.createAnneeScolaire,
);

// PUT /annees-scolaires/:id/activer - Activer une année scolaire (directeur)
router.put(
  '/annees-scolaires/:id/activer',
  requireRole('directeur'),
  etablissementsController.setAnneeScolaireActive,
);

export default router;
