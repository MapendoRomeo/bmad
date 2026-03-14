import { Request, Response } from 'express';
import * as elevesService from './eleves.service.js';
import { getPagination, paginatedResponse, getSearchFilter } from '../../utils/helpers.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

// ==================== GET ALL ====================

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const pagination = getPagination(req);
    const search = getSearchFilter(req);
    const filters = {
      statut: req.query.statut as string | undefined,
      classeId: req.query.classeId as string | undefined,
    };

    const { data, total } = await elevesService.getAll(etablissementId, pagination, search, filters);

    res.json(paginatedResponse(data, total, pagination.page, pagination.limit));
  } catch (error) {
    logger.error('Error fetching eleves:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== GET BY ID ====================

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const eleve = await elevesService.getById(id, etablissementId);

    res.json({ data: eleve });
  } catch (error) {
    if (error instanceof Error && error.message === 'ELEVE_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Eleve non trouvé',
        },
      });
      return;
    }

    logger.error('Error fetching eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== INSCRIRE ====================

export async function inscrire(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const eleve = await elevesService.inscrire(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'eleve',
      donneesApres: eleve as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: eleve });
  } catch (error) {
    if (error instanceof Error && error.message === 'CLASSE_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Classe souhaitée non trouvée',
        },
      });
      return;
    }

    logger.error('Error creating eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== ADMETTRE ====================

export async function admettre(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const eleve = await elevesService.admettre(id, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'eleve',
      donneesAvant: { statut: 'inscrit' },
      donneesApres: { statut: 'admis', numeroEleve: eleve.numeroEleve },
    });

    res.json({ data: eleve });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ELEVE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Eleve non trouvé',
          },
        });
        return;
      }

      if (error.message === 'STATUT_INVALID') {
        res.status(400).json({
          error: {
            code: 'STATUT_INVALID',
            message: "L'élève doit avoir le statut 'inscrit' pour être admis",
          },
        });
        return;
      }
    }

    logger.error('Error admitting eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== AFFECTER ====================

export async function affecter(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;
    const { classeId } = req.body;

    const affectation = await elevesService.affecter(id, classeId, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'affectation_eleve',
      donneesApres: affectation as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: affectation });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ELEVE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Eleve non trouvé',
          },
        });
        return;
      }

      if (error.message === 'ELEVE_NOT_ADMIS') {
        res.status(400).json({
          error: {
            code: 'ELEVE_NOT_ADMIS',
            message: "L'élève doit avoir le statut 'admis' pour être affecté à une classe",
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

      if (error.message === 'CLASSE_FULL') {
        res.status(409).json({
          error: {
            code: 'CLASSE_FULL',
            message: 'La classe a atteint son effectif maximum',
          },
        });
        return;
      }

      if (error.message === 'AFFECTATION_ACTIVE_EXISTS') {
        res.status(409).json({
          error: {
            code: 'AFFECTATION_ACTIVE_EXISTS',
            message: "L'élève a déjà une affectation active. Utilisez le transfert.",
          },
        });
        return;
      }
    }

    logger.error('Error assigning eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== TRANSFERER ====================

export async function transferer(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;
    const { classeId } = req.body;

    const affectation = await elevesService.transferer(id, classeId, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'affectation_eleve',
      donneesApres: affectation as unknown as Record<string, unknown>,
    });

    res.json({ data: affectation });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ELEVE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Eleve non trouvé',
          },
        });
        return;
      }

      if (error.message === 'CLASSE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Classe de destination non trouvée',
          },
        });
        return;
      }

      if (error.message === 'CLASSE_FULL') {
        res.status(409).json({
          error: {
            code: 'CLASSE_FULL',
            message: 'La classe de destination a atteint son effectif maximum',
          },
        });
        return;
      }

      if (error.message === 'NO_ACTIVE_AFFECTATION') {
        res.status(400).json({
          error: {
            code: 'NO_ACTIVE_AFFECTATION',
            message: "L'élève n'a aucune affectation active à transférer",
          },
        });
        return;
      }

      if (error.message === 'SAME_CLASSE') {
        res.status(400).json({
          error: {
            code: 'SAME_CLASSE',
            message: "L'élève est déjà dans cette classe",
          },
        });
        return;
      }
    }

    logger.error('Error transferring eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== DESINSCRIRE ====================

export async function desinscrire(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;
    const raison = req.body.raison as string | undefined;

    const eleve = await elevesService.desinscrire(id, etablissementId, raison);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'eleve',
      donneesApres: { statut: 'desinscrit', raison },
    });

    res.json({ data: eleve });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ELEVE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Eleve non trouvé',
          },
        });
        return;
      }

      if (error.message === 'ALREADY_DESINSCRIT') {
        res.status(400).json({
          error: {
            code: 'ALREADY_DESINSCRIT',
            message: "L'élève est déjà désinscrit",
          },
        });
        return;
      }

      if (error.message === 'SOLDE_IMPAYE') {
        res.status(409).json({
          error: {
            code: 'SOLDE_IMPAYE',
            message: "L'élève a un solde impayé. Veuillez régulariser avant la désinscription.",
          },
        });
        return;
      }
    }

    logger.error('Error unregistering eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== STATISTIQUES ====================

export async function getStatistiques(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const stats = await elevesService.getStatistiques(etablissementId);

    res.json({ data: stats });
  } catch (error) {
    logger.error('Error fetching statistiques eleves:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
