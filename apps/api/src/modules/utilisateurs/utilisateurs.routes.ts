import { Router } from 'express';
import { createUtilisateurSchema, updateUtilisateurSchema } from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as utilisateursController from './utilisateurs.controller.js';

const router = Router();

// GET / - Lister les utilisateurs (directeur, admin)
router.get(
  '/',
  requireRole('directeur', 'admin'),
  utilisateursController.getAll,
);

// GET /:id - Obtenir un utilisateur par ID (directeur, admin)
router.get(
  '/:id',
  requireRole('directeur', 'admin'),
  utilisateursController.getById,
);

// POST / - Créer un utilisateur (directeur, admin)
router.post(
  '/',
  requireRole('directeur', 'admin'),
  validate(createUtilisateurSchema),
  utilisateursController.create,
);

// PUT /:id - Modifier un utilisateur (directeur, admin)
router.put(
  '/:id',
  requireRole('directeur', 'admin'),
  validate(updateUtilisateurSchema),
  utilisateursController.update,
);

// DELETE /:id - Supprimer (désactiver) un utilisateur (directeur, admin)
router.delete(
  '/:id',
  requireRole('directeur', 'admin'),
  utilisateursController.deleteUser,
);

export default router;
