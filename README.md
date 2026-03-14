# SGS - SaaS Gestion Scolaire

Un système de gestion d'établissements scolaires **multi-tenant**, **SaaS** et **modulaire** construit avec les meilleures pratiques modernes. Supporte maternelles, primaires et secondaires en Afrique.

**Stack Tech:** Node.js + Express + Prisma + PostgreSQL | React + MUI + Redux + TypeScript

---

## 📚 Documentation

**👉 [Accéder à la documentation complète](docs/INDEX.md)**

Toute la documentation est organisée dans `docs/` par catégorie:
- **[PROJECT/](docs/PROJECT/)** - Architecture, PRD, synthèse MVP
- **[STORIES/](docs/STORIES/)** - 49 user stories en 5 épics
- **[GUIDES/](docs/GUIDES/)** - Installation, développement, contribution
- **[BMAD/](docs/BMAD/)** - Méthodologie et principes
- **[VERSIONS/](docs/VERSIONS/)** - Versioning et releases

---

## 🚀 Quickstart

```bash
# 1. Installer et configurer
npm install
cp apps/api/.env.example apps/api/.env
# Éditer .env avec vos credentials PostgreSQL

# 2. Initialiser la BD
npm run db:migrate
npm run db:seed

# 3. Démarrer
npm run dev
# 🎉 API: http://localhost:3000
# 🎉 Web: http://localhost:5173
```

**Login de démo:** `directeur@example.com` / `Password1`

**Pour installation détaillée:** voir [docs/GUIDES/INSTALLATION.md](docs/GUIDES/INSTALLATION.md)

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Architecture](#architecture)
- [Structure des fichiers](#structure-des-fichiers)
- [API Documentation](#api-documentation)
- [Frontend](#frontend)
- [Database](#database)
- [Scripts disponibles](#scripts-disponibles)
- [Fonctionnalités](#fonctionnalités)
- [Rôles & Permissions](#rôles--permissions)
- [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

**SGS** est une **plateforme SaaS complète** de gestion d'établissements scolaires qui offre :

✅ **Multi-tenant architecture** - Chaque établissement isolé et sécurisé
✅ **Gestion académique** - Élèves, classes, enseignants, évaluations
✅ **Présences** - Suivi automatisé des présences/absences
✅ **Finances** - Facturation, paiements, rapports en temps réel
✅ **Tableaux de bord** - Dashboards adaptés par rôle
✅ **Exports** - Rapports Excel professionnels
✅ **RBAC** - Système de rôles et permissions granulaire
✅ **Audit** - Suivi complet des actions (logs)

### Cible
- **Écoles maternelles, primaires, secondaires**
- **En Afrique (support FCFA, formats africains)**
- **Petites à moyennes écoles (5-1000 élèves)**
- **Administrateurs, directeurs, secrétaires, enseignants, comptables**

---

## 📦 Prérequis

```
Node.js >= 20.0.0
npm >= 10.0.0
PostgreSQL >= 15.0
```

Vérifiez les versions :
```bash
node --version
npm --version
psql --version
```

---

## ⚙️ Installation

### 1. Cloner le repository
```bash
git clone <repo-url>
cd bmad
```

### 2. Installer les dépendances (monorepo)
```bash
npm install
```
Cela installe les dépendances des **packages/shared**, **apps/api**, et **apps/web**.

### 3. Créer la base de données PostgreSQL
```bash
# Créer une BC vide
createdb sgs_db

# Ou via psql
psql -U postgres
# CREATE DATABASE sgs_db;
```

### 4. Configurer les variables d'environnement

**Backend** (`apps/api/.env`) :
```bash
cp apps/api/.env.example apps/api/.env
```

Puis **modifier** :
```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/sgs_db

# JWT Secret (générez une clé aléatoire)
JWT_SECRET=your-very-secure-random-key-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Serveur
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Logs
LOG_LEVEL=debug
```

**Générer des secrets sécurisés :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Générer et peupler la base de données
```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables (migrations)
npm run db:migrate

# Peupler avec données de démo
npm run db:seed
```

---

## 🚀 Démarrage

### Mode développement (Backend + Frontend)
```bash
npm run dev
```

Cela lance **en parallèle** :
- Backend API sur `http://localhost:3000`
- Frontend Vite sur `http://localhost:5173`

### Démarrer uniquement le backend
```bash
npm run dev:api
```

### Démarrer uniquement le frontend
```bash
npm run dev:web
```

### Accès à l'application
1. Ouvrir `http://localhost:5173`
2. Login avec les identifiants de démo :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `directeur@example.com` | `Password1` | Directeur |
| `admin@example.com` | `Password1` | Admin |
| `secretaire@example.com` | `Password1` | Secrétaire |
| `comptable@example.com` | `Password1` | Comptable |
| `enseignant@example.com` | `Password1` | Enseignant |

---

## 🏗️ Architecture

### Modèle Multi-tenant

Chaque établissement est complètement **isolé** :
- Toute table a un `etablissementId`
- Les requêtes API filtrent automati­quement par `etablissementId` (middleware)
- Les données ne fusionnent **jamais** entre établissements

```
Utilisateur (role: directeur)
    ↓
Header Authorization: Bearer <JWT>
    ↓
Middleware AUTH (valide token)
    ↓
Middleware TENANT (extrait établissementId du token)
    ↓
Middleware RBAC (vérifie les permissions)
    ↓
Middleware VALIDATE (valide le payload Zod)
    ↓
Controller/Service (données déjà filtrées)
```

### Stack Technique

**Backend:**
- **Express.js** - Serveur HTTP
- **Prisma** - ORM SQL
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hash de mots de passe
- **Zod** - Validation schémas
- **Winston** - Logging
- **ExcelJS** - Génération de rapports

**Frontend:**
- **React 18** - UI framework
- **Material-UI (MUI) 5** - Composants professionnels
- **Redux Toolkit** - State management
- **React Router 6** - Routing SPA
- **Axios** - HTTP client
- **Recharts** - Graphiques
- **Vite** - Build tool ultra-rapide

---

## 📁 Structure des fichiers

```
bmad/
├── apps/
│   ├── api/                          # Backend Express + Prisma
│   │   ├── src/
│   │   │   ├── config/               # Configuration (env, DB, logger)
│   │   │   ├── middleware/           # Auth, RBAC, validation, tenant, errors
│   │   │   ├── modules/              # 11 modules métier
│   │   │   │   ├── auth/             # Login, refresh token, reset password
│   │   │   │   ├── etablissements/   # Gestion des écoles
│   │   │   │   ├── utilisateurs/     # Gestion des utilisateurs
│   │   │   │   ├── eleves/           # Inscription, affectation, gestion élèves
│   │   │   │   ├── classes/          # CRUD classes, effectifs
│   │   │   │   ├── enseignants/      # Gestion enseignants, affectations
│   │   │   │   ├── evaluations/      # Notes, moyennes, bulletins
│   │   │   │   ├── presence/         # Prise de présence, statistiques
│   │   │   │   ├── financier/        # Factures, paiements, rapports
│   │   │   │   ├── dashboard/        # Données dashboard par rôle
│   │   │   │   └── exports/          # Export Excel (élèves, paiements)
│   │   │   ├── utils/                # Helpers, audit logging
│   │   │   └── server.ts             # Entry point Express
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # 20 modèles Prisma
│   │   │   └── seed.ts               # Données de démo
│   │   ├── .env.example              # Template variables d'env
│   │   └── package.json
│   │
│   └── web/                          # Frontend React + MUI
│       ├── src/
│       │   ├── components/           # Composants réutilisables
│       │   │   ├── common/           # Loader, StatCard, DataTable, ConfirmDialog, StatusBadge, SearchBar
│       │   │   ├── forms/            # FormField, SelectField, FilterPanel
│       │   │   └── layout/           # Sidebar, Header
│       │   ├── features/             # Pages métier (lazy-loaded)
│       │   │   ├── auth/             # Login, ForgotPassword, ResetPassword
│       │   │   ├── dashboard/        # Tableaux de bord
│       │   │   ├── eleves/           # Gestion élèves (3 pages)
│       │   │   ├── classes/          # Gestion classes
│       │   │   ├── enseignants/      # Gestion enseignants
│       │   │   ├── etablissements/   # Config établissement
│       │   │   ├── evaluations/      # Notes et évaluations
│       │   │   ├── presence/         # Prise de présence
│       │   │   ├── financier/        # Factures, paiements, rapports, config (4 pages)
│       │   │   ├── exports/          # Exports Excel
│       │   │   └── utilisateurs/     # Gestion utilisateurs
│       │   ├── hooks/                # Custom hooks (useAuth, usePermissions, useApi, usePagination, useDebounce)
│       │   ├── routes/               # Routing (AppRoutes, ProtectedRoute, RoleRoute)
│       │   ├── services/api/         # 11 modules API services + client Axios
│       │   ├── store/                # Redux store
│       │   │   ├── index.ts
│       │   │   └── slices/           # 7 slices (auth, ui, eleves, classes, evaluations, financier, etablissement)
│       │   ├── theme/                # MUI custom theme
│       │   ├── utils/                # Formatters, validation, constants
│       │   ├── App.tsx               # Root app component
│       │   └── main.tsx              # Entry point React
│       ├── index.html
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                       # Code partagé (types, validators, constants)
│       ├── src/
│       │   ├── types/                # Types TypeScript (Utilisateur, Eleve, Classe, etc.)
│       │   ├── validators/           # Zod schemas (validation backend + frontend)
│       │   ├── constants/            # Énums, permissions RBAC, niveaux, etc.
│       │   └── index.ts              # Barrel exports
│       └── package.json
│
├── .gitignore
├── package.json                      # Root monorepo config
└── README.md                         # Ce fichier
```

---

## 🔌 API Documentation

Tous les endpoints sont **authentifiés** (sauf `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`).

### Base URL
```
http://localhost:3000/api/
```

### Headers requis (endpoints protégés)
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Modules API (11 modules)

#### 1. **AUTH** (`/auth`)
- `POST /login` - Connecter l'utilisateur
- `POST /refresh` - Rafraîchir le token
- `POST /logout` - Se déconnecter
- `POST /forgot-password` - Demander reset password
- `POST /reset-password` - Réinitialiser via token
- `GET /me` - Récupérer l'utilisateur courant

#### 2. **ÉTABLISSEMENTS** (`/etablissements`)
- `GET /:id` - Détails établissement
- `PUT /:id` - Modifier établissement
- `GET /:etabId/annees-scolaires` - Lister années scolaires
- `POST /:etabId/annees-scolaires` - Créer année scolaire
- `PUT /annees-scolaires/:anneeId/activer` - Activer une année

#### 3. **UTILISATEURS** (`/utilisateurs`)
- `GET` - Lister utilisateurs (pagination)
- `GET /:id` - Détails utilisateur
- `POST` - Créer utilisateur
- `PUT /:id` - Modifier utilisateur
- `DELETE /:id` - Supprimer utilisateur

#### 4. **ÉLÈVES** (`/eleves`)
- `GET` - Lister élèves (pagination, filtres)
- `GET /:id` - Détails élève
- `POST` - Inscrire nouvel élève
- `PUT /:id` - Modifier élève
- `DELETE /:id` - Supprimer élève
- `PUT /:id/admettre` - Admettre un élève
- `POST /:id/affecter` - Affecter à une classe
- `POST /:id/transferer` - Transférer année suivante
- `PUT /:id/desinscrire` - Désinscrire (si solde = 0)

#### 5. **CLASSES** (`/classes`)
- `GET` - Lister classes
- `GET /:id` - Détails classe
- `POST` - Créer classe
- `PUT /:id` - Modifier classe
- `DELETE /:id` - Supprimer classe
- `GET /:id/eleves` - Lister élèves de la classe
- `GET /:id/enseignants` - Lister enseignants affectés

#### 6. **ENSEIGNANTS** (`/enseignants`)
- `GET` - Lister enseignants
- `GET /:id` - Détails enseignant
- `POST` - Créer enseignant
- `PUT /:id` - Modifier enseignant
- `DELETE /:id` - Supprimer (soft delete)
- `POST /:id/affecter` - Affecter classe/matière

#### 7. **ÉVALUATIONS** (`/evaluations`)
- `GET /periodes` - Lister périodes
- `POST /periodes` - Créer période
- `GET /matieres` - Lister matières
- `GET /notes` - Récupérer notes (filtres)
- `POST /notes` - Saisir/modifier notes
- `POST /notes/valider` - Valider notes (calcul moyennes)
- `GET /moyennes` - Récupérer moyennes
- `GET /bulletins/:eleveId/:periodeId` - Générer bulletin
- `GET /qualitatives` - Récupérer appréciations
- `POST /qualitatives` - Saisir appréciations

#### 8. **PRÉSENCES** (`/presence`)
- `GET` - Récupérer présences par classe/date
- `POST` - Enregistrer présences (batch)
- `GET /statistiques` - Stats présences (élève/classe)

#### 9. **FINANCIER** (`/financier`)
- `GET /types-frais` - Types de frais
- `POST /types-frais` - Créer type de frais
- `GET /montants` - Montants facturés par classe/année
- `POST /montants` - Définir montant
- `GET /factures` - Lister factures (pagination)
- `GET /factures/:id` - Détails facture + paiements
- `POST /factures/generer` - Générer factures auto
- `POST /factures` - Créer facture manuelle
- `GET /paiements` - Lister paiements
- `POST /paiements` - Enregistrer paiement (distribution)
- `GET /soldes` - Soldes par élève/classe
- `GET /rapports` - Rapports financiers (PDF/Excel)

#### 10. **DASHBOARD** (`/dashboard`)
- `GET` - Données dashboard (adaptées par rôle)
- `GET /alertes` - Système d'alertes

#### 11. **EXPORTS** (`/exports`)
- `GET /eleves` - Export Excel élèves
- `GET /paiements` - Export Excel paiements
- `GET /factures` - Export Excel factures

---

## 🎨 Frontend

### Routing

**Routes publiques :**
- `/login` - Page de connexion
- `/forgot-password` - Demander reset
- `/reset-password/:token` - Réinitialiser mot de passe

**Routes protégées :**
- `/dashboard` - Tableau de bord (tous rôles)
- `/eleves` - Liste élèves
- `/eleves/inscription` - Inscription nouvel élève
- `/eleves/:id` - Détail élève
- `/classes` - Gestion classes
- `/classes/:id` - Détail classe
- `/enseignants` - Gestion enseignants
- `/evaluations` - Notes et évaluations
- `/presences` - Prise de présence
- `/financier/factures` - Factures
- `/financier/paiements` - Paiements
- `/financier/rapports` - Rapports financiers
- `/financier/config` - Config frais
- `/exports` - Exports Excel
- `/utilisateurs` - Gestion utilisateurs
- `/etablissement` - Config établissement

### State Management (Redux)

**Slices disponibles :**

| Slice | État | Actions | Thunks |
|-------|------|---------|--------|
| `auth` | user, token, refreshToken | login, logout, clearError | loginAsync |
| `ui` | sidebarOpen, loading, snackbar | toggleSidebar, showSnackbar | — |
| `eleves` | list, selected, filters, pagination | setFilters, clearSelected | fetchEleves, fetchEleveById |
| `classes` | list, selected | clearSelected | fetchClasses, fetchClasseById |
| `evaluations` | notes, periodes, matieres | clearError | fetchPeriodes, fetchNotes, fetchMatieres |
| `financier` | factures, paiements, typesFrais | clearError | fetchFactures, fetchPaiements, fetchTypesFrais |
| `etablissement` | current, anneesScolaires | clearError | fetchEtablissement, fetchAnneesScolaires |

### Custom Hooks

```typescript
// Auth
useAuth()                 // { user, token, isAuthenticated, login, logout }
usePermissions()          // { role, hasRole, hasPermission, canAccess }

// Data Fetching
useApi<T>(apiCall, deps)  // { data, loading, error, execute, refetch }

// Pagination
usePagination()           // { page, limit, offset, setPage, setLimit, reset }

// UI
useDebounce(value, 300)   // Debounced value (pour recherche)
```

### Composants Réutilisables

```typescript
// Common
<Loader />                    // Loading spinner (fullPage ou inline)
<StatCard />                  // Carte statistique avec hover animation
<AppSnackbar />               // Notifications globales (Redux)
<DataTable<T> />              // Tableau pagination/triage/filtres
<ConfirmDialog />             // Dialog confirmation
<StatusBadge />               // Badge statut (admis, payé, etc.)
<SearchBar />                 // Barre recherche avec debounce

// Forms
<FormField />                 // TextField avec gestion erreurs
<SelectField />               // Select dropdown
<FilterPanel />               // Panneau de filtres collapsible

// Layout
<Sidebar />                   // Navigation menu avec RBAC
<Header />                    // Top bar avec user menu
<AppLayout />                 // Layout principal (Sidebar + Header + Content)
```

### API Services

Chaque module a son service API dédié dans `src/services/api/` :

```typescript
import { elevesApi } from '@/services/api/eleves.api';

// Utilisation
const response = await elevesApi.getAll({ classeId, search: 'Ahmed' });
const student = await elevesApi.getById('id123');
await elevesApi.create(data);
```

---

## 💾 Database

### 20 Modèles Prisma

| Modèle | Rôle |
|--------|------|
| `Etablissement` | École/Institution |
| `AnneeScolaire` | Année académique |
| `Trimestre` | Période académique |
| `Utilisateur` | Compte utilisateur + role |
| `Eleve` | Étudiant + statut |
| `Parent` | Parent/tuteur |
| `EleveParent` | Relation élève-parent |
| `Classe` | Classe/promotion |
| `EleveClasse` | Affectation élève-classe |
| `Enseignant` | Professeur |
| `EnseignantClasse` | Affectation enseignant-classe |
| `Matiere` | Sujet/cours |
| `Note` | Note d'élève |
| `NoteQualitative` | Appréciation textuelle |
| `Presence` | Présence/absence |
| `TypeFrais` | Catégorie de frais |
| `Montant` | Montant facturé |
| `Facture` | Facture élève |
| `Paiement` | Paiement de facture |
| `AuditLog` | Historique des actions |

### Migrations

Créer une migration :
```bash
npm run db:generate
npm run db:migrate
```

Voir le studio Prisma (GUI) :
```bash
npm run db:studio
```

---

## 🛠️ Scripts disponibles

### Root (monorepo)

```bash
npm install              # Installe tout
npm run dev              # Dev API + Web en parallèle
npm run dev:api          # Dev uniquement API
npm run dev:web          # Dev uniquement Web
npm run build            # Build tout
npm run build:api        # Build uniquement API
npm run build:web        # Build uniquement Web
npm run db:generate      # Genère client Prisma
npm run db:migrate       # Crée migrations
npm run db:seed          # Peuple données démo
npm run lint             # Lint tout
npm run test             # Tests tout
```

### Backend (apps/api)

```bash
npm run dev                    # tsx watch src/server.ts
npm run build                  # TypeScript compilation
npm run start                  # node dist/server.js
npm run db:generate            # prisma generate
npm run db:migrate             # prisma migrate dev
npm run db:migrate:prod        # prisma migrate deploy
npm run db:seed                # Charge seed.ts
npm run db:studio              # GUI Prisma
npm run lint                   # ESLint src/
```

### Frontend (apps/web)

```bash
npm run dev                    # Vite dev server
npm run build                  # TypeScript + Vite build
npm run preview                # Prévisualiser le build
npm run lint                   # ESLint src/
```

---

## ✨ Fonctionnalités principales

### 🔐 Authentification & Sécurité
- ✅ Login/logout
- ✅ JWT tokens (access + refresh)
- ✅ Mot de passe oublié + reset
- ✅ Bcrypt hashage
- ✅ RBAC (rôles et permissions)
- ✅ Audit logging (chaque action enregistrée)
- ✅ Multi-tenant isolation

### 👥 Gestion des utilisateurs
- ✅ CRUD utilisateurs (create, read, update, delete)
- ✅ Création avec génération mot de passe temporaire
- ✅ Modification rôle (avec hiérarchie)
- ✅ Soft delete (conservation historique)

### 👨‍🎓 Gestion des élèves
- ✅ Inscription (multi-step form)
- ✅ Numéro élève auto-généré
- ✅ Affectation classe (validation effectif)
- ✅ Suivi admissions
- ✅ Transfert année suivante
- ✅ Désinscription (si solde zéro)
- ✅ Import parents/tuteurs

### 🏫 Gestion des classes
- ✅ CRUD classes
- ✅ Validation capacité
- ✅ Effectif auto-calculé
- ✅ Affectation enseignants/matières
- ✅ Historique mouvements

### 📚 Évaluations & Notes
- ✅ Saisie notes par matière/période
- ✅ Validation automatique (min/max)
- ✅ Calcul moyennes (périodiques + annuelles)
- ✅ Appréciations qualitatives
- ✅ Génération bulletins
- ✅ Suivi rattrapage

### 📝 Présences
- ✅ Prise présence par classe/date
- ✅ Statuts : présent, absent, retard, excusé
- ✅ Statistiques par élève/classe
- ✅ Alertes absences répétées

### 💰 Financier
- ✅ Définir types de frais
- ✅ Montants par classe/année
- ✅ Génération auto factures
- ✅ Facturation manuelle
- ✅ Enregistrement paiements
- ✅ Distribution paiements (plusieurs factures)
- ✅ Suivi soldes
- ✅ Rapports financiers
- ✅ Reçus paiements

### 📊 Tableaux de bord
- ✅ Dashboard personnalisé par rôle
- ✅ KPIs temps réel
- ✅ Graphiques (Recharts)
- ✅ Alertes système
- ✅ Statistiques académiques et financières

### 📤 Exports
- ✅ Export Excel élèves (avec détails)
- ✅ Export paiements (bilan financier)
- ✅ Export factures (imprimable)
- ✅ Format professionnel avec en-têtes

---

## 🔑 Rôles & Permissions

### 5 rôles

| Rôle | Niveau | Permissions |
|------|--------|-------------|
| **Directeur** | 4 (max) | Accès complet à tout |
| **Admin** | 3 | Élèves, classes, enseignants, évaluations, présences, exports |
| **Secrétaire** | 2 | Élèves, classes (lecture), présences (lecture) |
| **Comptable** | 2 | Financier (factures, paiements, rapports), exports financiers |
| **Enseignant** | 1 | Évaluations (propres classes), présences (propres classes), classes (lecture) |

### RBAC Middleware

Le système valide les rôles à deux niveaux :

1. **Backend** - Middleware Express `requireRole()` / `requirePermission()`
2. **Frontend** - Hook `usePermissions()` + `<RoleRoute>` component

---

## 🐛 Dépannage

### Port déjà utilisé
```bash
# Vérifier quel processus utilise le port
lsof -i :3000     # Backend
lsof -i :5173     # Frontend

# Tuer le processus
kill -9 <PID>
```

### Erreur de connexion BD
```bash
# Vérifier BD existe
psql -U postgres
\l

# Vérifier DATABASE_URL dans .env
cat apps/api/.env | grep DATABASE_URL
```

### Prisma migration cassée
```bash
# Reset la BD
npm run db:migrate reset

# Puis seed
npm run db:seed
```

### Token expiré/refresh failure
- Vider localStorage : `localStorage.clear()`
- Relancer l'app
- Les intercepteurs Axios gèrent le refresh automatiquement

### Vue blanche au démarrage frontend
```bash
# Vider cache Vite
rm -rf apps/web/.vite

# Peut-être async thunk pas encore resolved
# Vérifier Redux DevTools (browser extension)
```

### Erreur validationZod
```bash
# Les schémas sont dans packages/shared/src/validators/
# Frontend utilise les mêmes schemas que backend
# Si erreur, vérifier que les types Match
```

---

## 📚 Documentation supplémentaire

- **Architecture** : voir `architecture.md`
- **PRD** : voir `prd.md`
- **User Stories** : voir `stories/` (5 épics, 49 stories)
- **Design Artifacts** : voir `design-artifacts/`

---

## 🚀 Prochains pas (roadmap)

- [ ] Tests unitaires (Jest)
- [ ] Tests E2E (Cypress)
- [ ] CI/CD (GitHub Actions)
- [ ] Déploiement production (Docker, AWS/Vercel)
- [ ] SMS notifications (Twilio)
- [ ] Email templates (SendGrid)
- [ ] Sync données offline-first
- [ ] Mobile app (React Native)
- [ ] Multi-langue (i18n)
- [ ] Thème dark mode

---

## 📄 Licence

Privé. Tous droits réservés.

---

## 📬 Support

Pour toute question ou bug :
1. Vérifier la section [Dépannage](#dépannage)
2. Consulter les logs : `apps/api/logs/`
3. Ouvrir un issue sur le repo

---

## 🏆 Équipe

Built with ❤️ using BMAD methodology + Claude AI

**Version:** 1.0.0
**Dernière mise à jour:** 2026-03-14
