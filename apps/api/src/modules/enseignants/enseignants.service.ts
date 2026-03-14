import prisma from '../../config/database.js';

interface Pagination {
  skip: number;
  limit: number;
  page: number;
}

export async function getAll(
  etablissementId: string,
  pagination: Pagination,
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

  const [enseignants, total] = await Promise.all([
    prisma.enseignant.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    }),
    prisma.enseignant.count({ where }),
  ]);

  return { data: enseignants, total };
}

export async function getById(id: string, etablissementId: string) {
  const enseignant = await prisma.enseignant.findFirst({
    where: { id, etablissementId },
    include: {
      affectationEnseignants: {
        where: { dateFin: null },
        include: {
          classe: {
            select: {
              id: true,
              nom: true,
              niveau: true,
            },
          },
          matiere: {
            select: {
              id: true,
              nom: true,
            },
          },
        },
        orderBy: { dateDebut: 'desc' },
      },
    },
  });

  return enseignant;
}

export async function create(
  data: { nom: string; prenom: string; email?: string | null; telephone?: string | null },
  etablissementId: string,
) {
  // If email is provided, check uniqueness within etablissement
  if (data.email) {
    const existing = await prisma.enseignant.findFirst({
      where: {
        email: data.email,
        etablissementId,
      },
    });

    if (existing) {
      throw new Error('ENSEIGNANT_EMAIL_EXISTS');
    }
  }

  const enseignant = await prisma.enseignant.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email || null,
      telephone: data.telephone || null,
      etablissementId,
    },
  });

  return enseignant;
}

export async function update(
  id: string,
  data: { nom?: string; prenom?: string; email?: string | null; telephone?: string | null },
  etablissementId: string,
) {
  const enseignant = await prisma.enseignant.findFirst({
    where: { id, etablissementId },
  });

  if (!enseignant) {
    throw new Error('ENSEIGNANT_NOT_FOUND');
  }

  // If changing email, check uniqueness
  if (data.email && data.email !== enseignant.email) {
    const existing = await prisma.enseignant.findFirst({
      where: {
        email: data.email,
        etablissementId,
        id: { not: id },
      },
    });

    if (existing) {
      throw new Error('ENSEIGNANT_EMAIL_EXISTS');
    }
  }

  const updated = await prisma.enseignant.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.prenom !== undefined && { prenom: data.prenom }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
    },
  });

  return updated;
}

export async function softDelete(id: string, etablissementId: string) {
  const enseignant = await prisma.enseignant.findFirst({
    where: { id, etablissementId },
  });

  if (!enseignant) {
    throw new Error('ENSEIGNANT_NOT_FOUND');
  }

  // End all active affectations
  await prisma.affectationEnseignant.updateMany({
    where: {
      enseignantId: id,
      etablissementId,
      dateFin: null,
    },
    data: {
      dateFin: new Date(),
    },
  });

  // Mark as deleted by prefixing email and appending _deleted suffix to nom
  const updated = await prisma.enseignant.update({
    where: { id },
    data: {
      nom: `${enseignant.nom} [supprimé]`,
      email: enseignant.email ? `_deleted_${id}_${enseignant.email}` : null,
    },
  });

  return updated;
}

export async function affecter(
  enseignantId: string,
  classeId: string,
  matiereId: string | null | undefined,
  etablissementId: string,
) {
  // Verify enseignant exists in this etablissement
  const enseignant = await prisma.enseignant.findFirst({
    where: { id: enseignantId, etablissementId },
  });

  if (!enseignant) {
    throw new Error('ENSEIGNANT_NOT_FOUND');
  }

  // Verify classe exists in this etablissement
  const classe = await prisma.classe.findFirst({
    where: { id: classeId, etablissementId },
  });

  if (!classe) {
    throw new Error('CLASSE_NOT_FOUND');
  }

  // Check for existing active affectation for same enseignant+classe+matiere
  const existingWhere: Record<string, unknown> = {
    enseignantId,
    classeId,
    etablissementId,
    dateFin: null,
  };

  if (matiereId) {
    existingWhere.matiereId = matiereId;
  } else {
    existingWhere.matiereId = null;
  }

  const existing = await prisma.affectationEnseignant.findFirst({
    where: existingWhere,
  });

  if (existing) {
    throw new Error('AFFECTATION_ALREADY_EXISTS');
  }

  const affectation = await prisma.affectationEnseignant.create({
    data: {
      enseignantId,
      classeId,
      matiereId: matiereId || null,
      dateDebut: new Date(),
      etablissementId,
    },
    include: {
      enseignant: {
        select: { id: true, nom: true, prenom: true },
      },
      classe: {
        select: { id: true, nom: true, niveau: true },
      },
      matiere: {
        select: { id: true, nom: true },
      },
    },
  });

  return affectation;
}

export async function getAffectations(enseignantId: string, etablissementId: string) {
  const enseignant = await prisma.enseignant.findFirst({
    where: { id: enseignantId, etablissementId },
  });

  if (!enseignant) {
    throw new Error('ENSEIGNANT_NOT_FOUND');
  }

  const affectations = await prisma.affectationEnseignant.findMany({
    where: {
      enseignantId,
      etablissementId,
    },
    include: {
      classe: {
        select: {
          id: true,
          nom: true,
          niveau: true,
        },
      },
      matiere: {
        select: {
          id: true,
          nom: true,
        },
      },
    },
    orderBy: { dateDebut: 'desc' },
  });

  return affectations;
}
