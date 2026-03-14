import { Router } from 'express';
import { createPresenceSchema } from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as presenceController from './presence.controller.js';

const router = Router();

// POST /presence - Record attendance for a class
router.post(
  '/',
  requireRole('directeur', 'admin', 'enseignant'),
  validate(createPresenceSchema),
  presenceController.enregistrerPresence,
);

// GET /presence/classe/:classeId - Get attendance for a class on a date
router.get(
  '/classe/:classeId',
  presenceController.getPresences,
);

// GET /presence/classe/:classeId/absents - Get absent students for a class on a date
router.get(
  '/classe/:classeId/absents',
  presenceController.getAbsents,
);

// GET /presence/eleve/:eleveId/statistiques - Get attendance stats for a student
router.get(
  '/eleve/:eleveId/statistiques',
  presenceController.getStatistiquesEleve,
);

// GET /presence/classe/:classeId/statistiques - Get attendance stats for a class
router.get(
  '/classe/:classeId/statistiques',
  presenceController.getStatistiquesClasse,
);

export default router;
