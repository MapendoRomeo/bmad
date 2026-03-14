export const ROLES = {
  DIRECTEUR: 'directeur',
  ADMIN: 'admin',
  SECRETAIRE: 'secretaire',
  COMPTABLE: 'comptable',
  ENSEIGNANT: 'enseignant',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  directeur: 'Directeur',
  admin: 'Administrateur',
  secretaire: 'Secrétaire',
  comptable: 'Comptable',
  enseignant: 'Enseignant',
};

export const STATUT_ELEVE_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  admis: 'Admis',
  inscrit: 'Inscrit',
  desinscrit: 'Désinscrit',
};

export const STATUT_FACTURE_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  emise: 'Émise',
  partiellement_payee: 'Partiellement payée',
  payee: 'Payée',
  annulee: 'Annulée',
};

export const NIVEAUX = [
  'Petite Section', 'Moyenne Section', 'Grande Section',
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6ème', '5ème', '4ème', '3ème',
  '2nde', '1ère', 'Terminale',
];

export const TYPE_ETABLISSEMENT = [
  { value: 'maternelle', label: 'Maternelle' },
  { value: 'primaire', label: 'Primaire' },
  { value: 'secondaire', label: 'Secondaire' },
];

export const SEXES = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

export const PAGINATION_DEFAULT = {
  page: 1,
  limit: 10,
};
