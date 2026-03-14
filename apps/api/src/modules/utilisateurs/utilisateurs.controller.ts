import { Request, Response } from 'express';
import * as utilisateursService from './utilisateurs.service.js';
import { getTenantFilter } from '../../middleware/tenant.js';
import { getPagination, paginatedResponse, getSearchFilter } from '../../utils/helpers.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { etablissementId } = getTenantFilter(req);
    const pagination = getPagination(req);
    const search = getSearchFilter(req);

    const result = await utilisateursService.getAll(etablissementId, pagination, search);

    res.json(paginatedResponse(result.data, result.total, result.page, result.limit));
  } catch (error) {
    logger.error('Error fetching utilisateurs:', { error });
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
    const { id } = req.params;
    const { etablissementId } = getTenantFilter(req);

    const utilisateur = await utilisateursService.getById(id, etablissementId);

    res.json({ data: utilisateur });
  } catch (error) {
    if (error instanceof Error && error.message === 'UTILISATEUR_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        },
      });
      return;
    }

    logger.error('Error fetching utilisateur:', { error });
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
    const { etablissementId } = getTenantFilter(req);

    const utilisateur = await utilisateursService.create(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'utilisateur',
      donneesApres: utilisateur as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: utilisateur });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Un utilisateur avec cet email existe déjà dans cet établissement',
          },
        });
        return;
      }
    }

    logger.error('Error creating utilisateur:', { error });
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
    const { id } = req.params;
    const { etablissementId } = getTenantFilter(req);
    const currentUserRole = req.user!.role;

    const result = await utilisateursService.update(id, req.body, etablissementId, currentUserRole);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'utilisateur',
      donneesAvant: result.avant as unknown as Record<string, unknown>,
      donneesApres: result.apres as unknown as Record<string, unknown>,
    });

    res.json({ data: result.apres });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UTILISATEUR_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Utilisateur non trouvé',
          },
        });
        return;
      }

      if (error.message === 'CANNOT_MODIFY_HIGHER_ROLE') {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez pas modifier un utilisateur avec un rôle supérieur',
          },
        });
        return;
      }

      if (error.message === 'CANNOT_ASSIGN_HIGHER_ROLE') {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez pas attribuer ce rôle',
          },
        });
        return;
      }

      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Un utilisateur avec cet email existe déjà dans cet établissement',
          },
        });
        return;
      }
    }

    logger.error('Error updating utilisateur:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { etablissementId } = getTenantFilter(req);
    const currentUserRole = req.user!.role;

    const result = await utilisateursService.deleteUser(id, etablissementId, currentUserRole);

    await logAudit({
      req,
      action: 'DELETE',
      ressource: 'utilisateur',
      donneesAvant: result.avant as unknown as Record<string, unknown>,
      donneesApres: result.apres as unknown as Record<string, unknown>,
    });

    res.json({ data: result.apres, message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UTILISATEUR_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Utilisateur non trouvé',
          },
        });
        return;
      }

      if (error.message === 'CANNOT_DELETE_HIGHER_ROLE') {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez pas supprimer un utilisateur avec un rôle supérieur',
          },
        });
        return;
      }
    }

    logger.error('Error deleting utilisateur:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
