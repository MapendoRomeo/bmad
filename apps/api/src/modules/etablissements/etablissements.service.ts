import prisma from '../../config/database.js';

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// ========== ETABLISSEMENT CRUD ==========

export async function getAll(etablissementId?: string, pagination?: PaginationParams) {
  const { page = 1, limit = 50, skip = 0 } = pagination || {};

  const where: Record<string, unknown> = {};
  if (etablissementId) {
    where.id = etablissementId;
  }

  const [data, total] = await Promise.all([
    prisma.etablissement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creeLe: 'desc' },
    }),
    prisma.etablissement.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getById(id: string) {
  const etablissement = await prisma.etablissement.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          utilisateurs: true,
          eleves: true,
          classes: true,
          enseignants: true,
        },
      },
    },
  });

  if (!etablissement) {
    throw new Error('ETABLISSEMENT_NOT_FOUND');
  }

  return etablissement;
}

export async function create(data: {
  nom: string;
  type: string;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
}) {
  const etablissement = await prisma.etablissement.create({
    data: {
      nom: data.nom,
      type: data.type,
      adresse: data.adresse || null,
      telephone: data.telephone || null,
      email: data.email || null,
    },
  });

  return etablissement;
}

export async function update(
  id: string,
  data: {
    nom?: string;
    type?: string;
    adresse?: string | null;
    telephone?: string | null;
    email?: string | null;
    actif?: boolean;
  },
) {
  const existing = await prisma.etablissement.findUnique({ where: { id } });

  if (!existing) {
    throw new Error('ETABLISSEMENT_NOT_FOUND');
  }

  const updated = await prisma.etablissement.update({
    where: { id },
    data,
  });

  return { avant: existing, apres: updated };
}

// ========== ANNEE SCOLAIRE ==========

export async function getAnneeScolaires(etablissementId: string) {
  const annees = await prisma.anneeScolaire.findMany({
    where: { etablissementId },
    orderBy: { dateDebut: 'desc' },
    include: {
      _count: {
        select: {
          classes: true,
          periodes: true,
        },
      },
    },
  });

  return annees;
}

export async function createAnneeScolaire(
  data: {
    nom: string;
    dateDebut: string | Date;
    dateFin: string | Date;
  },
  etablissementId: string,
) {
  // Vérifier l'unicité du nom pour cet établissement
  const existing = await prisma.anneeScolaire.findFirst({
    where: {
      nom: data.nom,
      etablissementId,
    },
  });

  if (existing) {
    throw new Error('ANNEE_SCOLAIRE_ALREADY_EXISTS');
  }

  // Vérifier les dates
  const dateDebut = new Date(data.dateDebut);
  const dateFin = new Date(data.dateFin);

  if (dateFin <= dateDebut) {
    throw new Error('INVALID_DATES');
  }

  // Vérifier s'il y a déjà une année active
  const activeYear = await prisma.anneeScolaire.findFirst({
    where: {
      etablissementId,
      active: true,
    },
  });

  // La nouvelle année est active seulement s'il n'y en a pas d'autre active
  const shouldBeActive = !activeYear;

  const annee = await prisma.anneeScolaire.create({
    data: {
      nom: data.nom,
      dateDebut,
      dateFin,
      etablissementId,
      active: shouldBeActive,
    },
  });

  return annee;
}

export async function setAnneeScolaireActive(id: string, etablissementId: string) {
  // Vérifier que l'année existe et appartient à l'établissement
  const annee = await prisma.anneeScolaire.findFirst({
    where: { id, etablissementId },
  });

  if (!annee) {
    throw new Error('ANNEE_SCOLAIRE_NOT_FOUND');
  }

  if (annee.active) {
    throw new Error('ANNEE_SCOLAIRE_ALREADY_ACTIVE');
  }

  // Transaction : désactiver toutes, puis activer celle demandée
  const [, activated] = await prisma.$transaction([
    prisma.anneeScolaire.updateMany({
      where: { etablissementId, active: true },
      data: { active: false },
    }),
    prisma.anneeScolaire.update({
      where: { id },
      data: { active: true },
    }),
  ]);

  return activated;
}
