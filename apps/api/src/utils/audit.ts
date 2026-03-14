import prisma from '../config/database.js';
import { Request } from 'express';

interface AuditParams {
  req: Request;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  ressource: string;
  donneesAvant?: Record<string, unknown>;
  donneesApres?: Record<string, unknown>;
}

export async function logAudit({ req, action, ressource, donneesAvant, donneesApres }: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        utilisateurId: req.user?.userId || null,
        etablissementId: req.user!.etablissementId,
        action,
        ressource,
        donneesAvant: donneesAvant || undefined,
        donneesApres: donneesApres || undefined,
        ip: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });
  } catch {
    // Ne pas bloquer l'opération principale si l'audit échoue
  }
}
