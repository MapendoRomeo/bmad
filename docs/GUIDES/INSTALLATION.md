# 📦 Installation Guide

Guide complet pour installer et configurer le projet SGS localement.

## Prérequis

```bash
Node.js >= 20.0.0
npm >= 10.0.0
PostgreSQL >= 15.0
```

### Vérifier les versions
```bash
node --version    # v20.x.x
npm --version     # 10.x.x
psql --version    # 15.x
```

---

## Étape 1: Cloner le repository

```bash
git clone https://github.com/your-org/bmad.git
cd bmad
```

---

## Étape 2: Installer les dépendances (monorepo)

```bash
npm install
```

Cela installe automatiquement les dépendances de:
- `packages/shared` - Types, validators, constants partagés
- `apps/api` - Backend Express
- `apps/web` - Frontend React

---

## Étape 3: Créer la base de données PostgreSQL

### Option A: Ligne de commande
```bash
createdb sgs_db
```

### Option B: Via psql
```bash
psql -U postgres
# Une fois connecté:
CREATE DATABASE sgs_db;
\q
```

### Option C: GUI (pgAdmin)
1. Ouvrir pgAdmin
2. Right-click Databases → Create → Database
3. Nom: `sgs_db`
4. Save

---

## Étape 4: Configurer les variables d'environnement

### Créer fichier `.env` pour le backend
```bash
cp apps/api/.env.example apps/api/.env
```

### Éditer `apps/api/.env`
```env
# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/sgs_db

# Remplacer:
# - user: votre utilisateur PostgreSQL (par défaut: postgres)
# - password: votre mot de passe PostgreSQL
```

### Exemple (développement local)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sgs_db
```

### Génération de secrets sécurisés
```bash
# Générer une clé aléatoire pour JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copier le résultat dans .env
JWT_SECRET=<votre-clé-générée>
JWT_REFRESH_SECRET=<autre-clé>
```

### Variables complètes `.env`
```env
# === DATABASE ===
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sgs_db

# === JWT ===
# Générez des clés aléatoires (voir ci-dessus)
JWT_SECRET=3f4d6e8a2b9c1f5a7e8d3c9b6a2f8e1d4c7a9f3b8e2c5d9a1f6e3b8c4f7a9
JWT_REFRESH_SECRET=9a2b4d6f8e1c3a5f7e9d2b4c6a8f1e3d5c7a9b1e3f5d7a9c1e3f5b7a9c1e3

# === TIMINGS ===
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === SERVER ===
PORT=3000
NODE_ENV=development

# === CORS ===
CORS_ORIGIN=http://localhost:5173

# === LOGS ===
LOG_LEVEL=debug
```

---

## Étape 5: Générer et peupler la base de données

### Générer le client Prisma
```bash
npm run db:generate
```

Output attendu: ✔ Generated Prisma Client

### Créer les tables (migrations)
```bash
npm run db:migrate
```

Cela va:
1. Créer toutes les tables selon `schema.prisma`
2. Générer les migrations dans `apps/api/prisma/migrations/`

**Attend intervention:** Donner un nom à la migration (ex: `init`)

### Peupler avec données de démo
```bash
npm run db:seed
```

Output attendu:
```
✔ Démonstration data seeded
  - 1 établissement créé
  - 5 utilisateurs créés
  - 1 année scolaire active
  - 3 trimestres
  - 5 classes créées
  - 5 élèves + parents
```

---

## Étape 6: Vérifier l'installation

### Vérifier la BD
```bash
psql -U postgres
\c sgs_db
\dt  # Lister les tables

# Vérifier quelques données
SELECT COUNT(*) FROM "Utilisateur";
\q
```

### Vérifier les fichiers
```bash
# Vérifier que .env existe
ls -la apps/api/.env

# Vérifier les dépendances
ls -la node_modules  # doit exister
```

---

## Étape 7: Démarrer l'application

### Mode développement (Backend + Frontend)
```bash
npm run dev
```

Cela lance en parallèle:
- **Backend API** sur `http://localhost:3000`
  - Health check: `http://localhost:3000/api/health`
- **Frontend Vite** sur `http://localhost:5173`

### Démarrer uniquement le backend
```bash
npm run dev:api
```

### Démarrer uniquement le frontend
```bash
npm run dev:web
```

---

## Étape 8: Se connecter à l'application

### Accéder au site
```
http://localhost:5173
```

### Identifiants de démo
Choisissez un rôle:

| Email | Mot de passe | Rôle | Accès |
|-------|--------------|------|-------|
| `directeur@example.com` | `Password1` | Directeur | Complet |
| `admin@example.com` | `Password1` | Admin | Élèves, classes, enseignants, évaluations, utilisateurs |
| `secretaire@example.com` | `Password1` | Secrétaire | Élèves, classes (lecture), présences (lecture) |
| `comptable@example.com` | `Password1` | Comptable | Financier, exports |
| `enseignant@example.com` | `Password1` | Enseignant | Évaluations propres classes, présences |

### Exemple: Connexion Directeur
```
Email: directeur@example.com
Mot de passe: Password1
→ Cliquer "Connexion"
→ Redirection vers /dashboard
```

---

## Troubleshooting Installation

### Erreur: Port 3000/5173 déjà utilisé
```bash
# Trouver le processus
lsof -i :3000
lsof -i :5173

# Tuer le processus (Linux/Mac)
kill -9 <PID>

# Ou changer le port dans .env
PORT=3001
```

### Erreur: "Cannot find module @sgs/shared"
```bash
# Réinstaller monorepo
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### Erreur: "EACCES: permission denied" (Linux/Mac)
```bash
# Donner les permissions
sudo chown -R $USER:$USER .
npm install
```

### Erreur: "psql: command not found"
PostgreSQL n'est pas installé. Installer:
```bash
# macOS (Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Télécharger depuis: https://www.postgresql.org/download/windows/
```

### Erreur: "Prisma schema validation error"
```bash
# Nettoyer et régénérer
rm -rf apps/api/prisma/migrations
npm run db:generate
npm run db:migrate
npm run db:seed
```

### BD vide / pas de données
```bash
# Re-seed
npm run db:seed

# Ou reset complet (attention: supprime tout)
npm run db:migrate reset
npm run db:seed
```

---

## Prochaines étapes

1. Lire [DEVELOPMENT.md](DEVELOPMENT.md) pour règles développement
2. Consulter [../PROJECT/ARCHITECTURE.md](../PROJECT/ARCHITECTURE.md) pour comprendre le code
3. Implémenter selon [../STORIES/](../STORIES/) les user stories

---

**Installation complétée! ✅**

Pour démarrer développement:
```bash
npm run dev
```

Pour questions: voir [TROUBLESHOOTING.md](../PROJECT/ARCHITECTURE.md) section Dépannage chez README.md
