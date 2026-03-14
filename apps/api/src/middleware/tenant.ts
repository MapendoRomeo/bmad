import { Request, Response, NextFunction } from 'express';

/**
 * Middleware multi-tenant : extrait etablissementId du JWT et le rend disponible.
 * Doit être utilisé après authMiddleware.
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || !req.user.etablissementId) {
    res.status(403).json({
      error: { code: 'TENANT_REQUIRED', message: 'Établissement non identifié' },
    });
    return;
  }
  next();
}

/** Helper pour obtenir le filtre tenant depuis la requête */
export function getTenantFilter(req: Request): { etablissementId: string } {
  return { etablissementId: req.user!.etablissementId };
}
