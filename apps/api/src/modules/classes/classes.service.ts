import prisma from '../../config/database.js';

interface Pagination {
  skip: number;
  limit: number;
  page: number;
}

interface ClasseFilters {
  niveau?: string;
  anneeScolaireId?: string;
}

export async function getAll(
  etablissementId: string,
  pagination: Pagination,
  filters?: ClasseFilters,
) {
  const where: Record<string, unknown> = { etablissementId };

  if (filters?.niveau) {
    where.niveau = filters.niveau;
  }

  if (filters?.anneeScolaireId) {
    where.anneeScolaireId = filters.anneeScolaireId;
  }

  const [classes, total] = await Promise.all([
    prisma.classe.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { nom: 'asc' },
      include: {
        anneeScolaire: { select: { id: true, nom: true } },
        _count: {
          select: {
            affectationEleves: {
              where: { dateFin: null },
            },
          },
        },
      },
    }),
    prisma.classe.count({ where }),
  ]);

  const classesWithEffectif = classes.map((classe) => ({
    ...classe,
    effectifActuel: classe._count.affectationEleves,
    _count: undefined,
  }));

  return { data: classesWithEffectif, total };
}

export async function getById(id: string, etablissementId: string) {
  const classe = await prisma.classe.findFirst({
    where: { id, etablissementId },
    include: {
      anneeScolaire: { select: { id: true, nom: true } },
      _count: {
        select: {
          affectationEleves: {
            where: { dateFin: null },
          },
        },
      },
    },
  });

  if (!classe) {
    return null;
  }

  const [eleves, enseignants] = await Promise.all([
    prisma.affectationEleve.findMany({
      where: {
        classeId: id,
        etablissementId,
        dateFin: null,
      },
      include: {
        eleve: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroEleve: true,
            dateNaissance: true,
            sexe: true,
          },
        },
      },
      orderBy: { eleve: { nom: 'asc' } },
    }),
    prisma.affectationEnseignant.findMany({
      where: {
        classeId: id,
        etablissementId,
        dateFin: null,
      },
      include: {
        enseignant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        matiere: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { enseignant: { nom: 'asc' } },
    }),
  ]);

  return {
    ...classe,
    effectifActuel: classe._count.affectationEleves,
    _count: undefined,
    eleves: eleves.map((a) => a.eleve),
    enseignants: enseignants.map((a) => ({
      ...a.enseignant,
      matiere: a.matiere,
    })),
  };
}

export async function create(
  data: { nom: string; niveau: string; effectifMax: number; anneeScolaireId: string },
  etablissementId: string,
) {
  // Verify unique nom per etablissement + anneeScolaire
  const existing = await prisma.classe.findFirst({
    where: {
      nom: data.nom,
      etablissementId,
      anneeScolaireId: data.anneeScolaireId,
    },
  });

  if (existing) {
    throw new Error('CLASSE_ALREADY_EXISTS');
  }

  const classe = await prisma.classe.create({
    data: {
      nom: data.nom,
      niveau: data.niveau,
      effectifMax: data.effectifMax,
      anneeScolaireId: data.anneeScolaireId,
      etablissementId,
    },
    include: {
      anneeScolaire: { select: { id: true, nom: true } },
    },
  });

  return classe;
}

export async function update(
  id: string,
  data: { nom?: string; niveau?: string; effectifMax?: number },
  etablissementId: string,
) {
  const classe = await prisma.classe.findFirst({
    where: { id, etablissementId },
    include: {
      _count: {
        select: {
          affectationEleves: {
            where: { dateFin: null },
          },
        },
      },
    },
  });

  if (!classe) {
    throw new Error('CLASSE_NOT_FOUND');
  }

  // Cannot reduce effectifMax below current enrollment
  if (data.effectifMax !== undefined && data.effectifMax < classe._count.affectationEleves) {
    throw new Error('EFFECTIF_MAX_BELOW_CURRENT');
  }

  // If changing nom, verify uniqueness
  if (data.nom && data.nom !== classe.nom) {
    const existing = await prisma.classe.findFirst({
      where: {
        nom: data.nom,
        etablissementId,
        anneeScolaireId: classe.anneeScolaireId,
        id: { not: id },
      },
    });

    if (existing) {
      throw new Error('CLASSE_ALREADY_EXISTS');
    }
  }

  const updated = await prisma.classe.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.niveau !== undefined && { niveau: data.niveau }),
      ...(data.effectifMax !== undefined && { effectifMax: data.effectifMax }),
    },
    include: {
      anneeScolaire: { select: { id: true, nom: true } },
    },
  });

  return updated;
}

export async function getEleves(id: string, etablissementId: string) {
  const classe = await prisma.classe.findFirst({
    where: { id, etablissementId },
  });

  if (!classe) {
    throw new Error('CLASSE_NOT_FOUND');
  }

  const affectations = await prisma.affectationEleve.findMany({
    where: {
      classeId: id,
      etablissementId,
      dateFin: null,
    },
    include: {
      eleve: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          numeroEleve: true,
          dateNaissance: true,
          sexe: true,
          statut: true,
        },
      },
    },
    orderBy: { eleve: { nom: 'asc' } },
  });

  return affectations.map((a) => ({
    ...a.eleve,
    affectationId: a.id,
    dateDebut: a.dateDebut,
  }));
}

export async function getEnseignants(id: string, etablissementId: string) {
  const classe = await prisma.classe.findFirst({
    where: { id, etablissementId },
  });

  if (!classe) {
    throw new Error('CLASSE_NOT_FOUND');
  }

  const affectations = await prisma.affectationEnseignant.findMany({
    where: {
      classeId: id,
      etablissementId,
      dateFin: null,
    },
    include: {
      enseignant: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
        },
      },
      matiere: {
        select: {
          id: true,
          nom: true,
        },
      },
    },
    orderBy: { enseignant: { nom: 'asc' } },
  });

  return affectations.map((a) => ({
    ...a.enseignant,
    affectationId: a.id,
    matiere: a.matiere,
    dateDebut: a.dateDebut,
  }));
}
