import { z } from 'zod';
import {
  TypeEtablissement,
  Role,
  StatutEleve,
  Sexe,
  ModePaiement,
  StrategieAbsenceNote,
  ValeurQualitative,
} from '../types/index.js';

// ========== AUTH ==========

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Mot de passe minimum 6 caractères'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  motDePasse: z.string().min(6, 'Mot de passe minimum 6 caractères'),
});

// ========== ETABLISSEMENT ==========

export const createEtablissementSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min 2 caractères)'),
  type: z.nativeEnum(TypeEtablissement),
  adresse: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  email: z.string().email('Email invalide').nullable().optional(),
});

// ========== UTILISATEUR ==========

export const createUtilisateurSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Mot de passe minimum 6 caractères'),
  role: z.nativeEnum(Role),
});

export const updateUtilisateurSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  actif: z.boolean().optional(),
});

// ========== ELEVE ==========

export const createEleveSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  dateNaissance: z.string().or(z.date()),
  sexe: z.nativeEnum(Sexe),
  classeSouhaiteeId: z.string().uuid().optional(),
  parents: z.array(z.object({
    nom: z.string().min(2, 'Nom du parent requis'),
    telephone: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    adresse: z.string().nullable().optional(),
  })).min(1, 'Au moins un parent requis'),
});

export const updateEleveSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  dateNaissance: z.string().or(z.date()).optional(),
  sexe: z.nativeEnum(Sexe).optional(),
});

// ========== CLASSE ==========

export const createClasseSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  niveau: z.string().min(1, 'Niveau requis'),
  effectifMax: z.number().int().min(1, 'Effectif max minimum 1'),
  anneeScolaireId: z.string().uuid(),
});

// ========== ENSEIGNANT ==========

export const createEnseignantSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  email: z.string().email().nullable().optional(),
  telephone: z.string().nullable().optional(),
});

// ========== ANNEE SCOLAIRE ==========

export const createAnneeScolaireSchema = z.object({
  nom: z.string().min(4, 'Nom requis (ex: 2024-2025)'),
  dateDebut: z.string().or(z.date()),
  dateFin: z.string().or(z.date()),
});

// ========== PERIODE ==========

export const createPeriodeSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  dateDebut: z.string().or(z.date()),
  dateFin: z.string().or(z.date()),
  anneeScolaireId: z.string().uuid(),
});

// ========== MATIERE ==========

export const createMatiereSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  niveau: z.string().min(1, 'Niveau requis'),
  coefficient: z.number().min(0.1, 'Coefficient minimum 0.1'),
});

// ========== NOTE ==========

export const createNoteSchema = z.object({
  eleveId: z.string().uuid(),
  matiereId: z.string().uuid(),
  periodeId: z.string().uuid(),
  note: z.number().min(0, 'Note minimum 0'),
  noteMax: z.number().min(1, 'Note max minimum 1'),
  coefficient: z.number().min(0.1, 'Coefficient minimum 0.1'),
});

export const absenceNoteSchema = z.object({
  eleveId: z.string().uuid(),
  matiereId: z.string().uuid(),
  periodeId: z.string().uuid(),
  strategie: z.nativeEnum(StrategieAbsenceNote),
});

// ========== EVALUATION QUALITATIVE ==========

export const createEvalQualitativeSchema = z.object({
  eleveId: z.string().uuid(),
  domaine: z.string().min(1, 'Domaine requis'),
  valeur: z.nativeEnum(ValeurQualitative),
  periodeId: z.string().uuid(),
});

// ========== PRESENCE ==========

export const createPresenceSchema = z.object({
  classeId: z.string().uuid(),
  date: z.string().or(z.date()),
  presences: z.array(z.object({
    eleveId: z.string().uuid(),
    present: z.boolean(),
  })),
});

// ========== FINANCIER ==========

export const createTypeFraisSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  description: z.string().nullable().optional(),
});

export const createMontantFraisSchema = z.object({
  typeFraisId: z.string().uuid(),
  niveau: z.string().nullable().optional(),
  classeId: z.string().uuid().nullable().optional(),
  montant: z.number().min(0, 'Montant minimum 0'),
  echeance: z.string().or(z.date()).nullable().optional(),
});

export const createFactureSchema = z.object({
  eleveId: z.string().uuid(),
  typeFraisId: z.string().uuid(),
  montant: z.number().min(0),
  dateEcheance: z.string().or(z.date()),
  periode: z.string().min(1),
});

export const createPaiementSchema = z.object({
  eleveId: z.string().uuid(),
  montant: z.number().min(0.01, 'Montant minimum 0.01'),
  mode: z.nativeEnum(ModePaiement),
  reference: z.string().nullable().optional(),
  factureIds: z.array(z.string().uuid()).min(1, 'Au moins une facture'),
});

// ========== AFFECTATION ==========

export const affectationEleveSchema = z.object({
  classeId: z.string().uuid(),
});

export const affectationEnseignantSchema = z.object({
  classeId: z.string().uuid(),
  matiereId: z.string().uuid().nullable().optional(),
});
