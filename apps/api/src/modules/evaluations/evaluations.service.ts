import prisma from '../../config/database.js';
import { MATIERES_SUGGEREES, DOMAINES_MATERNELLE } from '@sgs/shared';

// ==================== TYPES ====================

interface CreatePeriodeData {
  nom: string;
  dateDebut: string | Date;
  dateFin: string | Date;
  anneeScolaireId: string;
}

interface CreateMatiereData {
  nom: string;
  niveau: string;
  coefficient: number;
}

interface CreateNoteData {
  eleveId: string;
  matiereId: string;
  periodeId: string;
  note: number;
  noteMax: number;
  coefficient: number;
}

interface CreateEvalQualitativeData {
  eleveId: string;
  domaine: string;
  valeur: string;
  periodeId: string;
}

// ==================== PERIODES ====================

export async function getPeriodes(etablissementId: string, anneeScolaireId?: string) {
  const where: Record<string, unknown> = { etablissementId };

  if (anneeScolaireId) {
    where.anneeScolaireId = anneeScolaireId;
  }

  const periodes = await prisma.periode.findMany({
    where,
    orderBy: { dateDebut: 'asc' },
  });

  return periodes;
}

export async function createPeriode(data: CreatePeriodeData, etablissementId: string) {
  const dateDebut = new Date(data.dateDebut);
  const dateFin = new Date(data.dateFin);

  // Validate dateDebut < dateFin
  if (dateDebut >= dateFin) {
    throw new Error('DATE_DEBUT_APRES_FIN');
  }

  // Check no overlap with existing periods in the same academic year
  const overlapping = await prisma.periode.findFirst({
    where: {
      etablissementId,
      anneeScolaireId: data.anneeScolaireId,
      OR: [
        {
          dateDebut: { lte: dateFin },
          dateFin: { gte: dateDebut },
        },
      ],
    },
  });

  if (overlapping) {
    throw new Error('PERIODE_OVERLAP');
  }

  const periode = await prisma.periode.create({
    data: {
      nom: data.nom,
      dateDebut,
      dateFin,
      anneeScolaireId: data.anneeScolaireId,
      etablissementId,
    },
  });

  return periode;
}

// ==================== MATIERES ====================

export async function getMatieres(etablissementId: string, niveau?: string) {
  const where: Record<string, unknown> = { etablissementId };

  if (niveau) {
    where.niveau = niveau;
  }

  const matieres = await prisma.matiere.findMany({
    where,
    orderBy: [{ niveau: 'asc' }, { nom: 'asc' }],
  });

  return matieres;
}

export async function createMatiere(data: CreateMatiereData, etablissementId: string) {
  // Check unique constraint: nom + niveau + etablissementId
  const existing = await prisma.matiere.findFirst({
    where: {
      nom: data.nom,
      niveau: data.niveau,
      etablissementId,
    },
  });

  if (existing) {
    throw new Error('MATIERE_ALREADY_EXISTS');
  }

  const matiere = await prisma.matiere.create({
    data: {
      nom: data.nom,
      niveau: data.niveau,
      coefficient: data.coefficient,
      etablissementId,
    },
  });

  return matiere;
}

export function getSuggestedMatieres(niveau: string) {
  const key = niveau.toLowerCase() as keyof typeof MATIERES_SUGGEREES;

  if (key in MATIERES_SUGGEREES) {
    return MATIERES_SUGGEREES[key];
  }

  return [];
}

// ==================== NOTES ====================

export async function getNotes(
  classeId: string,
  matiereId: string,
  periodeId: string,
  etablissementId: string,
) {
  // Find active students in the class via AffectationEleve
  const affectations = await prisma.affectationEleve.findMany({
    where: {
      classeId,
      dateFin: null,
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
  });

  const eleveIds = affectations.map((a) => a.eleveId);

  // Get notes for these students in the given subject and period
  const notes = await prisma.note.findMany({
    where: {
      eleveId: { in: eleveIds },
      matiereId,
      periodeId,
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
    orderBy: { creeLe: 'desc' },
  });

  // Build a map of eleveId to their notes
  const notesMap = new Map<string, typeof notes>();
  for (const note of notes) {
    const existing = notesMap.get(note.eleveId) || [];
    existing.push(note);
    notesMap.set(note.eleveId, existing);
  }

  // Return students with their notes
  const result = affectations.map((a) => ({
    eleve: a.eleve,
    notes: notesMap.get(a.eleveId) || [],
  }));

  return result;
}

export async function createNote(data: CreateNoteData, etablissementId: string) {
  // Validate 0 <= note <= noteMax
  if (data.note < 0 || data.note > data.noteMax) {
    throw new Error('NOTE_INVALID');
  }

  const note = await prisma.note.create({
    data: {
      eleveId: data.eleveId,
      matiereId: data.matiereId,
      periodeId: data.periodeId,
      note: data.note,
      noteMax: data.noteMax,
      coefficient: data.coefficient,
      validee: false,
      etablissementId,
    },
    include: {
      eleve: {
        select: { id: true, nom: true, prenom: true },
      },
      matiere: {
        select: { id: true, nom: true },
      },
    },
  });

  return note;
}

export async function validerNote(noteId: string, etablissementId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, etablissementId },
  });

  if (!note) {
    throw new Error('NOTE_NOT_FOUND');
  }

  if (note.validee) {
    throw new Error('NOTE_ALREADY_VALIDATED');
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: { validee: true },
    include: {
      eleve: {
        select: { id: true, nom: true, prenom: true },
      },
      matiere: {
        select: { id: true, nom: true },
      },
    },
  });

  return updated;
}

// ==================== MOYENNES ====================

export async function calculateMoyennes(
  eleveId: string,
  periodeId: string,
  etablissementId: string,
) {
  // Get all validated notes for this student in this period
  const notes = await prisma.note.findMany({
    where: {
      eleveId,
      periodeId,
      etablissementId,
      validee: true,
    },
    include: {
      matiere: {
        select: { id: true, nom: true, coefficient: true },
      },
    },
  });

  // Group notes by subject
  const notesByMatiere = new Map<string, typeof notes>();
  for (const note of notes) {
    const existing = notesByMatiere.get(note.matiereId) || [];
    existing.push(note);
    notesByMatiere.set(note.matiereId, existing);
  }

  const matiereAverages: { matiereId: string; moyenne: number; coefficient: number }[] = [];

  // Calculate weighted average per subject
  for (const [matiereId, matiereNotes] of notesByMatiere) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const n of matiereNotes) {
      // Normalize to 20
      const normalized = (n.note / n.noteMax) * 20;
      weightedSum += normalized * n.coefficient;
      totalWeight += n.coefficient;
    }

    if (totalWeight > 0) {
      const moyenne = weightedSum / totalWeight;
      const matiereCoefficient = matiereNotes[0].matiere.coefficient;

      matiereAverages.push({
        matiereId,
        moyenne: Math.round(moyenne * 100) / 100,
        coefficient: matiereCoefficient,
      });

      // Upsert subject average in Moyenne table
      await prisma.moyenne.upsert({
        where: {
          eleveId_matiereId_periodeId: {
            eleveId,
            matiereId,
            periodeId,
          },
        },
        update: {
          moyenne: Math.round(moyenne * 100) / 100,
        },
        create: {
          eleveId,
          matiereId,
          periodeId,
          moyenne: Math.round(moyenne * 100) / 100,
          etablissementId,
        },
      });
    }
  }

  // Calculate general average: sum(subjectAvg * subjectCoeff) / sum(subjectCoeffs)
  let generalWeightedSum = 0;
  let generalTotalCoeff = 0;

  for (const ma of matiereAverages) {
    generalWeightedSum += ma.moyenne * ma.coefficient;
    generalTotalCoeff += ma.coefficient;
  }

  let moyenneGenerale = 0;
  if (generalTotalCoeff > 0) {
    moyenneGenerale = Math.round((generalWeightedSum / generalTotalCoeff) * 100) / 100;
  }

  // Upsert general average (matiereId = null)
  await prisma.moyenne.upsert({
    where: {
      eleveId_matiereId_periodeId: {
        eleveId,
        matiereId: '',
        periodeId,
      },
    },
    update: {
      moyenne: moyenneGenerale,
    },
    create: {
      eleveId,
      matiereId: null,
      periodeId,
      moyenne: moyenneGenerale,
      etablissementId,
    },
  });

  return {
    eleveId,
    periodeId,
    matieres: matiereAverages,
    moyenneGenerale,
  };
}

export async function getMoyennes(
  eleveId: string,
  periodeId: string | undefined,
  etablissementId: string,
) {
  const where: Record<string, unknown> = { eleveId, etablissementId };

  if (periodeId) {
    where.periodeId = periodeId;
  }

  const moyennes = await prisma.moyenne.findMany({
    where,
    include: {
      matiere: {
        select: { id: true, nom: true, coefficient: true },
      },
      periode: {
        select: { id: true, nom: true },
      },
    },
    orderBy: [{ periodeId: 'asc' }],
  });

  return moyennes;
}

// ==================== EVALUATIONS QUALITATIVES ====================

export async function getEvaluationsQualitatives(
  eleveId: string,
  periodeId: string,
  etablissementId: string,
) {
  const evaluations = await prisma.evaluationQualitative.findMany({
    where: {
      eleveId,
      periodeId,
      etablissementId,
    },
    orderBy: { domaine: 'asc' },
  });

  return evaluations;
}

export async function createEvalQualitative(
  data: CreateEvalQualitativeData,
  etablissementId: string,
) {
  const evaluation = await prisma.evaluationQualitative.create({
    data: {
      eleveId: data.eleveId,
      domaine: data.domaine,
      valeur: data.valeur,
      periodeId: data.periodeId,
      etablissementId,
    },
  });

  return evaluation;
}

// ==================== RATTRAPAGE ====================

export async function createRattrapage(
  noteId: string,
  dateLimite: string | Date,
  etablissementId: string,
) {
  // Verify the original note exists
  const note = await prisma.note.findFirst({
    where: { id: noteId, etablissementId },
  });

  if (!note) {
    throw new Error('NOTE_NOT_FOUND');
  }

  // Check if a rattrapage already exists for this note
  const existing = await prisma.evaluationRattrapage.findUnique({
    where: { noteOriginaleId: noteId },
  });

  if (existing) {
    throw new Error('RATTRAPAGE_ALREADY_EXISTS');
  }

  const rattrapage = await prisma.evaluationRattrapage.create({
    data: {
      noteOriginaleId: noteId,
      dateLimite: new Date(dateLimite),
      etablissementId,
    },
    include: {
      noteOriginale: {
        include: {
          eleve: { select: { id: true, nom: true, prenom: true } },
          matiere: { select: { id: true, nom: true } },
        },
      },
    },
  });

  return rattrapage;
}

export async function saisirNoteRattrapage(
  rattrapageId: string,
  noteRattrapage: number,
  etablissementId: string,
) {
  const rattrapage = await prisma.evaluationRattrapage.findFirst({
    where: { id: rattrapageId, etablissementId },
    include: {
      noteOriginale: true,
    },
  });

  if (!rattrapage) {
    throw new Error('RATTRAPAGE_NOT_FOUND');
  }

  if (rattrapage.noteRattrapage !== null) {
    throw new Error('RATTRAPAGE_ALREADY_GRADED');
  }

  // Validate the makeup grade against the original noteMax
  const noteMax = rattrapage.noteOriginale.noteMax;
  if (noteRattrapage < 0 || noteRattrapage > noteMax) {
    throw new Error('NOTE_INVALID');
  }

  // Update the rattrapage with the makeup grade
  const updatedRattrapage = await prisma.evaluationRattrapage.update({
    where: { id: rattrapageId },
    data: { noteRattrapage },
  });

  // If the makeup grade is better than the original, replace the original note
  if (noteRattrapage > rattrapage.noteOriginale.note) {
    await prisma.note.update({
      where: { id: rattrapage.noteOriginaleId },
      data: { note: noteRattrapage },
    });
  }

  return updatedRattrapage;
}

// ==================== BULLETIN ====================

export async function getBulletin(
  eleveId: string,
  periodeId: string,
  etablissementId: string,
) {
  // Get student info with current class
  const eleve = await prisma.eleve.findFirst({
    where: { id: eleveId, etablissementId },
    include: {
      affectations: {
        where: { dateFin: null },
        include: {
          classe: {
            select: { id: true, nom: true, niveau: true },
          },
        },
        take: 1,
      },
    },
  });

  if (!eleve) {
    throw new Error('ELEVE_NOT_FOUND');
  }

  // Get period info
  const periode = await prisma.periode.findFirst({
    where: { id: periodeId, etablissementId },
  });

  if (!periode) {
    throw new Error('PERIODE_NOT_FOUND');
  }

  const classe = eleve.affectations[0]?.classe || null;
  const niveau = classe?.niveau || '';

  // Determine if this is a kindergarten level
  const isMaternelle = ['Petite Section', 'Moyenne Section', 'Grande Section'].includes(niveau);

  if (isMaternelle) {
    // For kindergarten: qualitative evaluations by domain
    const evaluations = await prisma.evaluationQualitative.findMany({
      where: {
        eleveId,
        periodeId,
        etablissementId,
      },
      orderBy: { domaine: 'asc' },
    });

    // Group evaluations by domain
    const parDomaine: Record<string, string> = {};
    for (const evaluation of evaluations) {
      parDomaine[evaluation.domaine] = evaluation.valeur;
    }

    // Add all kindergarten domains, even if no evaluation exists
    const domainesComplets = DOMAINES_MATERNELLE.map((domaine) => ({
      domaine,
      valeur: parDomaine[domaine] || null,
    }));

    return {
      eleve: {
        id: eleve.id,
        nom: eleve.nom,
        prenom: eleve.prenom,
        numeroEleve: eleve.numeroEleve,
        dateNaissance: eleve.dateNaissance,
      },
      classe,
      periode: {
        id: periode.id,
        nom: periode.nom,
        dateDebut: periode.dateDebut,
        dateFin: periode.dateFin,
      },
      type: 'maternelle' as const,
      evaluations: domainesComplets,
    };
  }

  // For primary/secondary: notes and averages by subject
  // Get all validated notes for the student in this period
  const notes = await prisma.note.findMany({
    where: {
      eleveId,
      periodeId,
      etablissementId,
      validee: true,
    },
    include: {
      matiere: {
        select: { id: true, nom: true, coefficient: true },
      },
    },
    orderBy: [{ matiere: { nom: 'asc' } }, { creeLe: 'asc' }],
  });

  // Get averages
  const moyennes = await prisma.moyenne.findMany({
    where: {
      eleveId,
      periodeId,
      etablissementId,
    },
    include: {
      matiere: {
        select: { id: true, nom: true, coefficient: true },
      },
    },
  });

  // Group notes by subject
  const notesByMatiere = new Map<string, typeof notes>();
  for (const note of notes) {
    const existing = notesByMatiere.get(note.matiereId) || [];
    existing.push(note);
    notesByMatiere.set(note.matiereId, existing);
  }

  // Build subject details with notes and averages
  const moyenneMap = new Map(
    moyennes
      .filter((m) => m.matiereId !== null)
      .map((m) => [m.matiereId!, m.moyenne]),
  );

  const moyenneGenerale = moyennes.find((m) => m.matiereId === null)?.moyenne ?? null;

  // Collect unique subjects from notes
  const matieresSet = new Map<string, { id: string; nom: string; coefficient: number }>();
  for (const note of notes) {
    if (!matieresSet.has(note.matiereId)) {
      matieresSet.set(note.matiereId, note.matiere);
    }
  }

  const matieres = Array.from(matieresSet.values()).map((matiere) => ({
    matiere,
    notes: (notesByMatiere.get(matiere.id) || []).map((n) => ({
      id: n.id,
      note: n.note,
      noteMax: n.noteMax,
      coefficient: n.coefficient,
    })),
    moyenne: moyenneMap.get(matiere.id) ?? null,
  }));

  return {
    eleve: {
      id: eleve.id,
      nom: eleve.nom,
      prenom: eleve.prenom,
      numeroEleve: eleve.numeroEleve,
      dateNaissance: eleve.dateNaissance,
    },
    classe,
    periode: {
      id: periode.id,
      nom: periode.nom,
      dateDebut: periode.dateDebut,
      dateFin: periode.dateFin,
    },
    type: 'classique' as const,
    matieres,
    moyenneGenerale,
  };
}
