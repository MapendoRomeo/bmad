import { Router } from 'express';
import { createClasseSchema } from '@sgs/shared';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import * as classesController from './classes.controller.js';

const router = Router();

router.get('/', classesController.getAll);
router.get('/:id', classesController.getById);
router.post('/', requireRole('directeur', 'admin'), validate(createClasseSchema), classesController.create);
router.put('/:id', requireRole('directeur', 'admin'), classesController.update);
router.get('/:id/eleves', classesController.getEleves);
router.get('/:id/enseignants', classesController.getEnseignants);

export default router;
