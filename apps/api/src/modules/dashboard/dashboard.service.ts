import prisma from '../../config/database.js';

// ==================== TYPES ====================

interface DashboardDirecteur {
  totalEleves: number;
  totalClasses: number;
  totalEnseignants: number;
  tauxPresence: number;
  facturesImpayees: number;
  montantImpaye: number;
  recettesMois: number;
  inscriptionsEnAttente: number;
}

interface EnseignantClasseInfo {
  classeId: string;
  classeNom: string;
  classeNiveau: string;
  totalEleves: number;
  tauxPresence: number;
}

interface DashboardEnseignant {
  mesClasses: EnseignantClasseInfo[];
  totalElevesClasses: number;
}

interface DashboardComptable {
  totalFacture: number;
  totalPaye: number;
  tauxPaiement: number;
  impayesCount: number;
  montantImpaye: number;
}

interface DashboardSecretaire {
  inscriptionsEnAttente: number;
  admissionsACompleter: number;
  elevesTotal: number;
}

interface Alerte {
  type: 'impaye' | 'absence' | 'echeance';
  priorite: 'haute' | 'moyenne' | 'basse';
  message: string;
  count: number;
}

// ==================== HELPERS ====================

function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getLast30Days(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ==================== GET DASHBOARD DATA ====================

export async function getDashboardData(
  etablissementId: string,
  role: string,
  userId?: string,
): Promise<DashboardDirecteur | DashboardEnseignant | DashboardComptable | DashboardSecretaire> {
  switch (role) {
    case 'directeur':
    case 'admin':
      return getDirecteurDashboard(etablissementId);
    case 'enseignant':
      return getEnseignantDashboard(etablissementId, userId);
    case 'comptable':
      return getComptableDashboard(etablissementId);
    case 'secretaire':
      return getSecretaireDashboard(etablissementId);
    default:
      return getDirecteurDashboard(etablissementId);
  }
}

// ==================== DIRECTEUR / ADMIN DASHBOARD ====================

async function getDirecteurDashboard(etablissementId: string): Promise<DashboardDirecteur> {
  const thirtyDaysAgo = getLast30Days();
  const startOfMonth = getStartOfMonth();
  const endOfMonth = getEndOfMonth();

  const [
    totalEleves,
    totalClasses,
    totalEnseignants,
    presencesTotal,
    presencesPresent,
    facturesImpayees,
    montantImpayeResult,
    recettesMoisResult,
    inscriptionsEnAttente,
  ] = await Promise.all([
    // Total eleves with statut 'admis'
    prisma.eleve.count({
      where: { etablissementId, statut: 'admis' },
    }),

    // Total classes
    prisma.classe.count({
      where: { etablissementId },
    }),

    // Total enseignants
    prisma.enseignant.count({
      where: { etablissementId },
    }),

    // Total presences last 30 days (all records)
    prisma.presence.count({
      where: {
        etablissementId,
        date: { gte: thirtyDaysAgo },
      },
    }),

    // Present last 30 days
    prisma.presence.count({
      where: {
        etablissementId,
        date: { gte: thirtyDaysAgo },
        present: true,
      },
    }),

    // Factures impayees count
    prisma.facture.count({
      where: { etablissementId, statut: 'impayee' },
    }),

    // Montant impaye sum
    prisma.facture.aggregate({
      where: { etablissementId, statut: 'impayee' },
      _sum: { montant: true },
    }),

    // Recettes du mois (sum paiements this month)
    prisma.paiementRecord.aggregate({
      where: {
        etablissementId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { montant: true },
    }),

    // Inscriptions en attente (statut inscrit)
    prisma.eleve.count({
      where: { etablissementId, statut: 'inscrit' },
    }),
  ]);

  const tauxPresence = presencesTotal > 0
    ? Math.round((presencesPresent / presencesTotal) * 10000) / 100
    : 0;

  return {
    totalEleves,
    totalClasses,
    totalEnseignants,
    tauxPresence,
    facturesImpayees,
    montantImpaye: montantImpayeResult._sum.montant || 0,
    recettesMois: recettesMoisResult._sum.montant || 0,
    inscriptionsEnAttente,
  };
}

// ==================== ENSEIGNANT DASHBOARD ====================

async function getEnseignantDashboard(
  etablissementId: string,
  userId?: string,
): Promise<DashboardEnseignant> {
  const thirtyDaysAgo = getLast30Days();

  // Find the enseignant linked to this user by matching email
  let enseignantId: string | null = null;

  if (userId) {
    const utilisateur = await prisma.utilisateur.findFirst({
      where: { id: userId, etablissementId },
      select: { email: true },
    });

    if (utilisateur) {
      const enseignant = await prisma.enseignant.findFirst({
        where: { email: utilisateur.email, etablissementId },
        select: { id: true },
      });

      if (enseignant) {
        enseignantId = enseignant.id;
      }
    }
  }

  if (!enseignantId) {
    return { mesClasses: [], totalElevesClasses: 0 };
  }

  // Get active affectations for this teacher
  const affectations = await prisma.affectationEnseignant.findMany({
    where: {
      enseignantId,
      etablissementId,
      dateFin: null,
    },
    include: {
      classe: {
        select: { id: true, nom: true, niveau: true },
      },
    },
  });

  // Deduplicate classes (teacher may teach multiple subjects in same class)
  const uniqueClassesMap = new Map<string, { id: string; nom: string; niveau: string }>();
  for (const aff of affectations) {
    if (!uniqueClassesMap.has(aff.classe.id)) {
      uniqueClassesMap.set(aff.classe.id, aff.classe);
    }
  }

  const classeIds = Array.from(uniqueClassesMap.keys());

  // Get student count and attendance for each class
  const mesClasses: EnseignantClasseInfo[] = await Promise.all(
    classeIds.map(async (classeId) => {
      const classe = uniqueClassesMap.get(classeId)!;

      const [totalEleves, presencesTotal, presencesPresent] = await Promise.all([
        prisma.affectationEleve.count({
          where: {
            classeId,
            etablissementId,
            dateFin: null,
          },
        }),
        prisma.presence.count({
          where: {
            classeId,
            etablissementId,
            date: { gte: thirtyDaysAgo },
          },
        }),
        prisma.presence.count({
          where: {
            classeId,
            etablissementId,
            date: { gte: thirtyDaysAgo },
            present: true,
          },
        }),
      ]);

      const tauxPresence = presencesTotal > 0
        ? Math.round((presencesPresent / presencesTotal) * 10000) / 100
        : 0;

      return {
        classeId: classe.id,
        classeNom: classe.nom,
        classeNiveau: classe.niveau,
        totalEleves,
        tauxPresence,
      };
    }),
  );

  const totalElevesClasses = mesClasses.reduce((sum, c) => sum + c.totalEleves, 0);

  return {
    mesClasses,
    totalElevesClasses,
  };
}

// ==================== COMPTABLE DASHBOARD ====================

async function getComptableDashboard(etablissementId: string): Promise<DashboardComptable> {
  const startOfMonth = getStartOfMonth();
  const endOfMonth = getEndOfMonth();

  const [
    totalFactureResult,
    totalPayeResult,
    impayesCount,
    montantImpayeResult,
  ] = await Promise.all([
    // Total factures emitted this month
    prisma.facture.aggregate({
      where: {
        etablissementId,
        dateEmission: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { montant: true },
    }),

    // Total paid this month
    prisma.paiementRecord.aggregate({
      where: {
        etablissementId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { montant: true },
    }),

    // Impayes count
    prisma.facture.count({
      where: { etablissementId, statut: 'impayee' },
    }),

    // Montant impaye
    prisma.facture.aggregate({
      where: { etablissementId, statut: 'impayee' },
      _sum: { montant: true },
    }),
  ]);

  const totalFacture = totalFactureResult._sum.montant || 0;
  const totalPaye = totalPayeResult._sum.montant || 0;
  const tauxPaiement = totalFacture > 0
    ? Math.round((totalPaye / totalFacture) * 10000) / 100
    : 0;

  return {
    totalFacture,
    totalPaye,
    tauxPaiement,
    impayesCount,
    montantImpaye: montantImpayeResult._sum.montant || 0,
  };
}

// ==================== SECRETAIRE DASHBOARD ====================

async function getSecretaireDashboard(etablissementId: string): Promise<DashboardSecretaire> {
  const [inscriptionsEnAttente, admissionsACompleter, elevesTotal] = await Promise.all([
    // Inscriptions en attente (statut inscrit, not yet admis)
    prisma.eleve.count({
      where: { etablissementId, statut: 'inscrit' },
    }),

    // Admissions a completer: admis students without an active class affectation
    prisma.eleve.count({
      where: {
        etablissementId,
        statut: 'admis',
        affectations: {
          none: { dateFin: null },
        },
      },
    }),

    // Total eleves (all non-desinscrit)
    prisma.eleve.count({
      where: {
        etablissementId,
        statut: { not: 'desinscrit' },
      },
    }),
  ]);

  return {
    inscriptionsEnAttente,
    admissionsACompleter,
    elevesTotal,
  };
}

// ==================== GET ALERTES ====================

export async function getAlertes(etablissementId: string): Promise<Alerte[]> {
  const thirtyDaysAgo = getLast30Days();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const alertes: Alerte[] = [];

  // 1. Overdue invoices (impayee count > 0) -> type: 'impaye', priorite: 'haute'
  const impayeCount = await prisma.facture.count({
    where: { etablissementId, statut: 'impayee' },
  });

  if (impayeCount > 0) {
    alertes.push({
      type: 'impaye',
      priorite: 'haute',
      message: `${impayeCount} facture${impayeCount > 1 ? 's' : ''} impayée${impayeCount > 1 ? 's' : ''}`,
      count: impayeCount,
    });
  }

  // 2. High absenteeism students (rate < 70% last 30 days) -> type: 'absence', priorite: 'moyenne'
  // Get all students with presence records in last 30 days, grouped by student
  const presencesByEleve = await prisma.presence.groupBy({
    by: ['eleveId'],
    where: {
      etablissementId,
      date: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
  });

  const presentByEleve = await prisma.presence.groupBy({
    by: ['eleveId'],
    where: {
      etablissementId,
      date: { gte: thirtyDaysAgo },
      present: true,
    },
    _count: { id: true },
  });

  const presentMap = new Map<string, number>();
  for (const p of presentByEleve) {
    presentMap.set(p.eleveId, p._count.id);
  }

  let absenteeismCount = 0;
  for (const total of presencesByEleve) {
    const presentCount = presentMap.get(total.eleveId) || 0;
    const rate = (presentCount / total._count.id) * 100;
    if (rate < 70) {
      absenteeismCount++;
    }
  }

  if (absenteeismCount > 0) {
    alertes.push({
      type: 'absence',
      priorite: 'moyenne',
      message: `${absenteeismCount} élève${absenteeismCount > 1 ? 's' : ''} avec un taux de présence inférieur à 70%`,
      count: absenteeismCount,
    });
  }

  // 3. Pending inscriptions older than 7 days -> type: 'echeance', priorite: 'basse'
  const oldPendingCount = await prisma.eleve.count({
    where: {
      etablissementId,
      statut: 'inscrit',
      creeLe: { lte: sevenDaysAgo },
    },
  });

  if (oldPendingCount > 0) {
    alertes.push({
      type: 'echeance',
      priorite: 'basse',
      message: `${oldPendingCount} inscription${oldPendingCount > 1 ? 's' : ''} en attente depuis plus de 7 jours`,
      count: oldPendingCount,
    });
  }

  return alertes;
}
