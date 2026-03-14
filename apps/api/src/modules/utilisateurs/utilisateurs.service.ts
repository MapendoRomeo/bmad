import bcrypt from 'bcrypt';
import prisma from '../../config/database.js';
import { Role } from '@sgs/shared';

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

const SALT_ROUNDS = 12;

// Rôles protégés : un admin ne peut pas modifier/supprimer un directeur
const PROTECTED_ROLES: Record<string, string[]> = {
  [Role.ADMIN]: [Role.DIRECTEUR],
};

function canManageRole(currentUserRole: string, targetRole: string): boolean {
  const restricted = PROTECTED_ROLES[currentUserRole];
  if (!restricted) return true;
  return !restricted.includes(targetRole);
}

// Champs à exclure du résultat pour ne pas exposer le hash
const userSelectFields = {
  id: true,
  nom: true,
  prenom: true,
  email: true,
  etablissementId: true,
  role: true,
  actif: true,
  creeLe: true,
} as const;

// ========== UTILISATEUR CRUD ==========

export async function getAll(
  etablissementId: string,
  pagination: PaginationParams,
  search?: string,
) {
  const where: Record<string, unknown> = { etablissementId };

  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.utilisateur.findMany({
      where,
      select: userSelectFields,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { creeLe: 'desc' },
    }),
    prisma.utilisateur.count({ where }),
  ]);

  return { data, total, page: pagination.page, limit: pagination.limit };
}

export async function getById(id: string, etablissementId: string) {
  const utilisateur = await prisma.utilisateur.findFirst({
    where: { id, etablissementId },
    select: userSelectFields,
  });

  if (!utilisateur) {
    throw new Error('UTILISATEUR_NOT_FOUND');
  }

  return utilisateur;
}

export async function create(
  data: {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    role: string;
  },
  etablissementId: string,
) {
  // Vérifier l'unicité email + etablissement
  const existing = await prisma.utilisateur.findFirst({
    where: {
      email: data.email,
      etablissementId,
    },
  });

  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const motDePasseHash = await bcrypt.hash(data.motDePasse, SALT_ROUNDS);

  const utilisateur = await prisma.utilisateur.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      motDePasseHash,
      role: data.role,
      etablissementId,
    },
    select: userSelectFields,
  });

  return utilisateur;
}

export async function update(
  id: string,
  data: {
    nom?: string;
    prenom?: string;
    email?: string;
    role?: string;
    actif?: boolean;
  },
  etablissementId: string,
  currentUserRole: string,
) {
  // Récupérer l'utilisateur cible
  const existing = await prisma.utilisateur.findFirst({
    where: { id, etablissementId },
  });

  if (!existing) {
    throw new Error('UTILISATEUR_NOT_FOUND');
  }

  // Vérifier que le rôle courant peut modifier le rôle cible
  if (!canManageRole(currentUserRole, existing.role)) {
    throw new Error('CANNOT_MODIFY_HIGHER_ROLE');
  }

  // Si on change le rôle vers un rôle protégé, vérifier aussi
  if (data.role && !canManageRole(currentUserRole, data.role)) {
    throw new Error('CANNOT_ASSIGN_HIGHER_ROLE');
  }

  // Si l'email change, vérifier l'unicité
  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.utilisateur.findFirst({
      where: {
        email: data.email,
        etablissementId,
        id: { not: id },
      },
    });

    if (emailTaken) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
  }

  const updated = await prisma.utilisateur.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.prenom !== undefined && { prenom: data.prenom }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.actif !== undefined && { actif: data.actif }),
    },
    select: userSelectFields,
  });

  return {
    avant: {
      id: existing.id,
      nom: existing.nom,
      prenom: existing.prenom,
      email: existing.email,
      role: existing.role,
      actif: existing.actif,
    },
    apres: updated,
  };
}

export async function deleteUser(
  id: string,
  etablissementId: string,
  currentUserRole: string,
) {
  // Récupérer l'utilisateur cible
  const existing = await prisma.utilisateur.findFirst({
    where: { id, etablissementId },
  });

  if (!existing) {
    throw new Error('UTILISATEUR_NOT_FOUND');
  }

  // Vérifier que le rôle courant peut supprimer le rôle cible
  if (!canManageRole(currentUserRole, existing.role)) {
    throw new Error('CANNOT_DELETE_HIGHER_ROLE');
  }

  // Soft delete : on met actif = false
  const deactivated = await prisma.utilisateur.update({
    where: { id },
    data: { actif: false },
    select: userSelectFields,
  });

  return {
    avant: {
      id: existing.id,
      nom: existing.nom,
      prenom: existing.prenom,
      email: existing.email,
      role: existing.role,
      actif: existing.actif,
    },
    apres: deactivated,
  };
}
