import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service.js';
import logger from '../../config/logger.js';

// ==================== GET DASHBOARD ====================

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const role = req.user!.role;
    const userId = req.user!.userId;

    const data = await dashboardService.getDashboardData(etablissementId, role, userId);

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching dashboard:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== GET ALERTES ====================

export async function getAlertes(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const alertes = await dashboardService.getAlertes(etablissementId);

    res.json({ data: alertes });
  } catch (error) {
    logger.error('Error fetching alertes:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
