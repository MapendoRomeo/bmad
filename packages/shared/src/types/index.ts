// ========== ENUMS ==========

export enum TypeEtablissement {
  MATERNELLE = 'maternelle',
  PRIMAIRE = 'primaire',
  SECONDAIRE = 'secondaire',
}

export enum Role {
  DIRECTEUR = 'directeur',
  ADMIN = 'admin',
  SECRETAIRE = 'secretaire',
  COMPTABLE = 'comptable',
  ENSEIGNANT = 'enseignant',
}

export enum StatutEleve {
  INSCRIT = 'inscrit',
  ADMIS = 'admis',
  DESINSCRIT = 'desinscrit',
}

export enum Sexe {
  M = 'M',
  F = 'F',
  AUTRE = 'Autre',
}

export enum StatutFacture {
  EMISE = 'emise',
  PAYEE = 'payee',
  PARTIELLEMENT_PAYEE = 'partiellement_payee',
  IMPAYEE = 'impayee',
}

export enum ModePaiement {
  ESPECES = 'especes',
  VIREMENT = 'virement',
  CHEQUE = 'cheque',
  MOBILE_MONEY = 'mobile_money',
}

export enum StrategieAbsenceNote {
  ZERO = 'zero',
  EXCLURE_MOYENNE = 'exclure_moyenne',
  RATTRAPAGE = 'rattrapage',
}

export enum ValeurQualitative {
  ACQUIS = 'acquis',
  EN_COURS = 'en_cours',
  NON_ACQUIS = 'non_acquis',
}

// ========== INTERFACES ==========

export interface Etablissement {
  id: string;
  nom: string;
  type: TypeEtablissement;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  logoUrl: string | null;
  actif: boolean;
  creeLe: Date;
  modifieLe: Date;
}

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasseHash?: string;
  etablissementId: string;
  role: Role;
  actif: boolean;
  creeLe: Date;
}

export interface Eleve {
  id: string;
  numeroEleve: string | null;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  sexe: Sexe;
  photoUrl: string | null;
  statut: StatutEleve;
  etablissementId: string;
  creeLe: Date;
}

export interface Parent {
  id: string;
  eleveId: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  etablissementId: string;
}

export interface Classe {
  id: string;
  nom: string;
  niveau: string;
  effectifMax: number;
  etablissementId: string;
  anneeScolaireId: string;
  creeLe: Date;
}

export interface AnneeScolaire {
  id: string;
  nom: string;
  dateDebut: Date;
  dateFin: Date;
  etablissementId: string;
  active: boolean;
}

export interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  etablissementId: string;
  creeLe: Date;
}

export interface Periode {
  id: string;
  nom: string;
  dateDebut: Date;
  dateFin: Date;
  anneeScolaireId: string;
  etablissementId: string;
}

export interface Matiere {
  id: string;
  nom: string;
  niveau: string;
  coefficient: number;
  etablissementId: string;
}

export interface Note {
  id: string;
  eleveId: string;
  matiereId: string;
  periodeId: string;
  note: number;
  noteMax: number;
  coefficient: number;
  validee: boolean;
  etablissementId: string;
  creeLe: Date;
}

export interface EvaluationQualitative {
  id: string;
  eleveId: string;
  domaine: string;
  valeur: ValeurQualitative;
  periodeId: string;
  etablissementId: string;
}

export interface Moyenne {
  id: string;
  eleveId: string;
  matiereId: string | null;
  periodeId: string;
  moyenne: number;
  etablissementId: string;
}

export interface Presence {
  id: string;
  eleveId: string;
  classeId: string;
  date: Date;
  present: boolean;
  etablissementId: string;
}

export interface TypeFrais {
  id: string;
  nom: string;
  description: string | null;
  etablissementId: string;
}

export interface MontantFrais {
  id: string;
  typeFraisId: string;
  niveau: string | null;
  classeId: string | null;
  montant: number;
  echeance: Date | null;
  etablissementId: string;
}

export interface Facture {
  id: string;
  eleveId: string;
  typeFraisId: string;
  montant: number;
  dateEmission: Date;
  dateEcheance: Date;
  statut: StatutFacture;
  periode: string;
  etablissementId: string;
  creeLe: Date;
}

export interface Paiement {
  id: string;
  eleveId: string;
  montant: number;
  date: Date;
  mode: ModePaiement;
  reference: string | null;
  etablissementId: string;
  creeLe: Date;
}

export interface PaiementFacture {
  id: string;
  paiementId: string;
  factureId: string;
  montantAffecte: number;
}

export interface AffectationEleve {
  id: string;
  eleveId: string;
  classeId: string;
  dateDebut: Date;
  dateFin: Date | null;
  etablissementId: string;
}

export interface AffectationEnseignant {
  id: string;
  enseignantId: string;
  classeId: string;
  matiereId: string | null;
  dateDebut: Date;
  dateFin: Date | null;
  etablissementId: string;
}

// ========== API TYPES ==========

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId: string;
  };
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: Omit<Utilisateur, 'motDePasseHash'>;
}

export interface DashboardData {
  totalEleves: number;
  totalClasses: number;
  totalEnseignants: number;
  tauxPresence: number;
  facturesImpayees: number;
  montantImpaye: number;
  recettesMois: number;
  alertes: Alerte[];
}

export interface Alerte {
  id: string;
  type: 'impaye' | 'absence' | 'capacite' | 'echeance';
  message: string;
  priorite: 'haute' | 'moyenne' | 'basse';
  date: Date;
}
