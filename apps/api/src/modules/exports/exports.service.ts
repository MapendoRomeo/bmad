import ExcelJS from 'exceljs';
import prisma from '../../config/database.js';

// ==================== TYPES ====================

interface ExportElevesFilters {
  statut?: string;
  classeId?: string;
}

interface ExportPaiementsFilters {
  dateDebut?: string;
  dateFin?: string;
  eleveId?: string;
}

interface ExportFacturesFilters {
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  eleveId?: string;
}

// ==================== STYLE HELPERS ====================

function styleHeaderRow(worksheet: ExcelJS.Worksheet): void {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E79' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ==================== EXPORT ELEVES ====================

export async function exportEleves(
  etablissementId: string,
  filters?: ExportElevesFilters,
): Promise<Buffer> {
  // Build where clause
  const where: Record<string, unknown> = { etablissementId };

  if (filters?.statut) {
    where.statut = filters.statut;
  }

  if (filters?.classeId) {
    where.affectations = {
      some: {
        classeId: filters.classeId,
        dateFin: null,
      },
    };
  }

  // Fetch students with their current class
  const eleves = await prisma.eleve.findMany({
    where,
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    include: {
      affectations: {
        where: { dateFin: null },
        include: {
          classe: { select: { nom: true, niveau: true } },
        },
        take: 1,
      },
    },
  });

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SGS - Systeme de Gestion Scolaire';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Eleves');

  // Define columns
  worksheet.columns = [
    { header: 'Numéro', key: 'numero', width: 18 },
    { header: 'Nom', key: 'nom', width: 22 },
    { header: 'Prénom', key: 'prenom', width: 22 },
    { header: 'Date de naissance', key: 'dateNaissance', width: 18 },
    { header: 'Classe', key: 'classe', width: 25 },
    { header: 'Statut', key: 'statut', width: 15 },
    { header: 'Sexe', key: 'sexe', width: 10 },
  ];

  // Style header row
  styleHeaderRow(worksheet);

  // Add data rows
  for (const eleve of eleves) {
    const currentAffectation = eleve.affectations[0];
    const classeNom = currentAffectation
      ? `${currentAffectation.classe.nom} (${currentAffectation.classe.niveau})`
      : 'Non affecté';

    worksheet.addRow({
      numero: eleve.numeroEleve || '-',
      nom: eleve.nom,
      prenom: eleve.prenom,
      dateNaissance: formatDate(eleve.dateNaissance),
      classe: classeNom,
      statut: eleve.statut,
      sexe: eleve.sexe,
    });
  }

  // Auto-filter on header row
  worksheet.autoFilter = {
    from: 'A1',
    to: `G1`,
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// ==================== EXPORT PAIEMENTS ====================

export async function exportPaiements(
  etablissementId: string,
  filters?: ExportPaiementsFilters,
): Promise<Buffer> {
  // Build where clause
  const where: Record<string, unknown> = { etablissementId };

  if (filters?.eleveId) {
    where.eleveId = filters.eleveId;
  }

  if (filters?.dateDebut || filters?.dateFin) {
    const dateFilter: Record<string, Date> = {};
    if (filters?.dateDebut) {
      dateFilter.gte = new Date(filters.dateDebut);
    }
    if (filters?.dateFin) {
      dateFilter.lte = new Date(filters.dateFin);
    }
    where.date = dateFilter;
  }

  // Fetch paiements with student info and linked factures
  const paiements = await prisma.paiementRecord.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      eleve: {
        select: { nom: true, prenom: true, numeroEleve: true },
      },
      paiementFactures: {
        include: {
          facture: {
            select: { id: true, periode: true },
          },
        },
      },
    },
  });

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SGS - Systeme de Gestion Scolaire';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Paiements');

  // Define columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 16 },
    { header: 'Élève', key: 'eleve', width: 30 },
    { header: 'Montant', key: 'montant', width: 16 },
    { header: 'Mode', key: 'mode', width: 18 },
    { header: 'Référence', key: 'reference', width: 22 },
    { header: 'Factures associées', key: 'factures', width: 35 },
  ];

  // Style header row
  styleHeaderRow(worksheet);

  // Add data rows
  for (const paiement of paiements) {
    const eleveNom = `${paiement.eleve.nom} ${paiement.eleve.prenom}`;
    const facturesAssociees = paiement.paiementFactures
      .map((pf) => pf.facture.periode)
      .join(', ');

    const row = worksheet.addRow({
      date: formatDate(paiement.date),
      eleve: eleveNom,
      montant: paiement.montant,
      mode: paiement.mode,
      reference: paiement.reference || '-',
      factures: facturesAssociees || '-',
    });

    // Format montant column as number
    const montantCell = row.getCell('montant');
    montantCell.numFmt = '#,##0';
  }

  // Auto-filter on header row
  worksheet.autoFilter = {
    from: 'A1',
    to: 'F1',
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// ==================== EXPORT FACTURES ====================

export async function exportFactures(
  etablissementId: string,
  filters?: ExportFacturesFilters,
): Promise<Buffer> {
  // Build where clause
  const where: Record<string, unknown> = { etablissementId };

  if (filters?.statut) {
    where.statut = filters.statut;
  }

  if (filters?.eleveId) {
    where.eleveId = filters.eleveId;
  }

  if (filters?.dateDebut || filters?.dateFin) {
    const dateFilter: Record<string, Date> = {};
    if (filters?.dateDebut) {
      dateFilter.gte = new Date(filters.dateDebut);
    }
    if (filters?.dateFin) {
      dateFilter.lte = new Date(filters.dateFin);
    }
    where.dateEmission = dateFilter;
  }

  // Fetch factures with student info, type de frais, and paiements
  const factures = await prisma.facture.findMany({
    where,
    orderBy: { dateEmission: 'desc' },
    include: {
      eleve: {
        select: { nom: true, prenom: true, numeroEleve: true },
      },
      typeFrais: {
        select: { nom: true },
      },
      paiementFactures: {
        select: { montantAffecte: true },
      },
    },
  });

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SGS - Systeme de Gestion Scolaire';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Factures');

  // Define columns
  worksheet.columns = [
    { header: 'Numéro', key: 'numero', width: 18 },
    { header: 'Élève', key: 'eleve', width: 30 },
    { header: 'Type de frais', key: 'typeFrais', width: 22 },
    { header: 'Montant', key: 'montant', width: 16 },
    { header: "Date d'émission", key: 'dateEmission', width: 18 },
    { header: "Date d'échéance", key: 'dateEcheance', width: 18 },
    { header: 'Statut', key: 'statut', width: 20 },
    { header: 'Solde restant', key: 'soldeRestant', width: 16 },
  ];

  // Style header row
  styleHeaderRow(worksheet);

  // Add data rows
  for (const facture of factures) {
    const eleveNom = `${facture.eleve.nom} ${facture.eleve.prenom}`;
    const totalPaye = facture.paiementFactures.reduce(
      (sum, pf) => sum + pf.montantAffecte,
      0,
    );
    const soldeRestant = Math.max(0, facture.montant - totalPaye);

    const row = worksheet.addRow({
      numero: facture.id.substring(0, 8).toUpperCase(),
      eleve: eleveNom,
      typeFrais: facture.typeFrais.nom,
      montant: facture.montant,
      dateEmission: formatDate(facture.dateEmission),
      dateEcheance: formatDate(facture.dateEcheance),
      statut: facture.statut,
      soldeRestant,
    });

    // Format monetary columns
    row.getCell('montant').numFmt = '#,##0';
    row.getCell('soldeRestant').numFmt = '#,##0';
  }

  // Auto-filter on header row
  worksheet.autoFilter = {
    from: 'A1',
    to: 'H1',
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
