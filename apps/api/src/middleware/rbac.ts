import { Request, Response, NextFunction } from 'express';
import { PERMISSIONS } from '@sgs/shared';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Accès non autorisé pour ce rôle' },
      });
      return;
    }

    next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' },
      });
      return;
    }

    const userPermissions = PERMISSIONS[req.user.role] || [];

    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      next();
      return;
    }

    res.status(403).json({
      error: { code: 'FORBIDDEN', message: `Permission requise: ${permission}` },
    });
  };
}
