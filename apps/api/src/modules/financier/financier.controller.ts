import { Request, Response } from 'express';
import * as financierService from './financier.service.js';
import { getPagination, paginatedResponse } from '../../utils/helpers.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

// ==================== TYPES DE FRAIS ====================

export async function getTypesFrais(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const data = await financierService.getTypesFrais(etablissementId);

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching types de frais:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createTypeFrais(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const typeFrais = await financierService.createTypeFrais(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'type_frais',
      donneesApres: typeFrais as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: typeFrais });
  } catch (error) {
    if (error instanceof Error && error.message === 'TYPE_FRAIS_ALREADY_EXISTS') {
      res.status(409).json({
        error: {
          code: 'TYPE_FRAIS_ALREADY_EXISTS',
          message: 'Un type de frais avec ce nom existe déjà',
        },
      });
      return;
    }

    logger.error('Error creating type de frais:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function updateTypeFrais(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const typeFrais = await financierService.updateTypeFrais(id, req.body, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'type_frais',
      donneesApres: typeFrais as unknown as Record<string, unknown>,
    });

    res.json({ data: typeFrais });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TYPE_FRAIS_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Type de frais non trouvé',
          },
        });
        return;
      }

      if (error.message === 'TYPE_FRAIS_ALREADY_EXISTS') {
        res.status(409).json({
          error: {
            code: 'TYPE_FRAIS_ALREADY_EXISTS',
            message: 'Un type de frais avec ce nom existe déjà',
          },
        });
        return;
      }
    }

    logger.error('Error updating type de frais:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== MONTANTS FRAIS ====================

export async function getMontantsFrais(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const typeFraisId = req.query.typeFraisId as string | undefined;

    const data = await financierService.getMontantsFrais(etablissementId, typeFraisId);

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching montants frais:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createMontantFrais(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const montantFrais = await financierService.createMontantFrais(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'montant_frais',
      donneesApres: montantFrais as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: montantFrais });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TYPE_FRAIS_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Type de frais non trouvé',
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
    }

    logger.error('Error creating montant frais:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function updateMontantFrais(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const montantFrais = await financierService.updateMontantFrais(id, req.body, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'montant_frais',
      donneesApres: montantFrais as unknown as Record<string, unknown>,
    });

    res.json({ data: montantFrais });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'MONTANT_FRAIS_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Montant de frais non trouvé',
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
    }

    logger.error('Error updating montant frais:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== FACTURES ====================

export async function getFactures(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const pagination = getPagination(req);
    const filters = {
      eleveId: req.query.eleveId as string | undefined,
      statut: req.query.statut as string | undefined,
      periode: req.query.periode as string | undefined,
      typeFraisId: req.query.typeFraisId as string | undefined,
    };

    const { data, total } = await financierService.getFactures(
      etablissementId,
      pagination,
      filters,
    );

    res.json(paginatedResponse(data, total, pagination.page, pagination.limit));
  } catch (error) {
    logger.error('Error fetching factures:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getFacturesImpayees(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const pagination = getPagination(req);
    const filters = {
      eleveId: req.query.eleveId as string | undefined,
      periode: req.query.periode as string | undefined,
      typeFraisId: req.query.typeFraisId as string | undefined,
    };

    const { data, total } = await financierService.getFacturesImpayees(
      etablissementId,
      pagination,
      filters,
    );

    res.json(paginatedResponse(data, total, pagination.page, pagination.limit));
  } catch (error) {
    logger.error('Error fetching factures impayees:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getFactureById(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const facture = await financierService.getFactureById(id, etablissementId);

    res.json({ data: facture });
  } catch (error) {
    if (error instanceof Error && error.message === 'FACTURE_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Facture non trouvée',
        },
      });
      return;
    }

    logger.error('Error fetching facture:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createFacture(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const facture = await financierService.createFacture(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'facture',
      donneesApres: facture as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: facture });
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

      if (error.message === 'TYPE_FRAIS_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Type de frais non trouvé',
          },
        });
        return;
      }
    }

    logger.error('Error creating facture:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function updateFactureStatuts(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const result = await financierService.updateFactureStatuts(etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'facture',
      donneesApres: { action: 'batch_update_statuts', ...result },
    });

    res.json({ data: result });
  } catch (error) {
    logger.error('Error updating facture statuts:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== PAIEMENTS ====================

export async function getPaiements(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const pagination = getPagination(req);
    const filters = {
      eleveId: req.query.eleveId as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    };

    const { data, total } = await financierService.getPaiements(
      etablissementId,
      pagination,
      filters,
    );

    res.json(paginatedResponse(data, total, pagination.page, pagination.limit));
  } catch (error) {
    logger.error('Error fetching paiements:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createPaiement(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const paiement = await financierService.createPaiement(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'paiement',
      donneesApres: paiement as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: paiement });
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

      if (error.message === 'FACTURE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Une ou plusieurs factures non trouvées ou ne correspondent pas à cet élève',
          },
        });
        return;
      }
    }

    logger.error('Error creating paiement:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getRecu(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const recu = await financierService.getRecu(id, etablissementId);

    res.json({ data: recu });
  } catch (error) {
    if (error instanceof Error && error.message === 'PAIEMENT_NOT_FOUND') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Paiement non trouvé',
        },
      });
      return;
    }

    logger.error('Error generating recu:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== SOLDES & CREDITS ====================

export async function getSoldeEleve(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { eleveId } = req.params;

    const solde = await financierService.getSoldeEleve(eleveId, etablissementId);

    res.json({ data: solde });
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

    logger.error('Error fetching solde eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getCredits(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { eleveId } = req.params;

    const credits = await financierService.getCredits(eleveId, etablissementId);

    res.json({ data: credits });
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

    logger.error('Error fetching credits eleve:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== RAPPORTS ====================

export async function getRapportRecettes(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const typeFraisId = req.query.typeFraisId as string | undefined;

    const rapport = await financierService.getRapportRecettes(
      etablissementId,
      dateFrom,
      dateTo,
      typeFraisId,
    );

    res.json({ data: rapport });
  } catch (error) {
    logger.error('Error generating rapport recettes:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getStatistiquesFinancieres(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const stats = await financierService.getStatistiquesFinancieres(etablissementId);

    res.json({ data: stats });
  } catch (error) {
    logger.error('Error fetching statistiques financieres:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
