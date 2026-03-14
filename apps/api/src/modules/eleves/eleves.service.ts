import prisma from '../../config/database.js';
import { generateNumeroEleve } from '../../utils/helpers.js';

// ==================== TYPES ====================

interface PaginationParams {
  skip: number;
  limit: number;
  page: number;
}

interface EleveFilters {
  statut?: string;
  classeId?: string;
}

interface ParentInput {
  nom: string;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
}

interface InscrireData {
  nom: string;
  prenom: string;
  dateNaissance: string | Date;
  sexe: string;
  parents: ParentInput[];
  classeSouhaiteeId?: string;
}

// ==================== GET ALL ====================

export async function getAll(
  etablissementId: string,
  pagination: PaginationParams,
  search?: string,
  filters?: EleveFilters,
) {
  const where: Record<string, unknown> = { etablissementId };

  // Search on nom, prenom, numeroEleve
  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { numeroEleve: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by statut
  if (filters?.statut) {
    where.statut = filters.statut;
  }

  // Filter by classeId (students with an active affectation in that class)
  if (filters?.classeId) {
    where.affectations = {
      some: {
        classeId: filters.classeId,
        dateFin: null,
      },
    };
  }

  const [data, total] = await Promise.all([
    prisma.eleve.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
      include: {
        affectations: {
          where: { dateFin: null },
          include: { classe: { select: { id: true, nom: true, niveau: true } } },
          take: 1,
        },
      },
    }),
    prisma.eleve.count({ where }),
  ]);

  return { data, total };
}

// ==================== GET BY ID ====================

export async function getById(id: string, etablissementId: string) {
  const eleve = await prisma.eleve.findFirst({
    where: { id, etablissementId },
    include: {
      parents: true,
      affectations: {
        where: { dateFin: null },
        include: {
          classe: {
            select: {
              id: true,
              nom: true,
              niveau: true,
              effectifMax: true,
              anneeScolaireId: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  return eleve;
}

// ==================== INSCRIRE ====================

export async function inscrire(data: InscrireData, etablissementId: string) {
  const { nom, prenom, dateNaissance, sexe, parents, classeSouhaiteeId } = data;

  // If a preferred class is specified, check its capacity
  if (classeSouhaiteeId) {
    const classe = await prisma.classe.findFirst({
      where: { id: classeSouhaiteeId, etablissementId },
    });

    if (!classe) {
      throw new Error('CLASSE_NOT_FOUND');
    }

    const currentEffectif = await prisma.affectationEleve.count({
      where: {
        classeId: classeSouhaiteeId,
        dateFin: null,
        etablissementId,
      },
    });

    if (currentEffectif >= classe.effectifMax) {
      // Class is full; we still create the student but note that inscription is "en attente"
      // The student is created with statut 'inscrit' but no affectation is made
    }
  }

  const eleve = await prisma.$transaction(async (tx) => {
    // Create the student
    const newEleve = await tx.eleve.create({
      data: {
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        sexe,
        statut: 'inscrit',
        etablissementId,
      },
    });

    // Create parent records
    if (parents && parents.length > 0) {
      await tx.parentRecord.createMany({
        data: parents.map((parent) => ({
          eleveId: newEleve.id,
          nom: parent.nom,
          telephone: parent.telephone || null,
          email: parent.email || null,
          adresse: parent.adresse || null,
          etablissementId,
        })),
      });
    }

    // If a class was requested and has capacity, create the affectation
    if (classeSouhaiteeId) {
      const classe = await tx.classe.findFirst({
        where: { id: classeSouhaiteeId, etablissementId },
      });

      if (classe) {
        const currentEffectif = await tx.affectationEleve.count({
          where: {
            classeId: classeSouhaiteeId,
            dateFin: null,
            etablissementId,
          },
        });

        if (currentEffectif < classe.effectifMax) {
          await tx.affectationEleve.create({
            data: {
              eleveId: newEleve.id,
              classeId: classeSouhaiteeId,
              etablissementId,
            },
          });
        }
      }
    }

    // Return the created student with parents
    return tx.eleve.findFirst({
      where: { id: newEleve.id },
      include: {
        parents: true,
        affectations: {
          where: { dateFin: null },
          include: { classe: { select: { id: true, nom: true, niveau: true } } },
        },
      },
    });
  });

  return eleve;
}

// ==================== ADMETTRE ====================

export async function admettre(id: string, etablissementId: string) {
  const eleve = await prisma.eleve.findFirst({
    where: { id, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  if (eleve.statut !== 'inscrit') {
    throw new Error('STATUT_INVALID');
  }

  // Generate unique numeroEleve: count admis students for current year + 1
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const admisCount = await prisma.eleve.count({
    where: {
      etablissementId,
      statut: 'admis',
      creeLe: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  const sequence = admisCount + 1;
  const numeroEleve = generateNumeroEleve(currentYear, sequence);

  const updatedEleve = await prisma.eleve.update({
    where: { id },
    data: {
      statut: 'admis',
      numeroEleve,
    },
    include: {
      parents: true,
      affectations: {
        where: { dateFin: null },
        include: { classe: { select: { id: true, nom: true, niveau: true } } },
      },
    },
  });

  return updatedEleve;
}

// ==================== AFFECTER ====================

export async function affecter(id: string, classeId: string, etablissementId: string) {
  const eleve = await prisma.eleve.findFirst({
    where: { id, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  if (eleve.statut !== 'admis') {
    throw new Error('ELEVE_NOT_ADMIS');
  }

  // Check target class exists and belongs to the same etablissement
  const classe = await prisma.classe.findFirst({
    where: { id: classeId, etablissementId },
  });

  if (!classe) {
    throw new Error('CLASSE_NOT_FOUND');
  }

  // Check class capacity
  const currentEffectif = await prisma.affectationEleve.count({
    where: {
      classeId,
      dateFin: null,
      etablissementId,
    },
  });

  if (currentEffectif >= classe.effectifMax) {
    throw new Error('CLASSE_FULL');
  }

  // Check no active affectation exists
  const activeAffectation = await prisma.affectationEleve.findFirst({
    where: {
      eleveId: id,
      dateFin: null,
      etablissementId,
    },
  });

  if (activeAffectation) {
    throw new Error('AFFECTATION_ACTIVE_EXISTS');
  }

  // Create the new affectation
  const affectation = await prisma.affectationEleve.create({
    data: {
      eleveId: id,
      classeId,
      etablissementId,
    },
    include: {
      classe: { select: { id: true, nom: true, niveau: true } },
      eleve: { select: { id: true, nom: true, prenom: true, numeroEleve: true } },
    },
  });

  return affectation;
}

// ==================== TRANSFERER ====================

export async function transferer(id: string, newClasseId: string, etablissementId: string) {
  const eleve = await prisma.eleve.findFirst({
    where: { id, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  // Check destination class exists
  const newClasse = await prisma.classe.findFirst({
    where: { id: newClasseId, etablissementId },
  });

  if (!newClasse) {
    throw new Error('CLASSE_NOT_FOUND');
  }

  // Check destination class capacity
  const currentEffectif = await prisma.affectationEleve.count({
    where: {
      classeId: newClasseId,
      dateFin: null,
      etablissementId,
    },
  });

  if (currentEffectif >= newClasse.effectifMax) {
    throw new Error('CLASSE_FULL');
  }

  // Find current active affectation
  const currentAffectation = await prisma.affectationEleve.findFirst({
    where: {
      eleveId: id,
      dateFin: null,
      etablissementId,
    },
  });

  if (!currentAffectation) {
    throw new Error('NO_ACTIVE_AFFECTATION');
  }

  // Cannot transfer to the same class
  if (currentAffectation.classeId === newClasseId) {
    throw new Error('SAME_CLASSE');
  }

  // Transaction: close current affectation, create new one
  const result = await prisma.$transaction(async (tx) => {
    // Close previous affectation
    await tx.affectationEleve.update({
      where: { id: currentAffectation.id },
      data: { dateFin: new Date() },
    });

    // Create new affectation
    const newAffectation = await tx.affectationEleve.create({
      data: {
        eleveId: id,
        classeId: newClasseId,
        etablissementId,
      },
      include: {
        classe: { select: { id: true, nom: true, niveau: true } },
        eleve: { select: { id: true, nom: true, prenom: true, numeroEleve: true } },
      },
    });

    return newAffectation;
  });

  return result;
}

// ==================== DESINSCRIRE ====================

export async function desinscrire(id: string, etablissementId: string, _raison?: string) {
  const eleve = await prisma.eleve.findFirst({
    where: { id, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  if (eleve.statut === 'desinscrit') {
    throw new Error('ALREADY_DESINSCRIT');
  }

  // Check if student has outstanding balance (sum factures - sum paiements > 0 means blocked)
  const [facturesAggregate, paiementsAggregate] = await Promise.all([
    prisma.facture.aggregate({
      where: { eleveId: id, etablissementId },
      _sum: { montant: true },
    }),
    prisma.paiementRecord.aggregate({
      where: { eleveId: id, etablissementId },
      _sum: { montant: true },
    }),
  ]);

  const totalFactures = facturesAggregate._sum.montant || 0;
  const totalPaiements = paiementsAggregate._sum.montant || 0;
  const solde = totalFactures - totalPaiements;

  if (solde > 0) {
    throw new Error('SOLDE_IMPAYE');
  }

  // Transaction: update statut, close active affectation
  const result = await prisma.$transaction(async (tx) => {
    // Close active affectation if any
    const activeAffectation = await tx.affectationEleve.findFirst({
      where: {
        eleveId: id,
        dateFin: null,
        etablissementId,
      },
    });

    if (activeAffectation) {
      await tx.affectationEleve.update({
        where: { id: activeAffectation.id },
        data: { dateFin: new Date() },
      });
    }

    // Update statut to desinscrit
    const updatedEleve = await tx.eleve.update({
      where: { id },
      data: { statut: 'desinscrit' },
      include: {
        parents: true,
        affectations: {
          orderBy: { dateDebut: 'desc' },
          take: 1,
          include: { classe: { select: { id: true, nom: true, niveau: true } } },
        },
      },
    });

    return updatedEleve;
  });

  return result;
}

// ==================== GET STATISTIQUES ====================

export async function getStatistiques(etablissementId: string) {
  const [inscrit, admis, desinscrit, total] = await Promise.all([
    prisma.eleve.count({ where: { etablissementId, statut: 'inscrit' } }),
    prisma.eleve.count({ where: { etablissementId, statut: 'admis' } }),
    prisma.eleve.count({ where: { etablissementId, statut: 'desinscrit' } }),
    prisma.eleve.count({ where: { etablissementId } }),
  ]);

  return {
    total,
    parStatut: {
      inscrit,
      admis,
      desinscrit,
    },
  };
}
