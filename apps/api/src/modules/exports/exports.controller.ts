import { Request, Response } from 'express';
import * as exportsService from './exports.service.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

// ==================== HELPERS ====================

function getExcelHeaders(filename: string): Record<string, string> {
  const date = new Date().toISOString().split('T')[0];
  return {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename=${filename}-${date}.xlsx`,
  };
}

// ==================== EXPORT ELEVES ====================

export async function exportEleves(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const filters = {
      statut: req.query.statut as string | undefined,
      classeId: req.query.classeId as string | undefined,
    };

    const buffer = await exportsService.exportEleves(etablissementId, filters);

    await logAudit({
      req,
      action: 'READ',
      ressource: 'export_eleves',
      donneesApres: { filters },
    });

    const headers = getExcelHeaders('eleves');
    res.set(headers);
    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting eleves:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue lors de l\'export',
      },
    });
  }
}

// ==================== EXPORT PAIEMENTS ====================

export async function exportPaiements(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const filters = {
      dateDebut: req.query.dateDebut as string | undefined,
      dateFin: req.query.dateFin as string | undefined,
      eleveId: req.query.eleveId as string | undefined,
    };

    const buffer = await exportsService.exportPaiements(etablissementId, filters);

    await logAudit({
      req,
      action: 'READ',
      ressource: 'export_paiements',
      donneesApres: { filters },
    });

    const headers = getExcelHeaders('paiements');
    res.set(headers);
    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting paiements:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue lors de l\'export',
      },
    });
  }
}

// ==================== EXPORT FACTURES ====================

export async function exportFactures(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const filters = {
      statut: req.query.statut as string | undefined,
      dateDebut: req.query.dateDebut as string | undefined,
      dateFin: req.query.dateFin as string | undefined,
      eleveId: req.query.eleveId as string | undefined,
    };

    const buffer = await exportsService.exportFactures(etablissementId, filters);

    await logAudit({
      req,
      action: 'READ',
      ressource: 'export_factures',
      donneesApres: { filters },
    });

    const headers = getExcelHeaders('factures');
    res.set(headers);
    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting factures:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue lors de l\'export',
      },
    });
  }
}
