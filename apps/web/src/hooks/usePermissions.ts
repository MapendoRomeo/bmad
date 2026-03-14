import { useSelector } from 'react-redux';
import { RootState } from '../store';

const ROLE_HIERARCHY: Record<string, number> = {
  directeur: 4,
  admin: 3,
  comptable: 2,
  secretaire: 2,
  enseignant: 1,
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  directeur: ['*'],
  admin: ['eleves:*', 'classes:*', 'enseignants:*', 'evaluations:*', 'presence:*', 'utilisateurs:read', 'etablissement:read', 'exports:*'],
  secretaire: ['eleves:*', 'classes:read', 'presence:read'],
  comptable: ['financier:*', 'eleves:read', 'classes:read', 'exports:financier'],
  enseignant: ['evaluations:own', 'presence:own', 'classes:read', 'eleves:read'],
};

export function usePermissions() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role || '';

  const hasRole = (...roles: string[]) => roles.includes(role);

  const hasPermission = (permission: string) => {
    const perms = ROLE_PERMISSIONS[role] || [];
    if (perms.includes('*')) return true;
    const [module, action] = permission.split(':');
    return perms.some((p) => {
      if (p === permission) return true;
      if (p === `${module}:*`) return true;
      return false;
    });
  };

  const canAccess = (route: string) => {
    const routePermissions: Record<string, string[]> = {
      '/eleves': ['directeur', 'admin', 'secretaire'],
      '/classes': ['directeur', 'admin', 'secretaire', 'enseignant'],
      '/enseignants': ['directeur', 'admin'],
      '/evaluations': ['directeur', 'admin', 'enseignant'],
      '/presences': ['directeur', 'admin', 'enseignant'],
      '/financier': ['directeur', 'admin', 'comptable'],
      '/utilisateurs': ['directeur', 'admin'],
      '/etablissement': ['directeur', 'admin'],
      '/exports': ['directeur', 'admin', 'comptable'],
      '/dashboard': ['directeur', 'admin', 'secretaire', 'comptable', 'enseignant'],
    };
    const allowedRoles = routePermissions[route];
    if (!allowedRoles) return true;
    return allowedRoles.includes(role);
  };

  return { role, hasRole, hasPermission, canAccess };
}
