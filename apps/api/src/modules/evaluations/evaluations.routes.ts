import { Router } from 'express';
import {
  createPeriodeSchema,
  createMatiereSchema,
  createNoteSchema,
  createEvalQualitativeSchema,
} from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as evaluationsController from './evaluations.controller.js';

const router = Router();

// ==================== PERIODES ====================

// GET /evaluations/periodes - List periods
router.get(
  '/periodes',
  evaluationsController.getPeriodes,
);

// POST /evaluations/periodes - Create a period
router.post(
  '/periodes',
  requireRole('directeur', 'admin'),
  validate(createPeriodeSchema),
  evaluationsController.createPeriode,
);

// ==================== MATIERES ====================

// GET /evaluations/matieres - List subjects
router.get(
  '/matieres',
  evaluationsController.getMatieres,
);

// POST /evaluations/matieres - Create a subject
router.post(
  '/matieres',
  requireRole('directeur', 'admin'),
  validate(createMatiereSchema),
  evaluationsController.createMatiere,
);

// GET /evaluations/matieres/suggestions - Get suggested subjects for a level
router.get(
  '/matieres/suggestions',
  evaluationsController.getSuggestedMatieres,
);

// ==================== NOTES ====================

// GET /evaluations/notes - List notes for a class+subject+period
router.get(
  '/notes',
  requireRole('directeur', 'admin', 'enseignant'),
  evaluationsController.getNotes,
);

// POST /evaluations/notes - Create a note
router.post(
  '/notes',
  requireRole('directeur', 'admin', 'enseignant'),
  validate(createNoteSchema),
  evaluationsController.createNote,
);

// POST /evaluations/notes/:id/valider - Validate a note
router.post(
  '/notes/:id/valider',
  requireRole('directeur', 'admin', 'enseignant'),
  evaluationsController.validerNote,
);

// POST /evaluations/notes/:id/rattrapage - Schedule a makeup evaluation
router.post(
  '/notes/:id/rattrapage',
  requireRole('directeur', 'admin', 'enseignant'),
  evaluationsController.createRattrapage,
);

// POST /evaluations/rattrapages/:id/note - Enter makeup grade
router.post(
  '/rattrapages/:id/note',
  requireRole('directeur', 'admin', 'enseignant'),
  evaluationsController.saisirNoteRattrapage,
);

// ==================== MOYENNES ====================

// POST /evaluations/moyennes/calculer - Calculate averages for a student in a period
router.post(
  '/moyennes/calculer',
  requireRole('directeur', 'admin', 'enseignant'),
  evaluationsController.calculerMoyennes,
);

// GET /evaluations/moyennes/:eleveId - Get averages for a student
router.get(
  '/moyennes/:eleveId',
  evaluationsController.getMoyennes,
);

// ==================== EVALUATIONS QUALITATIVES ====================

// GET /evaluations/qualitatives - List qualitative evaluations
router.get(
  '/qualitatives',
  evaluationsController.getEvaluationsQualitatives,
);

// POST /evaluations/qualitatives - Create a qualitative evaluation
router.post(
  '/qualitatives',
  requireRole('directeur', 'admin', 'enseignant'),
  validate(createEvalQualitativeSchema),
  evaluationsController.createEvalQualitative,
);

// ==================== BULLETIN ====================

// GET /evaluations/bulletin/:eleveId/:periodeId - Generate report card
router.get(
  '/bulletin/:eleveId/:periodeId',
  evaluationsController.getBulletin,
);

export default router;
