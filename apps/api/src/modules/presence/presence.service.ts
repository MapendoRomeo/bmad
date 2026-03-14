import prisma from '../../config/database.js';

// ==================== TYPES ====================

interface PresenceEntry {
  eleveId: string;
  present: boolean;
}

// ==================== ENREGISTRER PRESENCE ====================

export async function enregistrerPresence(
  classeId: string,
  date: string,
  presences: PresenceEntry[],
  etablissementId: string,
) {
  const presenceDate = new Date(date);

  // Validate that all students belong to the class (active affectation)
  const activeAffectations = await prisma.affectationEleve.findMany({
    where: {
      classeId,
      dateFin: null,
      etablissementId,
    },
    select: { eleveId: true },
  });

  const activeEleveIds = new Set(activeAffectations.map((a) => a.eleveId));

  for (const p of presences) {
    if (!activeEleveIds.has(p.eleveId)) {
      throw new Error('ELEVE_NOT_IN_CLASSE');
    }
  }

  // Batch create/upsert presence records in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const upserted = [];

    for (const p of presences) {
      const record = await tx.presence.upsert({
        where: {
          eleveId_classeId_date: {
            eleveId: p.eleveId,
            classeId,
            date: presenceDate,
          },
        },
        update: {
          present: p.present,
        },
        create: {
          eleveId: p.eleveId,
          classeId,
          date: presenceDate,
          present: p.present,
          etablissementId,
        },
      });

      upserted.push(record);
    }

    return upserted;
  });

  return result;
}

// ==================== GET PRESENCES ====================

export async function getPresences(
  classeId: string,
  date: string | Date,
  etablissementId: string,
) {
  const presenceDate = new Date(date);

  const presences = await prisma.presence.findMany({
    where: {
      classeId,
      date: presenceDate,
      etablissementId,
    },
    include: {
      eleve: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          numeroEleve: true,
        },
      },
    },
    orderBy: { eleve: { nom: 'asc' } },
  });

  return presences;
}

// ==================== GET ABSENTS ====================

export async function getAbsents(
  classeId: string,
  date: string | Date,
  etablissementId: string,
) {
  const presenceDate = new Date(date);

  const absents = await prisma.presence.findMany({
    where: {
      classeId,
      date: presenceDate,
      etablissementId,
      present: false,
    },
    include: {
      eleve: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          numeroEleve: true,
        },
      },
    },
    orderBy: { eleve: { nom: 'asc' } },
  });

  return absents;
}

// ==================== STATISTIQUES ELEVE ====================

export async function getStatistiquesEleve(
  eleveId: string,
  etablissementId: string,
  periodeDebut?: string,
  periodeFin?: string,
) {
  // Build the date filter based on date range if provided
  const dateFilter: Record<string, unknown> = {};

  if (periodeDebut || periodeFin) {
    const dateCondition: Record<string, Date> = {};
    if (periodeDebut) {
      dateCondition.gte = new Date(periodeDebut);
    }
    if (periodeFin) {
      dateCondition.lte = new Date(periodeFin);
    }
    dateFilter.date = dateCondition;
  }

  const where = {
    eleveId,
    etablissementId,
    ...dateFilter,
  };

  const [totalJours, joursPresent] = await Promise.all([
    prisma.presence.count({ where }),
    prisma.presence.count({ where: { ...where, present: true } }),
  ]);

  const joursAbsent = totalJours - joursPresent;
  const tauxPresence = totalJours > 0
    ? Math.round((joursPresent / totalJours) * 10000) / 100
    : 0;

  return {
    eleveId,
    totalJours,
    joursPresent,
    joursAbsent,
    tauxPresence,
  };
}

// ==================== STATISTIQUES CLASSE ====================

export async function getStatistiquesClasse(
  classeId: string,
  etablissementId: string,
  periodeDebut?: string,
  periodeFin?: string,
) {
  // Build the date filter based on date range if provided
  const dateFilter: Record<string, unknown> = {};

  if (periodeDebut || periodeFin) {
    const dateCondition: Record<string, Date> = {};
    if (periodeDebut) {
      dateCondition.gte = new Date(periodeDebut);
    }
    if (periodeFin) {
      dateCondition.lte = new Date(periodeFin);
    }
    dateFilter.date = dateCondition;
  }

  const where = {
    classeId,
    etablissementId,
    ...dateFilter,
  };

  const [totalRecords, presentRecords] = await Promise.all([
    prisma.presence.count({ where }),
    prisma.presence.count({ where: { ...where, present: true } }),
  ]);

  const tauxPresenceMoyen = totalRecords > 0
    ? Math.round((presentRecords / totalRecords) * 10000) / 100
    : 0;

  // Find students with most absences
  const absencesByEleve = await prisma.presence.groupBy({
    by: ['eleveId'],
    where: {
      ...where,
      present: false,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  // Get student details for the most absent students
  const eleveIds = absencesByEleve.map((a) => a.eleveId);
  const eleves = await prisma.eleve.findMany({
    where: {
      id: { in: eleveIds },
      etablissementId,
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      numeroEleve: true,
    },
  });

  const elevesMap = new Map(eleves.map((e) => [e.id, e]));

  const elevesPlusAbsents = absencesByEleve.map((a) => ({
    eleve: elevesMap.get(a.eleveId) || { id: a.eleveId, nom: '', prenom: '', numeroEleve: null },
    absences: a._count.id,
  }));

  return {
    classeId,
    totalEnregistrements: totalRecords,
    totalPresences: presentRecords,
    totalAbsences: totalRecords - presentRecords,
    tauxPresenceMoyen,
    elevesPlusAbsents,
  };
}
