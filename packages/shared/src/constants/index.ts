export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

export const NIVEAUX = {
  MATERNELLE: ['Petite Section', 'Moyenne Section', 'Grande Section'],
  PRIMAIRE: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  SECONDAIRE: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
} as const;

export const DOMAINES_MATERNELLE = [
  'Motricité',
  'Langage oral',
  'Graphisme',
  'Mathématiques',
  'Arts visuels',
  'Socialisation',
  'Autonomie',
  'Découverte du monde',
] as const;

export const MATIERES_SUGGEREES = {
  primaire: [
    { nom: 'Français', coefficient: 3 },
    { nom: 'Mathématiques', coefficient: 3 },
    { nom: 'Histoire-Géographie', coefficient: 2 },
    { nom: 'Sciences', coefficient: 2 },
    { nom: 'Éducation civique', coefficient: 1 },
    { nom: 'Éducation physique', coefficient: 1 },
    { nom: 'Arts plastiques', coefficient: 1 },
    { nom: 'Musique', coefficient: 1 },
  ],
  secondaire: [
    { nom: 'Français', coefficient: 4 },
    { nom: 'Mathématiques', coefficient: 4 },
    { nom: 'Histoire-Géographie', coefficient: 3 },
    { nom: 'Sciences Physiques', coefficient: 3 },
    { nom: 'Sciences de la Vie et de la Terre', coefficient: 2 },
    { nom: 'Anglais', coefficient: 3 },
    { nom: 'Éducation physique', coefficient: 2 },
    { nom: 'Arts plastiques', coefficient: 1 },
    { nom: 'Musique', coefficient: 1 },
    { nom: 'Technologie', coefficient: 2 },
  ],
} as const;

export const PERMISSIONS: Record<string, string[]> = {
  directeur: ['*'],
  admin: ['*'],
  secretaire: [
    'eleves:read', 'eleves:create', 'eleves:update',
    'classes:read',
    'enseignants:read',
    'factures:read', 'factures:create',
    'paiements:read', 'paiements:create',
    'presence:read',
    'dashboard:read',
  ],
  comptable: [
    'eleves:read',
    'factures:read', 'factures:create', 'factures:update',
    'paiements:read', 'paiements:create',
    'rapports:read',
    'dashboard:read',
  ],
  enseignant: [
    'eleves:read',
    'classes:read',
    'evaluations:read', 'evaluations:create', 'evaluations:update',
    'presence:read', 'presence:create',
    'dashboard:read',
  ],
};
