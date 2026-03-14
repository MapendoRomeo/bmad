import { Router } from 'express';
import { createEnseignantSchema, affectationEnseignantSchema } from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as enseignantsController from './enseignants.controller.js';

const router = Router();

router.get('/', enseignantsController.getAll);
router.get('/:id', enseignantsController.getById);
router.post('/', requireRole('directeur', 'admin'), validate(createEnseignantSchema), enseignantsController.create);
router.put('/:id', requireRole('directeur', 'admin'), enseignantsController.update);
router.delete('/:id', requireRole('directeur', 'admin'), enseignantsController.remove);
router.post('/:id/affectation', requireRole('directeur', 'admin'), validate(affectationEnseignantSchema), enseignantsController.affecter);
router.get('/:id/affectations', enseignantsController.getAffectations);

export default router;
