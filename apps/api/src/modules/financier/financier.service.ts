import prisma from '../../config/database.js';

// ==================== TYPES ====================

interface PaginationParams {
  skip: number;
  limit: number;
  page: number;
}

interface FactureFilters {
  eleveId?: string;
  statut?: string;
  periode?: string;
  typeFraisId?: string;
}

interface PaiementFilters {
  eleveId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface CreatePaiementData {
  eleveId: string;
  montant: number;
  mode: string;
  reference?: string;
  factureIds: string[];
}

// ==================== TYPES DE FRAIS ====================

export async function getTypesFrais(etablissementId: string) {
  return prisma.typeFrais.findMany({
    where: { etablissementId },
    orderBy: { nom: 'asc' },
    include: {
      montants: true,
    },
  });
}

export async function createTypeFrais(
  data: { nom: string; description?: string },
  etablissementId: string,
) {
  // Check unique nom per etablissement
  const existing = await prisma.typeFrais.findFirst({
    where: { nom: data.nom, etablissementId },
  });

  if (existing) {
    throw new Error('TYPE_FRAIS_ALREADY_EXISTS');
  }

  return prisma.typeFrais.create({
    data: {
      nom: data.nom,
      description: data.description || null,
      etablissementId,
    },
  });
}

export async function updateTypeFrais(
  id: string,
  data: { nom?: string; description?: string },
  etablissementId: string,
) {
  const typeFrais = await prisma.typeFrais.findFirst({
    where: { id, etablissementId },
  });

  if (!typeFrais) {
    throw new Error('TYPE_FRAIS_NOT_FOUND');
  }

  // If nom is being changed, check uniqueness
  if (data.nom && data.nom !== typeFrais.nom) {
    const existing = await prisma.typeFrais.findFirst({
      where: { nom: data.nom, etablissementId },
    });

    if (existing) {
      throw new Error('TYPE_FRAIS_ALREADY_EXISTS');
    }
  }

  return prisma.typeFrais.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

// ==================== MONTANTS FRAIS ====================

export async function getMontantsFrais(
  etablissementId: string,
  typeFraisId?: string,
) {
  const where: Record<string, unknown> = { etablissementId };

  if (typeFraisId) {
    where.typeFraisId = typeFraisId;
  }

  return prisma.montantFrais.findMany({
    where,
    orderBy: { montant: 'asc' },
    include: {
      typeFrais: { select: { id: true, nom: true } },
      classe: { select: { id: true, nom: true, niveau: true } },
    },
  });
}

export async function createMontantFrais(
  data: {
    typeFraisId: string;
    niveau?: string;
    classeId?: string;
    montant: number;
    echeance?: string | Date;
  },
  etablissementId: string,
) {
  // Verify typeFrais belongs to this etablissement
  const typeFrais = await prisma.typeFrais.findFirst({
    where: { id: data.typeFraisId, etablissementId },
  });

  if (!typeFrais) {
    throw new Error('TYPE_FRAIS_NOT_FOUND');
  }

  // Verify classe belongs to this etablissement if provided
  if (data.classeId) {
    const classe = await prisma.classe.findFirst({
      where: { id: data.classeId, etablissementId },
    });

    if (!classe) {
      throw new Error('CLASSE_NOT_FOUND');
    }
  }

  return prisma.montantFrais.create({
    data: {
      typeFraisId: data.typeFraisId,
      niveau: data.niveau || null,
      classeId: data.classeId || null,
      montant: data.montant,
      echeance: data.echeance ? new Date(data.echeance) : null,
      etablissementId,
    },
    include: {
      typeFrais: { select: { id: true, nom: true } },
      classe: { select: { id: true, nom: true, niveau: true } },
    },
  });
}

export async function updateMontantFrais(
  id: string,
  data: {
    niveau?: string;
    classeId?: string;
    montant?: number;
    echeance?: string | Date;
  },
  etablissementId: string,
) {
  const montantFrais = await prisma.montantFrais.findFirst({
    where: { id, etablissementId },
  });

  if (!montantFrais) {
    throw new Error('MONTANT_FRAIS_NOT_FOUND');
  }

  // Verify classe belongs to this etablissement if provided
  if (data.classeId) {
    const classe = await prisma.classe.findFirst({
      where: { id: data.classeId, etablissementId },
    });

    if (!classe) {
      throw new Error('CLASSE_NOT_FOUND');
    }
  }

  return prisma.montantFrais.update({
    where: { id },
    data: {
      ...(data.niveau !== undefined && { niveau: data.niveau || null }),
      ...(data.classeId !== undefined && { classeId: data.classeId || null }),
      ...(data.montant !== undefined && { montant: data.montant }),
      ...(data.echeance !== undefined && {
        echeance: data.echeance ? new Date(data.echeance) : null,
      }),
    },
    include: {
      typeFrais: { select: { id: true, nom: true } },
      classe: { select: { id: true, nom: true, niveau: true } },
    },
  });
}

// ==================== FACTURES ====================

export async function getFactures(
  etablissementId: string,
  pagination: PaginationParams,
  filters?: FactureFilters,
) {
  const where: Record<string, unknown> = { etablissementId };

  if (filters?.eleveId) {
    where.eleveId = filters.eleveId;
  }

  if (filters?.statut) {
    where.statut = filters.statut;
  }

  if (filters?.periode) {
    where.periode = filters.periode;
  }

  if (filters?.typeFraisId) {
    where.typeFraisId = filters.typeFraisId;
  }

  const [data, total] = await Promise.all([
    prisma.facture.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { creeLe: 'desc' },
      include: {
        eleve: {
          select: { id: true, nom: true, prenom: true, numeroEleve: true },
        },
        typeFrais: { select: { id: true, nom: true } },
      },
    }),
    prisma.facture.count({ where }),
  ]);

  return { data, total };
}

export async function getFactureById(id: string, etablissementId: string) {
  const facture = await prisma.facture.findFirst({
    where: { id, etablissementId },
    include: {
      eleve: {
        select: { id: true, nom: true, prenom: true, numeroEleve: true },
      },
      typeFrais: { select: { id: true, nom: true } },
      paiementFactures: {
        include: {
          paiement: {
            select: {
              id: true,
              montant: true,
              date: true,
              mode: true,
              reference: true,
            },
          },
        },
      },
    },
  });

  if (!facture) {
    throw new Error('FACTURE_NOT_FOUND');
  }

  return facture;
}

export async function createFacture(
  data: {
    eleveId: string;
    typeFraisId: string;
    montant: number;
    dateEcheance: string | Date;
    periode: string;
  },
  etablissementId: string,
) {
  // Verify eleve belongs to this etablissement
  const eleve = await prisma.eleve.findFirst({
    where: { id: data.eleveId, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  // Verify typeFrais belongs to this etablissement
  const typeFrais = await prisma.typeFrais.findFirst({
    where: { id: data.typeFraisId, etablissementId },
  });

  if (!typeFrais) {
    throw new Error('TYPE_FRAIS_NOT_FOUND');
  }

  return prisma.facture.create({
    data: {
      eleveId: data.eleveId,
      typeFraisId: data.typeFraisId,
      montant: data.montant,
      dateEcheance: new Date(data.dateEcheance),
      periode: data.periode,
      statut: 'emise',
      etablissementId,
    },
    include: {
      eleve: {
        select: { id: true, nom: true, prenom: true, numeroEleve: true },
      },
      typeFrais: { select: { id: true, nom: true } },
    },
  });
}

export async function updateFactureStatuts(etablissementId: string) {
  const now = new Date();

  const result = await prisma.facture.updateMany({
    where: {
      etablissementId,
      statut: 'emise',
      dateEcheance: { lt: now },
    },
    data: {
      statut: 'impayee',
    },
  });

  return { updated: result.count };
}

export async function getFacturesImpayees(
  etablissementId: string,
  pagination: PaginationParams,
  filters?: FactureFilters,
) {
  const where: Record<string, unknown> = {
    etablissementId,
    statut: { in: ['impayee', 'partiellement_payee'] },
  };

  if (filters?.eleveId) {
    where.eleveId = filters.eleveId;
  }

  if (filters?.periode) {
    where.periode = filters.periode;
  }

  if (filters?.typeFraisId) {
    where.typeFraisId = filters.typeFraisId;
  }

  const [data, total] = await Promise.all([
    prisma.facture.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { dateEcheance: 'asc' },
      include: {
        eleve: {
          select: { id: true, nom: true, prenom: true, numeroEleve: true },
        },
        typeFrais: { select: { id: true, nom: true } },
        paiementFactures: {
          select: { montantAffecte: true },
        },
      },
    }),
    prisma.facture.count({ where }),
  ]);

  // Add remaining amount for each invoice
  const dataWithRemaining = data.map((facture) => {
    const totalPaye = facture.paiementFactures.reduce(
      (sum, pf) => sum + pf.montantAffecte,
      0,
    );
    return {
      ...facture,
      montantRestant: facture.montant - totalPaye,
    };
  });

  return { data: dataWithRemaining, total };
}

// ==================== PAIEMENTS ====================

export async function getPaiements(
  etablissementId: string,
  pagination: PaginationParams,
  filters?: PaiementFilters,
) {
  const where: Record<string, unknown> = { etablissementId };

  if (filters?.eleveId) {
    where.eleveId = filters.eleveId;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      (where.date as Record<string, unknown>).gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      (where.date as Record<string, unknown>).lte = new Date(filters.dateTo);
    }
  }

  const [data, total] = await Promise.all([
    prisma.paiementRecord.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { creeLe: 'desc' },
      include: {
        eleve: {
          select: { id: true, nom: true, prenom: true, numeroEleve: true },
        },
        paiementFactures: {
          include: {
            facture: {
              select: {
                id: true,
                montant: true,
                statut: true,
                periode: true,
                typeFrais: { select: { id: true, nom: true } },
              },
            },
          },
        },
      },
    }),
    prisma.paiementRecord.count({ where }),
  ]);

  return { data, total };
}

export async function createPaiement(
  data: CreatePaiementData,
  etablissementId: string,
) {
  const { eleveId, montant, mode, reference, factureIds } = data;

  // Verify eleve belongs to this etablissement
  const eleve = await prisma.eleve.findFirst({
    where: { id: eleveId, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  // Verify all factures belong to this eleve and etablissement
  const factures = await prisma.facture.findMany({
    where: {
      id: { in: factureIds },
      eleveId,
      etablissementId,
    },
    include: {
      paiementFactures: {
        select: { montantAffecte: true },
      },
    },
    orderBy: { dateEcheance: 'asc' },
  });

  if (factures.length !== factureIds.length) {
    throw new Error('FACTURE_NOT_FOUND');
  }

  // Check that factures are not already fully paid
  const facturesWithRemaining = factures.map((facture) => {
    const totalDejaAffecte = facture.paiementFactures.reduce(
      (sum, pf) => sum + pf.montantAffecte,
      0,
    );
    const remaining = facture.montant - totalDejaAffecte;
    return { ...facture, remaining };
  });

  const totalRemaining = facturesWithRemaining.reduce(
    (sum, f) => sum + Math.max(0, f.remaining),
    0,
  );

  // Perform payment distribution within a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the payment record
    const paiement = await tx.paiementRecord.create({
      data: {
        eleveId,
        montant,
        mode,
        reference: reference || null,
        etablissementId,
      },
    });

    // Distribute payment across invoices
    let remainingPayment = montant;
    const paiementFacturesCreated: Array<{
      factureId: string;
      montantAffecte: number;
    }> = [];

    for (const facture of facturesWithRemaining) {
      if (remainingPayment <= 0) break;
      if (facture.remaining <= 0) continue;

      const allocation = Math.min(remainingPayment, facture.remaining);

      await tx.paiementFacture.create({
        data: {
          paiementId: paiement.id,
          factureId: facture.id,
          montantAffecte: allocation,
        },
      });

      paiementFacturesCreated.push({
        factureId: facture.id,
        montantAffecte: allocation,
      });

      // Determine new invoice status
      const newTotalPaid =
        facture.montant - facture.remaining + allocation;
      let newStatut: string;

      if (newTotalPaid >= facture.montant) {
        newStatut = 'payee';
      } else {
        newStatut = 'partiellement_payee';
      }

      await tx.facture.update({
        where: { id: facture.id },
        data: { statut: newStatut },
      });

      remainingPayment -= allocation;
    }

    // If there is excess payment, create a credit
    if (remainingPayment > 0) {
      await tx.credit.create({
        data: {
          eleveId,
          montant: remainingPayment,
          soldeRestant: remainingPayment,
          etablissementId,
        },
      });
    }

    // Return the complete payment record
    return tx.paiementRecord.findFirst({
      where: { id: paiement.id },
      include: {
        eleve: {
          select: { id: true, nom: true, prenom: true, numeroEleve: true },
        },
        paiementFactures: {
          include: {
            facture: {
              select: {
                id: true,
                montant: true,
                statut: true,
                periode: true,
                typeFrais: { select: { id: true, nom: true } },
              },
            },
          },
        },
      },
    });
  });

  return result;
}

export async function getRecu(paiementId: string, etablissementId: string) {
  const paiement = await prisma.paiementRecord.findFirst({
    where: { id: paiementId, etablissementId },
    include: {
      eleve: {
        select: { id: true, nom: true, prenom: true, numeroEleve: true },
      },
      paiementFactures: {
        include: {
          facture: {
            select: {
              id: true,
              montant: true,
              statut: true,
              periode: true,
              typeFrais: { select: { id: true, nom: true } },
            },
          },
        },
      },
    },
  });

  if (!paiement) {
    throw new Error('PAIEMENT_NOT_FOUND');
  }

  // Get establishment info
  const etablissement = await prisma.etablissement.findFirst({
    where: { id: etablissementId },
    select: {
      id: true,
      nom: true,
      adresse: true,
      telephone: true,
      email: true,
      logoUrl: true,
    },
  });

  return {
    recu: {
      paiementId: paiement.id,
      date: paiement.date,
      mode: paiement.mode,
      reference: paiement.reference,
      montant: paiement.montant,
      eleve: paiement.eleve,
      etablissement,
      facturesPayees: paiement.paiementFactures.map((pf) => ({
        factureId: pf.facture.id,
        typeFrais: pf.facture.typeFrais.nom,
        periode: pf.facture.periode,
        montantFacture: pf.facture.montant,
        montantAffecte: pf.montantAffecte,
        statut: pf.facture.statut,
      })),
    },
  };
}

// ==================== SOLDES & CREDITS ====================

export async function getSoldeEleve(
  eleveId: string,
  etablissementId: string,
) {
  // Verify eleve belongs to this etablissement
  const eleve = await prisma.eleve.findFirst({
    where: { id: eleveId, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  const [facturesAggregate, paiementsAggregate, creditsAggregate] =
    await Promise.all([
      prisma.facture.aggregate({
        where: { eleveId, etablissementId },
        _sum: { montant: true },
      }),
      prisma.paiementRecord.aggregate({
        where: { eleveId, etablissementId },
        _sum: { montant: true },
      }),
      prisma.credit.aggregate({
        where: { eleveId, etablissementId },
        _sum: { soldeRestant: true },
      }),
    ]);

  const totalFacture = facturesAggregate._sum.montant || 0;
  const totalPaye = paiementsAggregate._sum.montant || 0;
  const credits = creditsAggregate._sum.soldeRestant || 0;

  return {
    totalFacture,
    totalPaye,
    solde: totalFacture - totalPaye,
    credits,
  };
}

export async function getCredits(eleveId: string, etablissementId: string) {
  // Verify eleve belongs to this etablissement
  const eleve = await prisma.eleve.findFirst({
    where: { id: eleveId, etablissementId },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  return prisma.credit.findMany({
    where: { eleveId, etablissementId },
    orderBy: { montant: 'desc' },
  });
}

// ==================== RAPPORTS ====================

export async function getRapportRecettes(
  etablissementId: string,
  dateFrom?: string,
  dateTo?: string,
  typeFraisId?: string,
) {
  // Build the where clause for paiements
  const paiementWhere: Record<string, unknown> = { etablissementId };

  if (dateFrom || dateTo) {
    paiementWhere.date = {};
    if (dateFrom) {
      (paiementWhere.date as Record<string, unknown>).gte = new Date(dateFrom);
    }
    if (dateTo) {
      (paiementWhere.date as Record<string, unknown>).lte = new Date(dateTo);
    }
  }

  // Get all payments in the period with their invoice allocations
  const paiements = await prisma.paiementRecord.findMany({
    where: paiementWhere,
    include: {
      paiementFactures: {
        include: {
          facture: {
            select: {
              typeFraisId: true,
              typeFrais: { select: { id: true, nom: true } },
            },
          },
        },
      },
    },
  });

  // Aggregate by fee type
  const recettesParType: Record<
    string,
    { typeFraisId: string; typeFraisNom: string; total: number }
  > = {};

  for (const paiement of paiements) {
    for (const pf of paiement.paiementFactures) {
      const tfId = pf.facture.typeFraisId;
      const tfNom = pf.facture.typeFrais.nom;

      // If filtering by typeFraisId, skip non-matching
      if (typeFraisId && tfId !== typeFraisId) continue;

      if (!recettesParType[tfId]) {
        recettesParType[tfId] = {
          typeFraisId: tfId,
          typeFraisNom: tfNom,
          total: 0,
        };
      }

      recettesParType[tfId].total += pf.montantAffecte;
    }
  }

  const recettes = Object.values(recettesParType).sort(
    (a, b) => b.total - a.total,
  );

  const totalGeneral = recettes.reduce((sum, r) => sum + r.total, 0);

  return {
    periode: {
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    },
    recettes,
    totalGeneral,
  };
}

export async function getStatistiquesFinancieres(etablissementId: string) {
  const [
    facturesAggregate,
    paiementsAggregate,
    nombreFacturesEmises,
    nombreFacturesPayees,
    nombreFacturesImpayees,
    nombreFacturesPartiellement,
  ] = await Promise.all([
    prisma.facture.aggregate({
      where: { etablissementId },
      _sum: { montant: true },
    }),
    prisma.paiementRecord.aggregate({
      where: { etablissementId },
      _sum: { montant: true },
    }),
    prisma.facture.count({
      where: { etablissementId, statut: 'emise' },
    }),
    prisma.facture.count({
      where: { etablissementId, statut: 'payee' },
    }),
    prisma.facture.count({
      where: { etablissementId, statut: 'impayee' },
    }),
    prisma.facture.count({
      where: { etablissementId, statut: 'partiellement_payee' },
    }),
  ]);

  const totalFacture = facturesAggregate._sum.montant || 0;
  const totalPaye = paiementsAggregate._sum.montant || 0;
  const totalImpaye = totalFacture - totalPaye;
  const tauxPaiement = totalFacture > 0
    ? Math.round((totalPaye / totalFacture) * 10000) / 100
    : 0;

  return {
    totalFacture,
    totalPaye,
    totalImpaye,
    tauxPaiement,
    nombreFacturesEmises,
    nombreFacturesPayees,
    nombreFacturesImpayees,
    nombreFacturesPartiellement,
  };
}
