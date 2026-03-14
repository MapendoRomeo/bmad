import { Request, Response } from 'express';
import * as classesService from './classes.service.js';
import { getPagination, paginatedResponse } from '../../utils/helpers.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const pagination = getPagination(req);
    const filters = {
      niveau: req.query.niveau as string | undefined,
      anneeScolaireId: req.query.anneeScolaireId as string | undefined,
    };

    const { data, total } = await classesService.getAll(etablissementId, pagination, filters);

    res.json(paginatedResponse(data, total, pagination.page, pagination.limit));
  } catch (error) {
    logger.error('Error fetching classes:', { error });
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

    const classe = await classesService.getById(id, etablissementId);

    if (!classe) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Classe non trouvée',
        },
      });
      return;
    }

    res.json({ data: classe });
  } catch (error) {
    logger.error('Error fetching classe:', { error });
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

    const classe = await classesService.create(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: `classe:${classe.id}`,
      donneesApres: classe as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: classe });
  } catch (error) {
    if (error instanceof Error && error.message === 'CLASSE_ALREADY_EXISTS') {
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Une classe avec ce nom existe déjà pour cette année scolaire',
        },
      });
      return;
    }

    logger.error('Error creating classe:', { error });
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

    const classe = await classesService.update(id, req.body, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: `classe:${classe.id}`,
      donneesApres: classe as unknown as Record<string, unknown>,
    });

    res.json({ data: classe });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'CLASSE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Classe non trouvée',
          },
        });
        return;
      }

      if (error.message === 'EFFECTIF_MAX_BELOW_CURRENT') {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: "L'effectif maximum ne peut pas être inférieur à l'effectif actuel",
          },
        });
        return;
      }

      if (error.message === 'CLASSE_ALREADY_EXISTS') {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Une classe avec ce nom existe déjà pour cette année scolaire',
          },
        });
        return;
      }
    }

    logger.error('Error updating classe:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getEleves(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const eleves = await classesService.getEleves(id, etablissementId);

    res.json({ data: eleves });
  } catch (error) {
    if (error instanceof Error && error.message === 'CLASSE_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Classe non trouvée',
        },
      });
      return;
    }

    logger.error('Error fetching eleves for classe:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getEnseignants(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const enseignants = await classesService.getEnseignants(id, etablissementId);

    res.json({ data: enseignants });
  } catch (error) {
    if (error instanceof Error && error.message === 'CLASSE_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Classe non trouvée',
        },
      });
      return;
    }

    logger.error('Error fetching enseignants for classe:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
