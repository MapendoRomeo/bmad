import { Request, Response } from 'express';
import * as evaluationsService from './evaluations.service.js';
import { logAudit } from '../../utils/audit.js';
import logger from '../../config/logger.js';

// ==================== PERIODES ====================

export async function getPeriodes(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const anneeScolaireId = req.query.anneeScolaireId as string | undefined;

    const periodes = await evaluationsService.getPeriodes(etablissementId, anneeScolaireId);

    res.json({ data: periodes });
  } catch (error) {
    logger.error('Error fetching periodes:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createPeriode(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const periode = await evaluationsService.createPeriode(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'periode',
      donneesApres: periode as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: periode });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'DATE_DEBUT_APRES_FIN') {
        res.status(400).json({
          error: {
            code: 'DATE_DEBUT_APRES_FIN',
            message: 'La date de début doit être antérieure à la date de fin',
          },
        });
        return;
      }

      if (error.message === 'PERIODE_OVERLAP') {
        res.status(409).json({
          error: {
            code: 'PERIODE_OVERLAP',
            message: 'Cette période chevauche une période existante dans la même année scolaire',
          },
        });
        return;
      }
    }

    logger.error('Error creating periode:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== MATIERES ====================

export async function getMatieres(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const niveau = req.query.niveau as string | undefined;

    const matieres = await evaluationsService.getMatieres(etablissementId, niveau);

    res.json({ data: matieres });
  } catch (error) {
    logger.error('Error fetching matieres:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createMatiere(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const matiere = await evaluationsService.createMatiere(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'matiere',
      donneesApres: matiere as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: matiere });
  } catch (error) {
    if (error instanceof Error && error.message === 'MATIERE_ALREADY_EXISTS') {
      res.status(409).json({
        error: {
          code: 'MATIERE_ALREADY_EXISTS',
          message: 'Une matière avec ce nom et ce niveau existe déjà',
        },
      });
      return;
    }

    logger.error('Error creating matiere:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getSuggestedMatieres(req: Request, res: Response): Promise<void> {
  try {
    const niveau = req.query.niveau as string;

    if (!niveau) {
      res.status(400).json({
        error: {
          code: 'NIVEAU_REQUIRED',
          message: 'Le paramètre niveau est requis',
        },
      });
      return;
    }

    const suggestions = evaluationsService.getSuggestedMatieres(niveau);

    res.json({ data: suggestions });
  } catch (error) {
    logger.error('Error fetching suggested matieres:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== NOTES ====================

export async function getNotes(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const classeId = req.query.classeId as string;
    const matiereId = req.query.matiereId as string;
    const periodeId = req.query.periodeId as string;

    if (!classeId || !matiereId || !periodeId) {
      res.status(400).json({
        error: {
          code: 'PARAMS_REQUIRED',
          message: 'Les paramètres classeId, matiereId et periodeId sont requis',
        },
      });
      return;
    }

    const notes = await evaluationsService.getNotes(classeId, matiereId, periodeId, etablissementId);

    res.json({ data: notes });
  } catch (error) {
    logger.error('Error fetching notes:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createNote(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const note = await evaluationsService.createNote(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'note',
      donneesApres: note as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: note });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOTE_INVALID') {
      res.status(400).json({
        error: {
          code: 'NOTE_INVALID',
          message: 'La note doit être comprise entre 0 et la note maximale',
        },
      });
      return;
    }

    logger.error('Error creating note:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function validerNote(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;

    const note = await evaluationsService.validerNote(id, etablissementId);

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'note',
      donneesAvant: { validee: false },
      donneesApres: { validee: true },
    });

    res.json({ data: note });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOTE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Note non trouvée',
          },
        });
        return;
      }

      if (error.message === 'NOTE_ALREADY_VALIDATED') {
        res.status(400).json({
          error: {
            code: 'NOTE_ALREADY_VALIDATED',
            message: 'Cette note est déjà validée',
          },
        });
        return;
      }
    }

    logger.error('Error validating note:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createRattrapage(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;
    const { dateLimite } = req.body;

    if (!dateLimite) {
      res.status(400).json({
        error: {
          code: 'DATE_LIMITE_REQUIRED',
          message: 'La date limite est requise',
        },
      });
      return;
    }

    const rattrapage = await evaluationsService.createRattrapage(id, dateLimite, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'evaluation_rattrapage',
      donneesApres: rattrapage as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: rattrapage });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOTE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Note non trouvée',
          },
        });
        return;
      }

      if (error.message === 'RATTRAPAGE_ALREADY_EXISTS') {
        res.status(409).json({
          error: {
            code: 'RATTRAPAGE_ALREADY_EXISTS',
            message: 'Un rattrapage existe déjà pour cette note',
          },
        });
        return;
      }
    }

    logger.error('Error creating rattrapage:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function saisirNoteRattrapage(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { id } = req.params;
    const { noteRattrapage } = req.body;

    if (noteRattrapage === undefined || noteRattrapage === null) {
      res.status(400).json({
        error: {
          code: 'NOTE_REQUIRED',
          message: 'La note de rattrapage est requise',
        },
      });
      return;
    }

    const rattrapage = await evaluationsService.saisirNoteRattrapage(
      id,
      noteRattrapage,
      etablissementId,
    );

    await logAudit({
      req,
      action: 'UPDATE',
      ressource: 'evaluation_rattrapage',
      donneesApres: rattrapage as unknown as Record<string, unknown>,
    });

    res.json({ data: rattrapage });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'RATTRAPAGE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Rattrapage non trouvé',
          },
        });
        return;
      }

      if (error.message === 'RATTRAPAGE_ALREADY_GRADED') {
        res.status(400).json({
          error: {
            code: 'RATTRAPAGE_ALREADY_GRADED',
            message: 'Ce rattrapage a déjà une note',
          },
        });
        return;
      }

      if (error.message === 'NOTE_INVALID') {
        res.status(400).json({
          error: {
            code: 'NOTE_INVALID',
            message: 'La note doit être comprise entre 0 et la note maximale',
          },
        });
        return;
      }
    }

    logger.error('Error grading rattrapage:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== MOYENNES ====================

export async function calculerMoyennes(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { eleveId, periodeId } = req.body;

    if (!eleveId || !periodeId) {
      res.status(400).json({
        error: {
          code: 'PARAMS_REQUIRED',
          message: 'Les paramètres eleveId et periodeId sont requis',
        },
      });
      return;
    }

    const moyennes = await evaluationsService.calculateMoyennes(eleveId, periodeId, etablissementId);

    res.json({ data: moyennes });
  } catch (error) {
    logger.error('Error calculating moyennes:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function getMoyennes(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { eleveId } = req.params;
    const periodeId = req.query.periodeId as string | undefined;

    const moyennes = await evaluationsService.getMoyennes(eleveId, periodeId, etablissementId);

    res.json({ data: moyennes });
  } catch (error) {
    logger.error('Error fetching moyennes:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== EVALUATIONS QUALITATIVES ====================

export async function getEvaluationsQualitatives(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const eleveId = req.query.eleveId as string;
    const periodeId = req.query.periodeId as string;

    if (!eleveId || !periodeId) {
      res.status(400).json({
        error: {
          code: 'PARAMS_REQUIRED',
          message: 'Les paramètres eleveId et periodeId sont requis',
        },
      });
      return;
    }

    const evaluations = await evaluationsService.getEvaluationsQualitatives(
      eleveId,
      periodeId,
      etablissementId,
    );

    res.json({ data: evaluations });
  } catch (error) {
    logger.error('Error fetching evaluations qualitatives:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function createEvalQualitative(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;

    const evaluation = await evaluationsService.createEvalQualitative(req.body, etablissementId);

    await logAudit({
      req,
      action: 'CREATE',
      ressource: 'evaluation_qualitative',
      donneesApres: evaluation as unknown as Record<string, unknown>,
    });

    res.status(201).json({ data: evaluation });
  } catch (error) {
    logger.error('Error creating evaluation qualitative:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

// ==================== BULLETIN ====================

export async function getBulletin(req: Request, res: Response): Promise<void> {
  try {
    const etablissementId = req.user!.etablissementId;
    const { eleveId, periodeId } = req.params;

    const bulletin = await evaluationsService.getBulletin(eleveId, periodeId, etablissementId);

    res.json({ data: bulletin });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ELEVE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Elève non trouvé',
          },
        });
        return;
      }

      if (error.message === 'PERIODE_NOT_FOUND') {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Période non trouvée',
          },
        });
        return;
      }
    }

    logger.error('Error generating bulletin:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}
