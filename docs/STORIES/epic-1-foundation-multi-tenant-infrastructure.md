# Epic 1: Foundation & Multi-Tenant Infrastructure

Cet epic établit les fondations techniques du projet : setup du monorepo, infrastructure de base, schéma multi-tenant, authentification, RBAC et premières interfaces frontend. À la fin de cet epic, un établissement peut être créé, des utilisateurs peuvent s’authentifier et le système garantit l’isolation complète des données entre établissements.

---

## Story 1.1: Project Setup and Infrastructure Foundation

As a **developer**,  
I want **a projet initialisé avec structure de base, configuration Git, CI/CD basique, et base de données PostgreSQL**,  
so that **je peux commencer le développement dans un environnement standardisé et automatisé**.

### Acceptance Criteria

1. Le projet backend est initialisé avec le framework choisi (Node.js/Express) avec structure de dossiers standard (`controllers`, `services`, `models`, `middleware`).
2. Le projet frontend est initialisé avec React + TypeScript + Vite avec structure de dossiers standard (`components`, `pages`, `services`, `store`).
3. Un fichier `README.md` complet est créé avec instructions d’installation, configuration, et démarrage du projet.
4. Un fichier `.gitignore` approprié est configuré pour exclure `node_modules`, fichiers de build, variables d’environnement, fichiers temporaires.
5. Un dépôt Git est initialisé avec une branche `main` et une branche `develop` (ou équivalent workflow Git défini).
6. Un workflow CI/CD basique est configuré (GitHub Actions) qui exécute les tests et le linting sur chaque commit/pull request.
7. Un fichier `docker-compose.yml` est créé pour lancer PostgreSQL (et éventuellement pgAdmin) en local avec configuration de base.
8. Un fichier `.env.example` est créé avec toutes les variables d’environnement nécessaires documentées (backend, frontend, DB, JWT, email, storage).
9. La base de données PostgreSQL est accessible et une connexion de test réussit depuis le backend.
10. Un système de migrations de base de données est configuré avec Prisma (migrations initiales fonctionnelles).

---

## Story 1.2: Multi-Tenant Database Schema Foundation

As a **system architect**,  
I want **un schéma de base de données avec architecture multi-tenant implémentée (table établissements + colonne `établissement_id` sur toutes les tables)**,  
so that **toutes les données sont isolées par établissement dès le départ**.

### Acceptance Criteria

1. Une table `etablissements` est créée avec les colonnes :  
   `id` (UUID, PK), `nom` (VARCHAR), `type` (ENUM: maternelle/primaire/secondaire), `adresse` (TEXT), `telephone` (VARCHAR), `email` (VARCHAR), `logo_url` (VARCHAR), `actif` (BOOLEAN), `cree_le` (TIMESTAMP), `modifie_le` (TIMESTAMP).
2. Une contrainte CHECK est ajoutée sur `type` pour valider les valeurs autorisées.
3. Un index est créé sur la colonne `id` de la table `etablissements`.
4. Le schéma de base pour les autres entités critiques (`utilisateurs`, `eleves`, `classes`, etc.) inclut systématiquement une colonne `etablissement_id` (UUID, FK).
5. Des index composites `(etablissement_id, id)` sont définis sur les tables principales pour optimiser les requêtes multi-tenant.
6. Une première migration Prisma créant ces tables est générée, appliquée, et versionnée dans le repo.
7. La documentation du schéma multi-tenant est créée expliquant le modèle et les règles d’isolation (dans `docs/architecture.md` ou un sous-chapitre dédié).
8. Des tests unitaires simples valident l’intégrité référentielle de base (clé étrangère `etablissement_id`, cascade/ON DELETE RESTRICT selon les besoins).

---

## Story 1.3: CRUD API for School Establishments

As a **directeur d’établissement**,  
I want **créer et gérer mon établissement scolaire (nom, type, adresse, logo)**,  
so that **je peux configurer mon établissement dans le système**.

### Acceptance Criteria

1. Une API REST est créée avec endpoint POST `/api/etablissements` pour créer un établissement avec validation des données (nom requis, type valide, email au format correct).
2. Une API REST est créée avec endpoint GET `/api/etablissements/:id` pour récupérer les détails d’un établissement.
3. Une API REST est créée avec endpoint PUT `/api/etablissements/:id` pour modifier un établissement existant (nom, type, adresse, contacts, logo).
4. Une API REST est créée avec endpoint GET `/api/etablissements` pour lister les établissements (pour admin système) avec pagination.
5. La validation des données rejette les types invalides, les emails invalides, et les données manquantes avec messages d’erreur clairs (via Zod).
6. L’upload de logo est implémenté vers le storage (Spaces/S3) avec validation du type de fichier et de la taille maximale ; l’URL est stockée en base.
7. Les timestamps `cree_le` et `modifie_le` sont automatiquement mis à jour (via Prisma middleware ou DB defaults).
8. Des tests d’intégration (Jest + Supertest) vérifient la création, lecture, mise à jour d’un établissement, et la validation.
9. La documentation API (Swagger/OpenAPI) est générée ou mise à jour pour ces endpoints.

---

## Story 1.4: Multi-Tenant Middleware and Data Isolation

As a **system architect**,  
I want **un middleware applicatif qui filtre automatiquement toutes les requêtes par `etablissement_id` et valide l’isolation des données**,  
so that **aucun établissement ne peut accéder aux données d’un autre établissement**.

### Acceptance Criteria

1. Un middleware backend est créé qui extrait `etablissement_id` depuis le token JWT de l’utilisateur authentifié.
2. Le middleware applique automatiquement un filtre `etablissement_id` à toutes les requêtes Prisma (via un wrapper ou middleware Prisma centralisé).
3. Toutes les opérations INSERT/UPDATE/DELETE exigent un `etablissement_id` cohérent avec celui du JWT ; les tentatives de mismatch sont rejetées.
4. Les endpoints vérifient systématiquement que les ressources manipulées appartiennent au même `etablissement_id` que l’utilisateur.
5. Des tests d’intégration prouvent qu’un utilisateur d’un établissement A ne peut pas accéder aux données d’un établissement B (lecture et écriture).
6. Les tentatives d’accès cross-tenant sont loggées dans la table `audit_logs` avec détail de la requête, utilisateur et établissement.
7. La documentation explique le fonctionnement du middleware, les règles d’isolation, et les limitations connues.

---

## Story 1.5: User Authentication System

As a **utilisateur**,  
I want **m’authentifier avec email et mot de passe et recevoir un token JWT**,  
so that **je peux accéder au système de manière sécurisée**.

### Acceptance Criteria

1. Une table `utilisateurs` est créée avec colonnes : `id` (UUID), `email` (VARCHAR unique), `mot_de_passe_hash` (VARCHAR), `etablissement_id` (UUID FK), `role` (ENUM), `actif` (BOOLEAN), `cree_le` (TIMESTAMP).
2. Un endpoint POST `/api/auth/login` accepte email et mot de passe.
3. Le système vérifie le mot de passe avec bcrypt et génère un JWT contenant `user_id`, `etablissement_id` et `role`, avec durée de validité 24h.
4. Un endpoint POST `/api/auth/refresh` permet de renouveler le token via un refresh token (stocké côté serveur/DB ou liste blanche) valide 7 jours.
5. Un endpoint POST `/api/auth/logout` invalide le refresh token (revocation en base ou blacklist).
6. Un middleware d’authentification vérifie la validité du JWT sur toutes les routes protégées et renvoie 401 en cas d’échec.
7. Un rate limiting est implémenté sur `/api/auth/login` (5 tentatives avant blocage 30 minutes) avec journalisation des essais échoués.
8. Des tests d’intégration couvrent login réussi/échoué, refresh, logout et accès refusé avec token invalide/expiré.

---

## Story 1.6: Password Reset Functionality

As a **utilisateur**,  
I want **réinitialiser mon mot de passe si je l’ai oublié**,  
so that **je peux retrouver l’accès à mon compte**.

### Acceptance Criteria

1. Un endpoint POST `/api/auth/forgot-password` accepte un email et génère un token de réinitialisation à usage unique, valable 1 heure.
2. Un email est envoyé à l’utilisateur via le service d’email configuré (SMTP/SendGrid) avec un lien contenant le token.
3. Un endpoint POST `/api/auth/reset-password` accepte le token et un nouveau mot de passe, applique la politique de sécurité (min 8 caractères, 1 maj, 1 min, 1 chiffre).
4. Le mot de passe est hashé avec bcrypt avant sauvegarde et le token de réinitialisation est invalidé après utilisation ou expiration.
5. Des tests vérifient que le token expire après 1 heure, ne peut être utilisé qu’une fois, et que les emails sont correctement déclenchés (mock du service d’email).
6. Les tentatives de réinitialisation invalides (token expiré, déjà utilisé, email inconnu) renvoient des messages d’erreur clairs.

---

## Story 1.7: User Management CRUD with Roles

As a **directeur ou admin**,  
I want **créer, modifier, et supprimer des utilisateurs avec attribution de rôles (Directeur, Admin, Secrétaire, Comptable, Enseignant)**,  
so that **je peux gérer les accès au système pour mon établissement**.

### Acceptance Criteria

1. Un endpoint POST `/api/utilisateurs` crée un utilisateur avec `email`, mot de passe initial, `role` et `etablissement_id` (déduit du créateur).
2. Un endpoint GET `/api/utilisateurs` liste les utilisateurs de l’établissement courant avec pagination, recherche et filtres basiques (rôle, actif).
3. Un endpoint GET `/api/utilisateurs/:id` retourne les détails d’un utilisateur.
4. Un endpoint PUT `/api/utilisateurs/:id` permet de modifier email, rôle, et statut actif/inactif (soft delete).
5. Une règle métier empêche un Admin de modifier/supprimer un Directeur ; seuls les Directeurs peuvent gérer d’autres Directeurs.
6. Le backend vérifie que l’utilisateur créé/modifié appartient au même `etablissement_id` que l’utilisateur courant.
7. Des tests d’intégration couvrent le CRUD complet, les règles de droits, et l’isolation multi-tenant.
8. Toutes les opérations de création/modification/suppression d’utilisateurs sont loggées dans `audit_logs`.

---

## Story 1.8: Role-Based Access Control (RBAC) Implementation

As a **system architect**,  
I want **un système RBAC qui contrôle l’accès aux fonctionnalités selon le rôle de l’utilisateur**,  
so that **chaque rôle n’a accès qu’aux fonctionnalités appropriées**.

### Acceptance Criteria

1. Un middleware d’autorisation est créé pour vérifier le rôle de l’utilisateur avant d’autoriser l’accès aux endpoints protégés.
2. Une matrice de permissions par rôle et par module (Directeur, Admin, Secrétaire, Comptable, Enseignant) est définie et versionnée dans le code (config ou constantes).
3. Les endpoints sont annotés/marqués avec les rôles autorisés (par décorateur, helper ou convention explicite).
4. Le middleware renvoie HTTP 403 pour toute requête où l’utilisateur n’a pas les permissions nécessaires.
5. Des tests vérifient que chaque rôle peut accéder uniquement aux endpoints autorisés et que les accès non autorisés sont rejetés et loggés.
6. La documentation liste les permissions par rôle et par module de manière compréhensible pour les parties prenantes.

---

## Story 1.9: Basic Frontend Setup and Authentication UI

As a **utilisateur**,  
I want **une interface web pour me connecter et voir mon profil**,  
so that **je peux utiliser le système via un navigateur**.

### Acceptance Criteria

1. Une page de connexion est créée dans le frontend avec formulaire (email, mot de passe), gestion des erreurs et intégration à l’API `/api/auth/login`.
2. Une page “mot de passe oublié” permet de déclencher `/api/auth/forgot-password` avec gestion de l’état de chargement et des messages de succès/erreur.
3. Une page “réinitialisation de mot de passe” consomme `/api/auth/reset-password` avec formulaire sécurisé pour le nouveau mot de passe.
4. Après connexion réussie, l’utilisateur est redirigé vers un tableau de bord basique (placeholder) adapté à son rôle.
5. Un header/navbar affiche le nom ou l’email de l’utilisateur, l’établissement courant, et un bouton de déconnexion.
6. Le token JWT est stocké de manière sécurisée (par défaut dans `localStorage` pour MVP avec notes de sécurité, ou cookie httpOnly si choisi) et injecté via Axios interceptors.
7. Un intercepteur HTTP gère la redirection vers la page de connexion si le token est expiré ou invalide (401).
8. Des tests de composants (Jest + React Testing Library) vérifient le rendu des pages de login/reset et les interactions de base.
9. L’interface est responsive et fonctionne correctement sur desktop et tablette (MUI, breakpoints).

