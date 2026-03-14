# 🛠️ Development Workflow

Guide pour développer sur le projet SGS.

---

## Démarrage rapide

```bash
# 1. Installer
npm install

# 2. Configurer .env (voir INSTALLATION.md)
cp apps/api/.env.example apps/api/.env
# Éditer avec vos credentials

# 3. Migration BD
npm run db:migrate
npm run db:seed

# 4. Démarrer
npm run dev
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

---

## Structure du projet (monorepo npm workspaces)

```
bmad/
├── apps/
│   ├── api/        # Backend Express + Prisma
│   └── web/        # Frontend React + MUI
├── packages/
│   └── shared/     # Types, validators, constants
└── package.json    # Root config
```

### Démarrer un workspace spécifique
```bash
npm run dev --workspace=apps/api     # Backend uniquement
npm run dev --workspace=apps/web     # Frontend uniquement
npm run build --workspace=apps/api   # Build backend uniquement
```

---

## Architecture (TL;DR)

### Backend (Express + Prisma)

**Structure module:** Service/Controller/Routes

```
apps/api/src/modules/<nom>/
├── <nom>.service.ts     # Logique métier
├── <nom>.controller.ts  # Handlers HTTP
├── <nom>.routes.ts      # Routes Express
```

**Middleware chain:**
```
Request → Helmet/CORS → Morgan → Auth → Tenant → RBAC → Validate → Controller
```

**Exemple: Créer un endpoint**
```bash
# 1. Ajouter logique dans service
apps/api/src/modules/eleves/eleves.service.ts

# 2. Ajouter handler dans controller
apps/api/src/modules/eleves/eleves.controller.ts

# 3. Ajouter route
apps/api/src/modules/eleves/eleves.routes.ts

# 4. Server le monte automatiquement
apps/api/src/server.ts (déjà configuré)
```

### Frontend (React + Redux)

**Architecture composants:**
```
apps/web/src/
├── components/
│   ├── common/      # Réutilisables (DataTable, FormField, etc.)
│   ├── forms/       # Form components
│   └── layout/      # Sidebar, Header
├── features/        # Pages métier (lazy-loaded)
├── hooks/           # Custom hooks (useAuth, useApi, etc.)
├── services/api/    # API services (auto-généré)
├── store/           # Redux slices + store
├── theme/           # MUI theme
└── utils/           # Helpers
```

**Exemple: Créer une page**
```bash
# 1. Créer component
apps/web/src/features/<nom>/<Nom>Page.tsx

# 2. Importer dans App.tsx (lazy)
const <Nom>Page = lazy(() => import('./features/<nom>/<Nom>Page'));

# 3. Ajouter route
<Route path="/<nom>" element={<Nom>Page />} />

# 4. Ajouter nav item (Sidebar.tsx)
```

---

## Development Workflow

### 1. Brancher (Git)

```bash
# Nouvelle branche pour une feature
git checkout -b feat/description-simple

# Ou bug
git checkout -b fix/description-simple
```

Conventions:
- `feat/` - Nouvelle fonctionnalité
- `fix/` - Bug fix
- `refactor/` - Refactoring sans changement fonctionnel
- `docs/` - Documentation
- `test/` - Tests uniquement

### 2. Développer

**Backend:**
```bash
npm run dev:api
# Modifie le code → auto-reload (tsx watch)
```

**Frontend:**
```bash
npm run dev:web
# Modifie le code → HMR (Hot Module Reload)
```

### 3. Tester localement

**Backend:**
```bash
# Test API endpoint
curl -X GET http://localhost:3000/api/health

# Avec auth token
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

**Frontend:**
```bash
# Ouvrir http://localhost:5173
# Vérifier dans DevTools (F12)
```

### 4. Builder localement

```bash
# Build tout
npm run build

# Vérifier build output
ls -la apps/api/dist
ls -la apps/web/dist
```

### 5. Committer

```bash
# Vérifier les changements
git status
git diff

# Stage les fichiers
git add <fichiers>

# Committer
git commit -m "feat: description claire"
```

Conventions de commits:
```
feat: Add new feature
fix: Fix bug XYZ
refactor: Refactor module
docs: Update documentation
test: Add tests
```

### 6. Push & PR

```bash
# Push la branche
git push origin feat/description-simple

# Créer PR sur GitHub
# - Title: feat: description-simple
# - Description: Expliquer le changement
# - Link: Issue sur laquelle ça porte (si applicable)
```

---

## Common Development Tasks

### Ajouter un nouvel endpoint API

**Exemple: GET /api/eleves/:id/documents**

#### 1. Service (`apps/api/src/modules/eleves/eleves.service.ts`)
```typescript
export async function getEleveDocuments(eleveId: string, etablissementId: string) {
  return await db.eleveDocument.findMany({
    where: { eleveId, eleve: { etablissementId } },
    include: { eleve: true },
  });
}
```

#### 2. Controller (`apps/api/src/modules/eleves/eleves.controller.ts`)
```typescript
export async function getEleveDocumentsHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { etablissementId } = req.user; // From auth middleware
  const docs = await eleveService.getEleveDocuments(id, etablissementId);
  res.json(docs);
}
```

#### 3. Routes (`apps/api/src/modules/eleves/eleves.routes.ts`)
```typescript
router.get('/:id/documents', requireRole('directeur', 'admin'), getEleveDocumentsHandler);
```

#### 4. Frontend (`apps/web/src/services/api/eleves.api.ts`)
```typescript
export const elevesApi = {
  // ... existant
  getDocuments: (id: string) => api.get(`/eleves/${id}/documents`),
};
```

#### 5. Page/Component
```typescript
import { elevesApi } from '@/services/api/eleves.api';
const docs = await elevesApi.getDocuments(eleveId);
```

### Ajouter un nouvel Redux slice

**Exemple: documentsSlice pour gérer les documents**

```typescript
// apps/web/src/store/slices/documentsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { elevesApi } from '../../services/api/eleves.api';

export const fetchDocuments = createAsyncThunk(
  'documents/fetch',
  async (eleveId: string, { rejectWithValue }) => {
    try {
      const res = await elevesApi.getDocuments(eleveId);
      return res.data;
    } catch (err) {
      return rejectWithValue('Erreur');
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState: { list: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => { state.loading = true; })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      });
  },
});
```

Puis ajouter à `store/index.ts`:
```typescript
import documentsReducer from './slices/documentsSlice';

export const store = configureStore({
  reducer: {
    // ...
    documents: documentsReducer,
  },
});
```

### Ajouter une nouvelle page/feature

**Exemple: DocumentsPage**

```typescript
// apps/web/src/features/documents/DocumentsPage.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { fetchDocuments } from '@/store/slices/documentsSlice';
import DataTable from '@/components/common/DataTable';
import Loader from '@/components/common/Loader';

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s: RootState) => s.documents);

  useEffect(() => {
    dispatch(fetchDocuments(eleveId));
  }, []);

  if (loading) return <Loader />;

  return (
    <Box>
      <h1>Documents</h1>
      <DataTable columns={[...]} rows={list} />
    </Box>
  );
}
```

Puis ajouter à `App.tsx`:
```typescript
const DocumentsPage = lazy(() => import('./features/documents/DocumentsPage'));

// Dans routes
<Route path="/documents" element={<DocumentsPage />} />
```

---

## Testing

### Backend (Jest)
```bash
npm run test --workspace=apps/api
```

### Frontend (Jest + React Testing Library)
```bash
npm run test --workspace=apps/web
```

### Integration Tests (Cypress)
```bash
npm run test:e2e
```

---

## Debugging

### Backend
```bash
# Lancer avec debugger
node --inspect dist/server.js

# Chrome DevTools: chrome://inspect
```

### Frontend
```bash
# F12 dans le navigateur
# React DevTools extension recommandée
# Redux DevTools extension recommandée
```

### Logs
```bash
# Backend logs
tail -f apps/api/logs/*.log

# Browser console
F12 → Console tab
```

---

## Database

### Voir les données (GUI)
```bash
npm run db:studio
# Ouvre Prisma Studio sur http://localhost:5555
```

### Créer une migration
```bash
# Modifie schema.prisma
npm run db:migrate

# Donne un nom à la migration
# Vérifie le fichier généré
cat apps/api/prisma/migrations/<timestamp>_<name>/migration.sql
```

### Reset BD (DEV uniquement)
```bash
npm run db:migrate reset
# ⚠ Supprime TOUT et recrée + seed
```

---

## Linting & Formatting

```bash
npm run lint             # Lint tout
npm run lint --fix      # Auto-fix issues
```

---

## Performance

### Frontend
```bash
# Build analysis
npm run build --workspace=apps/web

# Vérifier bundle size
# dist/assets/main.HASH.js

# Lighthouse audit
Chrome DevTools → Lighthouse
```

### Backend
```bash
# Profiler
node --prof dist/server.js
node --prof-process isolate-*.log > profile.txt
```

---

## Dépannage Development

### Module not found
```bash
# Régénérer Prisma client
npm run db:generate

# Réinstaller monorepo
npm install
```

### HMR not working (frontend)
```bash
# Redémarrer Vite
npm run dev:web
```

### Port déjà utilisé
```bash
# Voir qui l'utilise
lsof -i :3000
kill -9 <PID>
```

### Changes not applying
```bash
# Vider cache
rm -rf .turbo
rm -rf apps/web/.vite
npm run dev
```

---

## Conventions de code

### TypeScript
- ✅ Toujours typeré
- ✅ Pas de `any` sauf justifié
- ✅ Interfaces pour les objets

### Nommage
- `components/`: PascalCase (Component.tsx)
- `utils/`: camelCase (helper.ts)
- `hooks/`: useXxx (useAuth.ts)
- `types/`: PascalCase (User.ts)

### Imports
```typescript
// Importer du @ (alias)
import { useApi } from '@/hooks';
import { formatDate } from '@/utils/formatters';

// Pas de chemin relatif long
// ❌ import from '../../../utils'
// ✅ import from '@/utils'
```

---

**Bonne chance! Happy coding! 🚀**
