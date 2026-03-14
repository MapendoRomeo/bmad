import { Request, Response } from 'express';
import * as authService from './auth.service.js';
import logger from '../../config/logger.js';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, motDePasse } = req.body;
    const etablissementId = req.body.etablissementId as string | undefined;

    const result = await authService.login(email, motDePasse, etablissementId);

    res.json({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_OR_PASSWORD_INVALID') {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou mot de passe incorrect',
        },
      });
      return;
    }

    logger.error('Login error:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le refresh token est requis',
        },
      });
      return;
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'INVALID_REFRESH_TOKEN' || error.message === 'USER_NOT_FOUND')
    ) {
      res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token invalide ou expiré',
        },
      });
      return;
    }

    logger.error('Refresh token error:', { error });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'Déconnexion réussie' });
}

export async function forgotPassword(_req: Request, res: Response): Promise<void> {
  res.json({
    message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé',
  });
}

export async function resetPassword(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'Mot de passe réinitialisé avec succès' });
}
