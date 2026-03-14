import { Request, Response } from 'express';
import * as etablissementsService from './etablissements.service.js';
import { getTenantFilter } from '../../middleware/tenant.js';
import { getPagination, paginatedResponse } from '../../utils/helpers.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

// ========== ETABLISSEMENT CONTROLLERS ==========

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { etablissementId } = getTenantFilter(req);
    const pagination = getPagination(req);

    const result = await etablissementsService.getAll(etablissementId, pagination);

    res.json(paginatedResponse(result.data, result.total, result.page, result.limit));
  } catch (error) {
    logger.error('Error fetching etablissements:', { error });
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

    const etablissement = await etablissementsService.getById(id);

    // Vérifier que l'utilisateur a accès à cet établissement
    if (etablissement.id !== etablissementId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Accès non autorisé à cet établissement',
        },
      });
      return;
    }

    res.json({ data: etablissement });
  } catch (error) {
    if (error instanceof Error && error.message === 'ETABLISSEMENT_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Établissement non trouvé',
        },
      });
      return;
    }

    logger.error('Error fetching etablissement:', { error });
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
    const etablissement = await etablissementsService.create(req.body);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'etablissement',
      donneesApres: etablissement as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: etablissement });
  } catch (error) {
    logger.error('Error creating etablissement:', { error });
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

    // Vérifier que l'utilisateur modifie son propre établissement
    if (id !== etablissementId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Accès non autorisé à cet établissement',
        },
      });
      return;
    }

    const result = await etablissementsService.update(id, req.body);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'etablissement',
      donneesAvant: result.avant as unknown as Record<string, unknown>,
      donneesApres: result.apres as unknown as Record<string, unknown>,
    });

    res.json({ data: result.apres });
  } catch (error) {
    if (error instanceof Error && error.message === 'ETABLISSEMENT_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Établissement non trouvé',
        },
      });
      return;
    }

    logger.error('Error updating etablissement:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ========== ANNEE SCOLAIRE CONTROLLERS ==========

export async function getAnneeScolaires(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { etablissementId } = getTenantFilter(req);

    // Vérifier l'accès tenant
    if (id !== etablissementId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Accès non autorisé à cet établissement',
        },
      });
      return;
    }

    const annees = await etablissementsService.getAnneeScolaires(etablissementId);

    res.json({ data: annees });
  } catch (error) {
    logger.error('Error fetching annees scolaires:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createAnneeScolaire(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { etablissementId } = getTenantFilter(req);

    // Vérifier l'accès tenant
    if (id !== etablissementId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Accès non autorisé à cet établissement',
        },
      });
      return;
    }

    const annee = await etablissementsService.createAnneeScolaire(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'annee_scolaire',
      donneesApres: annee as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: annee });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ANNEE_SCOLAIRE_ALREADY_EXISTS') {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Une année scolaire avec ce nom existe déjà',
          },
        });
        return;
      }

      if (error.message === 'INVALID_DATES') {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La date de fin doit être postérieure à la date de début',
          },
        });
        return;
      }
    }

    logger.error('Error creating annee scolaire:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function setAnneeScolaireActive(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { etablissementId } = getTenantFilter(req);

    const annee = await etablissementsService.setAnneeScolaireActive(id, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'annee_scolaire',
      donneesApres: { id: annee.id, active: true } as Record<string, unknown>,
    });

    res.json({ data: annee });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ANNEE_SCOLAIRE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Année scolaire non trouvée',
          },
        });
        return;
      }

      if (error.message === 'ANNEE_SCOLAIRE_ALREADY_ACTIVE') {
        res.status(400).json({
          error: {
            code: 'ALREADY_ACTIVE',
            message: 'Cette année scolaire est déjà active',
          },
        });
        return;
      }
    }

    logger.error('Error activating annee scolaire:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
