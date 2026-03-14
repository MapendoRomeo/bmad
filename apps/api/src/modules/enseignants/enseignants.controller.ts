import { Request, Response } from 'express';
import * as enseignantsService from './enseignants.service.js';
import { getPagination, paginatedResponse, getSearchFilter } from '../../utils/helpers.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const pagination = getPagination(req);
    const search = getSearchFilter(req);

    const { data, total } = await enseignantsService.getAll(etablissementId, pagination, search);

    res.json(paginatedResponse(data, total, pagination.page, pagination.limit));
  } catch (error) {
    logger.error('Error fetching enseignants:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const enseignant = await enseignantsService.getById(id, etablissementId);

    if (!enseignant) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Enseignant non trouvé',
        },
      });
      return;
    }

    res.json({ data: enseignant });
  } catch (error) {
    logger.error('Error fetching enseignant:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const enseignant = await enseignantsService.create(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: `enseignant:${enseignant.id}`,
      donneesApres: enseignant as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: enseignant });
  } catch (error) {
    if (error instanceof Error && error.message === 'ENSEIGNANT_EMAIL_EXISTS') {
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Un enseignant avec cet email existe déjà dans cet établissement',
        },
      });
      return;
    }

    logger.error('Error creating enseignant:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const enseignant = await enseignantsService.update(id, req.body, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: `enseignant:${enseignant.id}`,
      donneesApres: enseignant as unknown as Record<string, unknown>,
    });

    res.json({ data: enseignant });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ENSEIGNANT_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Enseignant non trouvé',
          },
        });
        return;
      }

      if (error.message === 'ENSEIGNANT_EMAIL_EXISTS') {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Un enseignant avec cet email existe déjà dans cet établissement',
          },
        });
        return;
      }
    }

    logger.error('Error updating enseignant:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const enseignant = await enseignantsService.softDelete(id, etablissementId);

    await logAudit({
      req,
      action: 'DELETE',
      ressource: `enseignant:${id}`,
      donneesApres: enseignant as unknown as Record<string, unknown>,
    });

    res.json({ message: 'Enseignant supprimé avec succès' });
  } catch (error) {
    if (error instanceof Error && error.message === 'ENSEIGNANT_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Enseignant non trouvé',
        },
      });
      return;
    }

    logger.error('Error deleting enseignant:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function affecter(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id: enseignantId } = req.params;
    const { classeId, matiereId } = req.body;

    const affectation = await enseignantsService.affecter(
      enseignantId,
      classeId,
      matiereId,
      etablissementId,
    );

    await logAudit({
      req,
      action: 'CREATE',
      ressource: `affectation-enseignant:${affectation.id}`,
      donneesApres: affectation as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: affectation });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ENSEIGNANT_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Enseignant non trouvé',
          },
        });
        return;
      }

      if (error.message === 'CLASSE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Classe non trouvée',
          },
        });
        return;
      }

      if (error.message === 'AFFECTATION_ALREADY_EXISTS') {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Cet enseignant est déjà affecté à cette classe pour cette matière',
          },
        });
        return;
      }
    }

    logger.error('Error creating affectation enseignant:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getAffectations(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id: enseignantId } = req.params;

    const affectations = await enseignantsService.getAffectations(enseignantId, etablissementId);

    res.json({ data: affectations });
  } catch (error) {
    if (error instanceof Error && error.message === 'ENSEIGNANT_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Enseignant non trouvé',
        },
      });
      return;
    }

    logger.error('Error fetching affectations enseignant:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
