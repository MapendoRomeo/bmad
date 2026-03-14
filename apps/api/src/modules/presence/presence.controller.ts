import { Request, Response } from 'express';
import * as presenceService from './presence.service.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

// ==================== ENREGISTRER PRESENCE ====================

export async function enregistrerPresence(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { classeId, date, presences } = req.body;

    const result = await presenceService.enregistrerPresence(
      classeId,
      date,
      presences,
      etablissementId,
    );

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'presence',
      donneesApres: { classeId, date, count: result.length },
    });

    res.status(201).json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ELEVE_NOT_IN_CLASSE') {
        res.status(400).json({
          error: {
            code: 'ELEVE_NOT_IN_CLASSE',
            message: "Un ou plusieurs élèves ne sont pas affectés à cette classe",
          },
        });
        return;
      }
    }

    logger.error('Error recording presence:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== GET PRESENCES ====================

export async function getPresences(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { classeId } = req.params;
    const date = req.query.date as string;

    if (!date) {
      res.status(400).json({
        error: {
          code: 'DATE_REQUIRED',
          message: 'Le paramètre date est requis',
        },
      });
      return;
    }

    const presences = await presenceService.getPresences(classeId, date, etablissementId);

    res.json({ data: presences });
  } catch (error) {
    logger.error('Error fetching presences:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== GET ABSENTS ====================

export async function getAbsents(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { classeId } = req.params;
    const date = req.query.date as string;

    if (!date) {
      res.status(400).json({
        error: {
          code: 'DATE_REQUIRED',
          message: 'Le paramètre date est requis',
        },
      });
      return;
    }

    const absents = await presenceService.getAbsents(classeId, date, etablissementId);

    res.json({ data: absents });
  } catch (error) {
    logger.error('Error fetching absents:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== STATISTIQUES ELEVE ====================

export async function getStatistiquesEleve(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { eleveId } = req.params;
    const periodeDebut = req.query.periodeDebut as string | undefined;
    const periodeFin = req.query.periodeFin as string | undefined;

    const stats = await presenceService.getStatistiquesEleve(
      eleveId,
      etablissementId,
      periodeDebut,
      periodeFin,
    );

    res.json({ data: stats });
  } catch (error) {
    logger.error('Error fetching student presence stats:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== STATISTIQUES CLASSE ====================

export async function getStatistiquesClasse(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { classeId } = req.params;
    const periodeDebut = req.query.periodeDebut as string | undefined;
    const periodeFin = req.query.periodeFin as string | undefined;

    const stats = await presenceService.getStatistiquesClasse(
      classeId,
      etablissementId,
      periodeDebut,
      periodeFin,
    );

    res.json({ data: stats });
  } catch (error) {
    logger.error('Error fetching class presence stats:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
