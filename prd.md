# SaaS de Gestion des Établissements Scolaires Product Requirements Document (PRD)

---

## Goals and Background Context

### Goals

- Centraliser la gestion des établissements scolaires (maternelle, primaire, secondaire) dans une plateforme SaaS unique
- Automatiser la gestion financière (facturation, paiements, suivi des soldes) pour réduire les erreurs et améliorer le suivi
- Digitaliser les processus académiques (inscriptions, admissions, évaluations, présences) pour remplacer les méthodes manuelles (papier, Excel, WhatsApp)
- Fournir des statistiques fiables et des tableaux de bord pour la direction afin d'améliorer la prise de décision
- Assurer une séparation stricte des données entre établissements avec une architecture multi-tenant sécurisée
- Adapter le système aux différents niveaux scolaires (maternelle, primaire, secondaire) avec des configurations flexibles
- Créer une solution accessible financièrement et adaptée aux réalités africaines
- Établir une base évolutive pour des extensions futures (universités, mobile, nouveaux modules)

### Background Context

Le secteur éducatif en Afrique fait encore largement appel à des méthodes manuelles pour gérer les établissements scolaires : gestion sur papier, utilisation d'Excel pour les listes d'élèves et les notes, communication via WhatsApp, suivi des paiements dans des cahiers. Cette approche génère plusieurs problèmes critiques : manque de centralisation des données, difficultés de suivi des paiements et des soldes, absence de statistiques fiables pour la direction, et mauvaise communication interne.

Ce SaaS répond à ces défis en proposant une solution complète et centralisée qui couvre tous les aspects de la gestion scolaire, de l'inscription des élèves à la facturation et au suivi financier, en passant par les évaluations et les présences. L'architecture multi-tenant permet à plusieurs établissements d'utiliser la même plateforme tout en garantissant une isolation stricte des données. Le système est conçu pour s'adapter aux spécificités des différents niveaux scolaires (maternelle avec évaluations qualitatives, primaire et secondaire avec notes numériques et coefficients), tout en restant simple à utiliser et accessible financièrement.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024 | 1.0 | Création initiale du PRD basé sur le document de synthèse MVP | Product Manager |

---

## Requirements

### Functional

1. FR1: Le système doit permettre la création et la configuration d'établissements scolaires avec informations de base (nom, adresse, logo) et sélection du type (Maternelle, Primaire, Secondaire)
2. FR2: Le système doit gérer une année scolaire active par établissement avec paramètres généraux minimaux
3. FR3: Le système doit fournir une authentification par email et mot de passe avec réinitialisation de mot de passe
4. FR4: Le système doit gérer 5 rôles utilisateurs (Directeur, Admin, Secrétaire, Comptable, Enseignant) avec permissions par module
5. FR5: Le système doit permettre le CRUD complet des utilisateurs avec gestion des permissions basiques
6. FR6: Le système doit permettre le CRUD complet des élèves (nom, prénom, date de naissance, sexe, photo) avec informations parents (nom, téléphone, email)
7. FR7: Le système doit gérer les statuts d'élève (inscrit, admis, désinscrit) avec recherche et filtres
8. FR8: Le système doit permettre la création de classes (nom, niveau, effectif max) avec affectation d'élèves et transfert entre classes
9. FR9: Le système doit afficher la liste des classes avec effectifs et vérifier les limites d'effectif avant affectation
10. FR10: Le système doit permettre le CRUD complet des enseignants (nom, prénom, email, téléphone) avec affectation à des classes
11. FR11: Le système doit gérer les périodes/trimestres (3 trimestres par défaut) pour les évaluations
12. FR12: Le système doit permettre la saisie de notes par matière avec coefficients (essentiel pour secondaire)
13. FR13: Le système doit calculer automatiquement les moyennes par matière (avec coefficients) et la moyenne générale
14. FR14: Le système doit gérer les évaluations qualitatives pour la maternelle (acquis, en cours, non acquis) et numériques pour primaire/secondaire
15. FR15: Le système doit générer des bulletins (vue simplifiée) avec liste des notes par élève/classe
16. FR16: Le système doit inclure un système de validation des notes avant calcul avec blocage des modifications après validation
17. FR17: Le système doit permettre la programmation et la saisie d'évaluations de rattrapage avec remplacement de la note originale si meilleure
18. FR18: Le système doit permettre la prise de présence quotidienne par classe avec liste des absents et statistiques d'absentéisme basiques
19. FR19: Le système doit permettre la configuration complète des types de frais scolaires (entièrement configurables, pas de types prédéfinis)
20. FR20: Le système doit permettre la configuration des montants de frais par niveau/classe avec échéances (mensuel, trimestriel, annuel)
21. FR21: Le système doit générer automatiquement des factures selon les échéances configurées pour les élèves actifs (statut "Admis" et affectés)
22. FR22: Le système doit permettre la génération manuelle de factures avec vérification des doublons
23. FR23: Le système doit gérer les statuts de facture (émise, payée, partiellement payée, impayée) avec date d'échéance automatique
24. FR24: Le système doit permettre la modification de factures si statut "Émise" (non payée) avec ajustement du solde restant si partiellement payée
25. FR25: Le système doit permettre l'enregistrement de paiements (montant, date, mode : espèces) avec paiement partiel
26. FR26: Le système doit calculer et afficher les soldes par élève avec liste des impayés
27. FR27: Le système doit générer des reçus basiques pour les paiements
28. FR28: Le système doit gérer les crédits (paiements en avance) avec application aux factures futures
29. FR29: Le système doit générer des rapports de recettes (période, type de frais) avec statistiques financières basiques
30. FR30: Le système doit fournir un tableau de bord avec vue d'ensemble direction (statistiques clés : nombre d'élèves total/par classe/par niveau, nombre de classes, recettes du mois/période, taux de paiement, alertes impayés/absences)
31. FR31: Le système doit permettre l'export de listes (élèves, paiements, factures) au format Excel
32. FR32: Le système doit implémenter un workflow d'inscription avec vérification des places disponibles et gestion de liste d'attente si classes pleines
33. FR33: Le système doit implémenter un workflow d'admission avec attribution de numéro d'élève unique (format ANNEE-NUM) et validation par Directeur
34. FR34: Le système doit bloquer la désinscription d'un élève si solde impayé > 0
35. FR35: Le système doit permettre la création de nouvelles classes si classe pleine avec autorisation Directeur (pas de création en cours d'année sauf exception)
36. FR36: Le système doit permettre l'affectation flexible des enseignants (polyvalent si pas de matière, spécialisé si matière spécifiée) avec gestion des dates début/fin pour remplacements
37. FR37: Le système doit gérer l'absence de note avec 3 options : donner zéro, ne pas considérer dans moyenne, programmer rattrapage
38. FR38: Le système doit appliquer une priorité de montants de frais : par élève > par classe > par niveau > par défaut
39. FR39: Le système doit éviter la regénération de factures existantes pour la même période lors de la génération automatique
40. FR40: Le système doit calculer les soldes existants avant génération de nouvelles factures
41. FR41: Le système doit permettre les paiements en avance avec génération automatique de la facture correspondante et marquage "Payée à l'avance"
42. FR42: Le système doit empêcher la modification rétroactive des tarifs (les factures déjà émises gardent leur montant)

### Non Functional

1. NFR1: Le système doit implémenter une architecture multi-tenant avec base de données partagée et colonne `établissement_id` sur toutes les tables pour isolation logique
2. NFR2: Le système doit implémenter un middleware de filtrage automatique qui injecte `WHERE établissement_id = ?` sur toutes les requêtes SELECT
3. NFR3: Le système doit vérifier `établissement_id` sur toutes les opérations INSERT/UPDATE/DELETE avec validation au niveau API avant traitement
4. NFR4: Le système doit rejeter toute requête cross-tenant et logger les tentatives d'accès non autorisées
5. NFR5: Le système doit implémenter des contraintes d'intégrité référentielle avec index composite sur `(établissement_id, id)` pour performance
6. NFR6: Le système doit utiliser bcrypt (ou argon2) pour le hashage des mots de passe avec salt unique par utilisateur
7. NFR7: Le système doit imposer une politique de mots de passe : minimum 8 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre, expiration optionnelle 90 jours
8. NFR8: Le système doit utiliser JWT avec durée de 24 heures, refresh tokens de 7 jours, rotation des tokens, et stockage `établissement_id` dans token
9. NFR9: Le système doit implémenter un rate limiting : 5 tentatives de connexion, blocage 30 minutes, alerte après 3 échecs
10. NFR10: Le système doit implémenter RBAC (Role-Based Access Control) avec 5 rôles définis et matrice de permissions par module
11. NFR11: Le système doit chiffrer les données en transit avec HTTPS/TLS 1.3 obligatoire, certificats SSL valides, HSTS activé
12. NFR12: Le système doit chiffrer les données au repos : chiffrement base de données (TDE si disponible), chiffrement fichiers sensibles (photos, documents), gestion des clés sécurisée
13. NFR13: Le système doit effectuer des sauvegardes quotidiennes à 3h du matin avec rétention 30 jours, format chiffré, localisation serveur dédié + cloud, tests de restauration mensuels
14. NFR14: Le système doit logger tous les événements critiques : connexions/déconnexions, créations/modifications/suppressions importantes, accès données sensibles, tentatives accès non autorisées, modifications configuration, opérations financières, exports de données
15. NFR15: Le système doit capturer dans les logs d'audit : utilisateur (ID, email, rôle), établissement (ID), action (CREATE, UPDATE, DELETE, READ), ressource (table, ID), données avant/après, timestamp (précision seconde), adresse IP, User-Agent, résultat (succès/échec)
16. NFR16: Le système doit stocker les logs d'audit dans une table `audit_logs` séparée avec rétention 1 an, append-only (pas de modification), index sur (établissement_id, timestamp, utilisateur_id)
17. NFR17: Le système doit monitorer les métriques de performance : temps de réponse API, requêtes lentes (> 1 seconde), utilisation CPU/Mémoire
18. NFR18: Le système doit monitorer les métriques de sécurité : tentatives de connexion échouées, tentatives d'accès cross-tenant, modifications massives de données
19. NFR19: Le système doit monitorer la disponibilité : uptime du service, erreurs HTTP (4xx, 5xx), disponibilité base de données
20. NFR20: Le système doit envoyer des alertes email pour : tentatives d'accès non autorisées (≥ 5 en 1h), erreurs système critiques, échecs de sauvegarde, performance dégradée (> 5s)
21. NFR21: Le système doit être conforme RGPD avec consentement explicite pour données personnelles, droit à l'oubli (suppression définitive sur demande), droit d'accès (export format lisible, délai 30 jours), droit de rectification, notification en cas de fuite (détection automatique, notification 72h)
22. NFR22: Le système doit conserver les données légales (factures : 10 ans) même en cas de demande de suppression
23. NFR23: Le système doit permettre l'export de données par établissement en formats JSON (complet), CSV (tableaux), Excel (rapports) avec chiffrement des exports
24. NFR24: Le système doit garantir une isolation stricte des données entre établissements avec aucune possibilité d'accès cross-tenant même en cas d'erreur système
25. NFR25: Le système doit être conçu pour être accessible financièrement et adapté aux réalités africaines (connexions lentes possibles, interface simple)
26. NFR26: Le système doit être évolutif pour permettre des extensions futures (universités, mobile, nouveaux modules) sans refonte majeure

---

## User Interface Design Goals

### Overall UX Vision

L'interface utilisateur doit être **simple, intuitive et efficace** pour remplacer les méthodes manuelles actuelles (papier, Excel, WhatsApp). L'expérience doit être adaptée aux réalités africaines avec une attention particulière aux connexions potentiellement lentes et à la simplicité d'utilisation pour des utilisateurs ayant des niveaux de compétence technique variables.

L'interface doit guider naturellement les utilisateurs à travers les workflows complexes (inscription → admission → affectation, facturation → paiement) tout en restant rapide et réactive. Chaque rôle (Directeur, Admin, Secrétaire, Comptable, Enseignant) doit avoir accès à une interface adaptée à ses besoins spécifiques, avec une navigation claire vers les fonctionnalités pertinentes.

L'objectif est de créer une interface qui inspire confiance et professionnalisme, tout en étant accessible et facile à apprendre pour des utilisateurs qui passent de méthodes manuelles à une solution digitale.

### Key Interaction Paradigms

- **Navigation par modules** : Menu latéral ou navigation principale organisée par modules fonctionnels (Élèves, Classes, Enseignants, Évaluations, Financier, etc.) pour un accès rapide aux fonctionnalités
- **Tableaux de données interactifs** : Listes d'élèves, classes, factures avec filtres, recherche et tri pour faciliter la gestion de grandes quantités de données
- **Formulaires progressifs** : Workflows multi-étapes pour les processus complexes (inscription → admission → affectation) avec indicateurs de progression
- **Actions contextuelles** : Boutons d'action visibles selon le contexte et les permissions de l'utilisateur (ex: "Générer factures" visible uniquement pour Comptable/Directeur)
- **Feedback immédiat** : Confirmations visuelles pour les actions importantes (création, modification, suppression) avec possibilité d'annulation
- **Vues adaptatives** : Affichage différent selon le rôle utilisateur (enseignant voit ses classes, comptable voit les aspects financiers en priorité)
- **Recherche globale** : Barre de recherche permettant de trouver rapidement élèves, classes, factures depuis n'importe quelle page
- **Exports rapides** : Boutons d'export Excel facilement accessibles depuis les listes principales

### Core Screens and Views

1. **Page de connexion** : Authentification simple (email + mot de passe) avec réinitialisation de mot de passe
2. **Tableau de bord principal** : Vue d'ensemble avec statistiques clés (nombre d'élèves, classes, recettes, alertes) adaptée au rôle utilisateur
3. **Liste des élèves** : Tableau avec recherche, filtres (statut, classe, niveau), actions rapides (voir fiche, modifier, affecter classe)
4. **Fiche élève complète** : Vue détaillée avec onglets (Informations, Parents, Notes, Factures, Paiements, Présences)
5. **Gestion des classes** : Liste des classes avec effectifs, création/modification, affectation d'élèves
6. **Gestion des enseignants** : Liste avec affectations, création/modification, affectation aux classes
7. **Saisie des notes** : Interface de saisie par classe/matière avec validation avant calcul, gestion des absences de note
8. **Prise de présence** : Interface quotidienne par classe avec liste des élèves et marquage rapide (présent/absent)
9. **Configuration financière** : Gestion des types de frais et montants par niveau/classe
10. **Génération de factures** : Interface pour génération automatique ou manuelle avec aperçu avant validation
11. **Liste des factures** : Tableau avec filtres (élève, statut, période), détails, modification si statut "Émise"
12. **Enregistrement de paiements** : Formulaire de paiement avec sélection de factures, montant, mode de paiement
13. **Rapports financiers** : Vue des recettes, impayés, statistiques avec filtres par période
14. **Exports** : Interface d'export pour listes (élèves, paiements, factures) au format Excel
15. **Gestion des utilisateurs** : CRUD utilisateurs avec attribution de rôles et permissions (Directeur/Admin uniquement)
16. **Configuration établissement** : Paramètres généraux, année scolaire active, type d'établissement (Directeur/Admin uniquement)

### Accessibility: WCAG AA

Le système doit respecter les standards WCAG AA pour garantir une accessibilité de base :
- Contraste de couleurs suffisant pour le texte
- Navigation au clavier fonctionnelle
- Labels appropriés pour les formulaires
- Structure sémantique HTML correcte
- Messages d'erreur clairs et accessibles

Cette conformité permet d'assurer une utilisation par des utilisateurs avec différents besoins d'accessibilité tout en restant réaliste pour un MVP.

### Branding

Aucun guide de style ou éléments de branding spécifiques n'ont été fournis à ce stade. L'interface doit adopter un style professionnel et sobre, adapté au secteur éducatif :
- Palette de couleurs neutres et professionnelles (bleus, gris)
- Typographie claire et lisible
- Icônes cohérentes et intuitives
- Logo de l'établissement affiché dans l'en-tête (si configuré)

Le système doit permettre l'upload d'un logo par établissement pour personnalisation minimale.

### Target Device and Platforms: Web Responsive

Le système doit être accessible via **navigateurs web** (Chrome, Firefox, Safari, Edge) avec une interface responsive qui s'adapte aux différentes tailles d'écran :
- **Desktop** : Expérience complète avec toutes les fonctionnalités, navigation optimale pour écrans larges
- **Tablette** : Interface adaptée avec navigation tactile, formulaires optimisés
- **Mobile** : Vue simplifiée pour consultation et actions essentielles (prise de présence, consultation notes, enregistrement paiement rapide)

L'objectif MVP se concentre sur l'expérience desktop/tablette, avec une base responsive pour le mobile qui pourra être améliorée dans les phases ultérieures.

---

## Technical Assumptions

### Repository Structure: Monorepo

Le projet utilisera une structure **Monorepo** pour gérer le code backend et frontend dans un même dépôt. Cette approche facilite :
- Le partage de types/interfaces entre frontend et backend
- La gestion des dépendances de manière centralisée
- La synchronisation des versions et des déploiements
- La maintenance et le développement itératif pour une petite équipe MVP

**Alternative considérée :** Polyrepo aurait permis une séparation plus nette mais ajoute de la complexité pour la synchronisation et le partage de code dans un contexte MVP.

### Service Architecture

Le système utilisera une architecture **Monolith** pour le MVP avec séparation claire des couches (API, Business Logic, Data Access). Cette approche est justifiée par :
- **Simplicité de déploiement** : Un seul service à déployer et maintenir
- **Performance** : Pas de latence réseau entre services, transactions simplifiées
- **Développement rapide** : Pas de complexité de communication inter-services
- **Coût réduit** : Infrastructure plus simple pour le MVP
- **Évolutivité future** : Le monolith peut être découpé en microservices plus tard si nécessaire

**Architecture cible :**
- **Backend API** : RESTful API avec séparation des responsabilités par modules (établissements, élèves, classes, évaluations, financier)
- **Frontend** : Application SPA (Single Page Application) consommant l'API
- **Base de données** : PostgreSQL avec isolation multi-tenant au niveau application

**Alternative considérée :** Microservices aurait offert plus de flexibilité mais ajoute de la complexité opérationnelle (orchestration, monitoring, déploiement) non justifiée pour un MVP.

### Testing Requirements

Le système implémentera une approche **Unit + Integration** pour le MVP :
- **Tests unitaires** : Couverture des fonctions métier critiques (calculs de moyennes, calculs financiers, règles de validation)
- **Tests d'intégration** : Tests des API endpoints avec base de données de test, tests des workflows complets (inscription → admission → affectation)
- **Tests E2E** : Reportés en Phase 2 pour se concentrer sur la livraison fonctionnelle du MVP
- **Tests manuels** : Nécessaires pour valider les workflows complexes et l'expérience utilisateur

**Justification :** Cette approche équilibre la qualité du code avec la vitesse de développement pour le MVP. Les tests unitaires garantissent la fiabilité des calculs critiques (financiers, académiques), tandis que les tests d'intégration valident les workflows métier essentiels.

**Outils recommandés :**
- Backend : Jest (Node.js) ou pytest (Python) pour tests unitaires, Supertest pour tests API
- Frontend : Jest + React Testing Library pour tests de composants
- Base de données : Base de données de test isolée pour tests d'intégration

### Additional Technical Assumptions and Requests

#### Backend Stack
- **Langage/Framework** : Node.js avec Express OU Python avec Django (à décider selon expertise équipe)
  - **Node.js/Express** : Écosystème riche, développement rapide, bon pour APIs REST
  - **Python/Django** : Framework robuste avec ORM intégré, bon pour applications métier complexes
- **Base de données** : PostgreSQL (obligatoire) - Nécessaire pour les contraintes d'intégrité référentielle, transactions ACID, et performance avec multi-tenant
- **ORM** : Prisma (si Node.js) ou Django ORM (si Python) - Facilite la gestion du schéma multi-tenant et les migrations
- **Authentification** : JWT (jsonwebtoken) avec refresh tokens - Standard pour APIs REST, stateless, adapté au multi-tenant
- **Validation** : Joi (Node.js) ou Pydantic (Python) - Validation stricte des données d'entrée pour sécurité et qualité

#### Frontend Stack
- **Framework** : React OU Vue.js (à décider selon expertise équipe)
  - **React** : Écosystème mature, grande communauté, nombreuses bibliothèques
  - **Vue.js** : Courbe d'apprentissage douce, documentation excellente, adapté aux équipes plus petites
- **Gestion d'état** : Redux (React) ou Vuex (Vue) - Nécessaire pour gérer l'état global (utilisateur connecté, établissement actif, permissions)
- **Routing** : React Router ou Vue Router - Navigation SPA standard
- **UI Framework** : Material-UI (React) ou Vuetify (Vue) - Composants pré-construits pour accélérer le développement MVP
- **HTTP Client** : Axios - Gestion des requêtes API avec intercepteurs pour JWT et gestion d'erreurs centralisée

#### Infrastructure et Déploiement
- **Serveur web** : Nginx - Reverse proxy et serveur statique pour le frontend
- **Base de données** : PostgreSQL avec réplication optionnelle pour MVP (priorité sur la disponibilité de base)
- **Cache** : Redis (optionnel pour MVP) - Peut être ajouté plus tard pour améliorer les performances
- **CDN** : Cloudflare ou équivalent - Accélération du chargement frontend, particulièrement important pour connexions lentes en Afrique
- **Monitoring** : Solution SaaS simple (ex: Sentry pour erreurs, LogRocket pour sessions) pour MVP, Prometheus + Grafana en phase ultérieure
- **Conteneurisation** : Docker - Standardisation des environnements de développement et déploiement
- **Orchestration** : Docker Compose pour MVP (simplicité), Kubernetes pour scale futur
- **CI/CD** : GitHub Actions ou GitLab CI - Automatisation des tests et déploiements
- **Environnements** : Dev, Staging, Production - Séparation claire pour tests et déploiement progressif

#### Multi-Tenant Implementation
- **Modèle** : Base de données partagée avec colonne `établissement_id` sur toutes les tables
- **Isolation** : Middleware applicatif qui filtre automatiquement toutes les requêtes par `établissement_id`
- **Sécurité** : Validation stricte au niveau API pour empêcher tout accès cross-tenant
- **Performance** : Index composite sur `(établissement_id, id)` pour optimiser les requêtes filtrées

#### Performance et Scalabilité
- **Optimisation requêtes** : Pagination obligatoire pour toutes les listes (limite par défaut : 50 éléments)
- **Lazy loading** : Chargement à la demande pour les données volumineuses (historique, exports)
- **Compression** : Gzip/Brotli pour les réponses API et assets frontend
- **Connexions lentes** : Optimisation pour connexions lentes (timeouts adaptés, retry logic, feedback utilisateur)

#### Sécurité
- **Chiffrement** : HTTPS/TLS 1.3 obligatoire, certificats SSL valides (Let's Encrypt recommandé)
- **Mots de passe** : Hashage avec bcrypt (ou argon2), salt unique, politique de complexité
- **Rate limiting** : Protection contre les attaques brute force (5 tentatives, blocage 30 min)
- **CORS** : Configuration stricte pour limiter les origines autorisées
- **Headers sécurité** : HSTS, CSP (Content Security Policy), X-Frame-Options

#### Conformité et Audit
- **Logs d'audit** : Table dédiée `audit_logs` avec append-only, rétention 1 an
- **RGPD** : Fonctionnalités de suppression/anonymisation, export de données personnelles
- **Sauvegardes** : Quotidiennes, chiffrées, rétention 30 jours minimum

#### Développement et Qualité
- **Linting** : ESLint (Node.js) ou Flake8/Black (Python) pour maintenir la qualité du code
- **Formatage** : Prettier (Node.js) ou Black (Python) pour cohérence du style
- **Git** : Workflow avec branches feature, code review obligatoire avant merge
- **Documentation** : README complet, documentation API (Swagger/OpenAPI), commentaires pour logique métier complexe

---

## Epic List

1. **Epic 1: Foundation & Multi-Tenant Infrastructure** - Établir l'infrastructure de base du projet (setup, Git, CI/CD, base de données), implémenter l'architecture multi-tenant avec isolation stricte des données, et permettre la création/gestion d'établissements scolaires avec authentification et gestion des utilisateurs par rôles.

2. **Epic 2: Core Academic Management** - Permettre la gestion complète des entités académiques de base : création et gestion des élèves (avec workflow inscription/admission), création et gestion des classes avec affectation d'élèves, et gestion des enseignants avec affectation aux classes.

3. **Epic 3: Evaluations & Attendance** - Implémenter le système complet de gestion des évaluations (saisie de notes avec coefficients, calculs de moyennes, évaluations qualitatives pour maternelle, validation des notes, rattrapages) et la prise de présence quotidienne avec statistiques d'absentéisme.

4. **Epic 4: Complete Financial Management** - Mettre en place toute la gestion financière : configuration flexible des frais scolaires, génération automatique et manuelle de factures, enregistrement des paiements avec gestion des crédits et soldes, et rapports financiers de base.

5. **Epic 5: Dashboards & Reporting** - Fournir des tableaux de bord avec statistiques clés adaptées par rôle utilisateur et permettre l'export des données principales (élèves, paiements, factures) au format Excel.

---

## Epic 1: Foundation & Multi-Tenant Infrastructure

Cet épic établit les fondations techniques du projet en mettant en place l'infrastructure de développement (setup projet, Git, CI/CD, base de données), en implémentant l'architecture multi-tenant critique avec isolation stricte des données par établissement, et en délivrant les premières fonctionnalités métier : création et gestion d'établissements scolaires, authentification sécurisée des utilisateurs, et gestion des utilisateurs avec système de rôles et permissions. À la fin de cet épic, un établissement peut être créé, des utilisateurs peuvent s'authentifier, et le système garantit l'isolation complète des données entre établissements.

### Story 1.1: Project Setup and Infrastructure Foundation

As a **developer**,
I want **a projet initialisé avec structure de base, configuration Git, CI/CD basique, et base de données PostgreSQL**,
so that **je peux commencer le développement dans un environnement standardisé et automatisé**.

#### Acceptance Criteria

1. Le projet backend est initialisé avec le framework choisi (Node.js/Express ou Python/Django) avec structure de dossiers standard (controllers, services, models, middleware)
2. Le projet frontend est initialisé avec le framework choisi (React ou Vue.js) avec structure de dossiers standard (components, pages, services, store)
3. Un fichier README.md complet est créé avec instructions d'installation, configuration, et démarrage du projet
4. Un fichier .gitignore approprié est configuré pour exclure node_modules, fichiers de build, variables d'environnement
5. Un dépôt Git est initialisé avec une branche main et une branche develop
6. Un workflow CI/CD basique est configuré (GitHub Actions ou GitLab CI) qui exécute les tests et le linting sur chaque commit
7. Un fichier docker-compose.yml est créé pour lancer PostgreSQL en local avec configuration de base
8. Un fichier .env.example est créé avec toutes les variables d'environnement nécessaires documentées
9. La base de données PostgreSQL est accessible et une connexion de test réussit
10. Un script de migration de base de données de base est configuré (Prisma migrations ou Django migrations)

### Story 1.2: Multi-Tenant Database Schema Foundation

As a **system architect**,
I want **un schéma de base de données avec architecture multi-tenant implémentée (table établissements + colonne établissement_id sur toutes les tables)**,
so that **toutes les données sont isolées par établissement dès le départ**.

#### Acceptance Criteria

1. Une table `établissements` est créée avec les colonnes : id (UUID), nom (VARCHAR), type (ENUM: maternelle/primaire/secondaire), adresse (TEXT), téléphone (VARCHAR), email (VARCHAR), logo_url (VARCHAR), actif (BOOLEAN), créé_le (TIMESTAMP), modifié_le (TIMESTAMP)
2. Une contrainte CHECK est ajoutée sur le type pour valider les valeurs autorisées
3. Un index est créé sur la colonne `id` de la table établissements
4. Un middleware ou système de filtrage est préparé au niveau application pour injecter `établissement_id` dans toutes les requêtes (structure de base, pas encore fonctionnel)
5. La documentation du schéma multi-tenant est créée expliquant le modèle et les règles d'isolation
6. Des tests unitaires vérifient que le schéma respecte les contraintes d'intégrité référentielle de base

### Story 1.3: CRUD API for School Establishments

As a **directeur d'établissement**,
I want **créer et gérer mon établissement scolaire (nom, type, adresse, logo)**,
so that **je peux configurer mon établissement dans le système**.

#### Acceptance Criteria

1. Une API REST est créée avec endpoint POST `/api/établissements` pour créer un établissement avec validation des données (nom requis, type valide)
2. Une API REST est créée avec endpoint GET `/api/établissements/:id` pour récupérer les détails d'un établissement
3. Une API REST est créée avec endpoint PUT `/api/établissements/:id` pour modifier un établissement existant
4. Une API REST est créée avec endpoint GET `/api/établissements` pour lister tous les établissements (pour admin système, pas multi-tenant encore)
5. La validation des données rejette les types invalides et les données manquantes avec messages d'erreur clairs
6. L'upload de logo est implémenté (stockage local ou cloud) avec validation du type de fichier et taille maximale
7. Les timestamps `créé_le` et `modifié_le` sont automatiquement mis à jour
8. Des tests d'intégration vérifient la création, lecture, mise à jour d'un établissement
9. La documentation API (Swagger/OpenAPI) est générée pour ces endpoints

### Story 1.4: Multi-Tenant Middleware and Data Isolation

As a **system architect**,
I want **un middleware applicatif qui filtre automatiquement toutes les requêtes par établissement_id et valide l'isolation des données**,
so that **aucun établissement ne peut accéder aux données d'un autre établissement**.

#### Acceptance Criteria

1. Un middleware est créé qui extrait `établissement_id` depuis le token JWT ou la session utilisateur
2. Le middleware injecte automatiquement `WHERE établissement_id = ?` dans toutes les requêtes SELECT
3. Le middleware valide que `établissement_id` est présent et valide sur toutes les opérations INSERT/UPDATE/DELETE
4. Une validation au niveau API rejette toute requête où l'utilisateur tente d'accéder à une ressource d'un autre établissement
5. Des tests d'intégration vérifient qu'un établissement ne peut pas accéder aux données d'un autre établissement
6. Des tests vérifient que les tentatives d'accès cross-tenant sont rejetées et loggées
7. Les logs d'audit capturent les tentatives d'accès non autorisées avec détails (utilisateur, établissement, ressource)
8. La documentation explique le fonctionnement du middleware et les règles d'isolation

### Story 1.5: User Authentication System

As a **utilisateur**,
I want **m'authentifier avec email et mot de passe et recevoir un token JWT**,
so that **je peux accéder au système de manière sécurisée**.

#### Acceptance Criteria

1. Une table `utilisateurs` est créée avec colonnes : id (UUID), email (VARCHAR unique), mot_de_passe_hash (VARCHAR), établissement_id (UUID FK), rôle (ENUM), actif (BOOLEAN), créé_le (TIMESTAMP)
2. Un endpoint POST `/api/auth/login` est créé qui accepte email et mot de passe
3. Le système vérifie le mot de passe avec bcrypt (ou argon2) et génère un JWT contenant user_id, établissement_id, et rôle
4. Le JWT a une durée de validité de 24 heures
5. Un endpoint POST `/api/auth/refresh` est créé pour renouveler le token avec un refresh token (durée 7 jours)
6. Un endpoint POST `/api/auth/logout` est créé pour invalider le refresh token
7. Un middleware d'authentification vérifie la validité du JWT sur toutes les routes protégées
8. Le rate limiting est implémenté : 5 tentatives de connexion, blocage 30 minutes après échecs
9. Des tests d'intégration vérifient le login, refresh, logout, et le rejet de tokens invalides
10. Les tentatives de connexion échouées sont loggées pour sécurité

### Story 1.6: Password Reset Functionality

As a **utilisateur**,
I want **réinitialiser mon mot de passe si je l'ai oublié**,
so that **je peux retrouver l'accès à mon compte**.

#### Acceptance Criteria

1. Un endpoint POST `/api/auth/forgot-password` est créé qui accepte un email et génère un token de réinitialisation
2. Un email est envoyé à l'utilisateur avec un lien contenant le token de réinitialisation (durée de validité : 1 heure)
3. Un endpoint POST `/api/auth/reset-password` est créé qui accepte le token et un nouveau mot de passe
4. Le nouveau mot de passe est validé selon la politique (minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)
5. Le token de réinitialisation est invalidé après utilisation
6. Des tests vérifient que le token expire après 1 heure et ne peut être utilisé qu'une fois
7. Des tests vérifient que les emails sont envoyés correctement (mock email service pour tests)

### Story 1.7: User Management CRUD with Roles

As a **directeur ou admin**,
I want **créer, modifier, et supprimer des utilisateurs avec attribution de rôles (Directeur, Admin, Secrétaire, Comptable, Enseignant)**,
so that **je peux gérer les accès au système pour mon établissement**.

#### Acceptance Criteria

1. Un endpoint POST `/api/utilisateurs` est créé pour créer un utilisateur avec email, mot de passe, rôle, et établissement_id
2. Un endpoint GET `/api/utilisateurs` est créé pour lister les utilisateurs de l'établissement (filtré automatiquement par établissement_id)
3. Un endpoint GET `/api/utilisateurs/:id` est créé pour récupérer les détails d'un utilisateur
4. Un endpoint PUT `/api/utilisateurs/:id` est créé pour modifier un utilisateur (email, rôle, statut actif)
5. Un endpoint DELETE `/api/utilisateurs/:id` est créé pour désactiver un utilisateur (soft delete avec flag actif=false)
6. La validation vérifie que le rôle est valide (Directeur, Admin, Secrétaire, Comptable, Enseignant)
7. Une règle métier empêche un Admin de modifier/supprimer un Directeur
8. Le système vérifie que l'utilisateur créé appartient au même établissement que l'utilisateur qui le crée
9. Des tests d'intégration vérifient le CRUD complet avec isolation multi-tenant
10. Les opérations de création/modification/suppression d'utilisateurs sont loggées dans audit_logs

### Story 1.8: Role-Based Access Control (RBAC) Implementation

As a **system architect**,
I want **un système RBAC qui contrôle l'accès aux fonctionnalités selon le rôle de l'utilisateur**,
so that **chaque rôle n'a accès qu'aux fonctionnalités appropriées**.

#### Acceptance Criteria

1. Un middleware d'autorisation est créé qui vérifie le rôle de l'utilisateur avant d'autoriser l'accès aux endpoints
2. Une matrice de permissions est définie pour chaque rôle (Directeur, Admin, Secrétaire, Comptable, Enseignant) par module
3. Le middleware rejette les requêtes où l'utilisateur n'a pas les permissions nécessaires avec code HTTP 403
4. Les endpoints sont annotés/marqués avec les rôles autorisés
5. Des tests vérifient que chaque rôle peut accéder uniquement aux endpoints autorisés
6. Des tests vérifient que les tentatives d'accès non autorisées sont rejetées et loggées
7. La documentation liste les permissions par rôle et par module

### Story 1.9: Basic Frontend Setup and Authentication UI

As a **utilisateur**,
I want **une interface web pour me connecter et voir mon profil**,
so that **je peux utiliser le système via un navigateur**.

#### Acceptance Criteria

1. Une page de connexion est créée avec formulaire (email, mot de passe) et gestion des erreurs
2. Une page de réinitialisation de mot de passe est créée avec formulaire d'email
3. Une page de reset de mot de passe est créée avec formulaire (token, nouveau mot de passe)
4. Après connexion réussie, l'utilisateur est redirigé vers un tableau de bord basique
5. Un header/navbar est créé avec affichage du nom de l'utilisateur et bouton de déconnexion
6. Le token JWT est stocké de manière sécurisée (localStorage ou httpOnly cookie)
7. Un intercepteur HTTP gère automatiquement l'ajout du token JWT aux requêtes API
8. Un intercepteur HTTP gère la redirection vers la page de connexion si le token est expiré
9. Des tests de composants vérifient le rendu et les interactions de base
10. L'interface est responsive et fonctionne sur desktop et tablette

---

## Epic 2: Core Academic Management

Cet épic permet la gestion complète des entités académiques fondamentales du système. Il couvre le cycle de vie complet des élèves depuis l'inscription jusqu'à l'admission et l'affectation aux classes, la création et gestion des classes avec contrôle des effectifs, et la gestion des enseignants avec affectation flexible aux classes. À la fin de cet épic, un établissement peut gérer entièrement ses élèves, classes et enseignants, avec tous les workflows métier nécessaires (inscription avec liste d'attente, admission avec validation, affectation avec contrôle d'effectif).

### Story 2.1: Student Registration Workflow

As a **secrétaire**,
I want **inscrire un nouvel élève avec ses informations personnelles et celles de ses parents**,
so that **je peux enregistrer les demandes d'inscription dans le système**.

#### Acceptance Criteria

1. Une table `élèves` est créée avec colonnes : id (UUID), numéro_élève (VARCHAR unique), nom (VARCHAR), prénom (VARCHAR), date_naissance (DATE), sexe (ENUM), photo_url (VARCHAR), statut (ENUM: inscrit/admis/désinscrit), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Une table `parents` est créée avec colonnes : id (UUID), élève_id (UUID FK), nom (VARCHAR), téléphone (VARCHAR), email (VARCHAR), adresse (TEXT), établissement_id (UUID FK)
3. Un endpoint POST `/api/élèves/inscription` est créé qui accepte les données élève et parents
4. La validation vérifie l'âge minimum/maximum selon le niveau souhaité
5. Le statut initial est défini à "inscrit"
6. Un endpoint GET `/api/élèves` est créé pour lister les élèves avec filtres (statut, niveau souhaité) et recherche (nom, prénom)
7. Des tests vérifient la création d'inscription avec validation des données
8. Les opérations sont loggées dans audit_logs

### Story 2.2: Class Capacity Check and Waiting List

As a **secrétaire**,
I want **vérifier si une classe a des places disponibles et gérer une liste d'attente si la classe est pleine**,
so that **je peux gérer les inscriptions même quand les classes sont complètes**.

#### Acceptance Criteria

1. Une table `classes` est créée avec colonnes : id (UUID), nom (VARCHAR), niveau (VARCHAR), effectif_max (INTEGER), établissement_id (UUID FK), année_scolaire_id (UUID FK), créé_le (TIMESTAMP)
2. Une table `inscriptions` est créée avec colonnes : id (UUID), élève_id (UUID FK), classe_souhaitée_id (UUID FK), statut (ENUM: en_attente/validée), établissement_id (UUID FK), créé_le (TIMESTAMP)
3. Lors de l'inscription, le système vérifie l'effectif actuel de la classe souhaitée
4. Si la classe a des places disponibles, l'inscription est validée
5. Si la classe est pleine, l'inscription est marquée "en_attente" et ajoutée à la liste d'attente
6. Un endpoint GET `/api/inscriptions/liste-attente` est créé pour voir les élèves en attente par classe
7. Des tests vérifient la gestion de la liste d'attente et le changement de statut quand une place se libère
8. La liste d'attente est triée par date d'inscription (premier arrivé, premier servi)

### Story 2.3: Student Admission with Number Assignment

As a **directeur ou secrétaire**,
I want **valider une inscription et attribuer un numéro d'élève unique (format ANNEE-NUM)**,
so that **l'élève devient officiellement admis dans l'établissement**.

#### Acceptance Criteria

1. Un endpoint POST `/api/élèves/:id/admission` est créé pour valider une inscription
2. Le système génère automatiquement un numéro d'élève unique au format ANNEE-NUM (ex: 2024-001)
3. Le numéro est unique par établissement et par année scolaire
4. Le statut de l'élève passe de "inscrit" à "admis"
5. Une validation est requise : seul le Directeur ou le Secrétaire peut valider une admission
6. Un workflow d'approbation est implémenté : Secrétaire soumet → Directeur valide (ou Secrétaire peut valider directement selon configuration)
7. Un endpoint GET `/api/élèves/:id` est créé pour voir la fiche complète d'un élève avec son numéro
8. Des tests vérifient la génération unique des numéros et le changement de statut
9. Les admissions sont loggées dans audit_logs avec approbateur

### Story 2.4: Class Creation and Management

As a **directeur ou admin**,
I want **créer et gérer des classes (nom, niveau, effectif max)**,
so that **je peux organiser les élèves par classes**.

#### Acceptance Criteria

1. Un endpoint POST `/api/classes` est créé pour créer une classe avec nom, niveau, effectif_max
2. La validation vérifie que le nom est unique par établissement et année scolaire
3. La validation vérifie que l'effectif_max est > 0
4. Un endpoint GET `/api/classes` est créé pour lister les classes avec effectif actuel calculé
5. Un endpoint GET `/api/classes/:id` est créé pour voir les détails d'une classe
6. Un endpoint PUT `/api/classes/:id` est créé pour modifier une classe (nom, effectif_max)
7. Une règle métier empêche la modification de l'effectif_max si cela rendrait la classe surchargée
8. Des tests vérifient la création, modification, et validation des contraintes
9. Les opérations sont loggées dans audit_logs

### Story 2.5: Student to Class Assignment

As a **secrétaire**,
I want **affecter un élève admis à une classe en vérifiant l'effectif disponible**,
so that **je peux organiser les élèves dans les classes appropriées**.

#### Acceptance Criteria

1. Une table `affectations_élèves` est créée avec colonnes : id (UUID), élève_id (UUID FK), classe_id (UUID FK), date_début (DATE), date_fin (DATE nullable), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Un endpoint POST `/api/élèves/:id/affectation` est créé pour affecter un élève à une classe
3. Le système vérifie que l'élève a le statut "admis"
4. Le système vérifie que la classe n'est pas pleine (effectif actuel < effectif_max)
5. Si la classe est pleine, le système propose de créer une nouvelle classe (nécessite autorisation Directeur)
6. Un élève ne peut être dans qu'une seule classe active à la fois
7. Un endpoint GET `/api/classes/:id/élèves` est créé pour voir tous les élèves d'une classe
8. Des tests vérifient l'affectation, le contrôle d'effectif, et l'unicité de l'affectation active
9. Les affectations sont loggées dans audit_logs

### Story 2.6: Student Transfer Between Classes

As a **secrétaire**,
I want **transférer un élève d'une classe à une autre**,
so that **je peux réorganiser les classes si nécessaire**.

#### Acceptance Criteria

1. Un endpoint POST `/api/élèves/:id/transfert` est créé pour transférer un élève vers une nouvelle classe
2. Le système ferme l'affectation actuelle (date_fin = aujourd'hui) et crée une nouvelle affectation
3. Le système vérifie que la classe de destination n'est pas pleine
4. Une règle métier empêche les transferts en cours d'année (sauf exception avec autorisation Directeur)
5. L'historique des affectations est conservé pour traçabilité
6. Des tests vérifient le transfert et la conservation de l'historique
7. Les transferts sont loggés dans audit_logs

### Story 2.7: Teacher Management CRUD

As a **directeur ou admin**,
I want **créer et gérer les enseignants (nom, prénom, email, téléphone)**,
so that **je peux enregistrer les enseignants de l'établissement**.

#### Acceptance Criteria

1. Une table `enseignants` est créée avec colonnes : id (UUID), nom (VARCHAR), prénom (VARCHAR), email (VARCHAR), téléphone (VARCHAR), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Un endpoint POST `/api/enseignants` est créé pour créer un enseignant avec validation des données
3. Un endpoint GET `/api/enseignants` est créé pour lister les enseignants avec recherche et filtres
4. Un endpoint GET `/api/enseignants/:id` est créé pour voir la fiche complète d'un enseignant
5. Un endpoint PUT `/api/enseignants/:id` est créé pour modifier un enseignant
6. Un endpoint DELETE `/api/enseignants/:id` est créé pour supprimer un enseignant (soft delete)
7. Des tests vérifient le CRUD complet avec isolation multi-tenant
8. Les opérations sont loggées dans audit_logs

### Story 2.8: Teacher to Class Assignment

As a **directeur ou admin**,
I want **affecter un enseignant à une classe (polyvalent ou spécialisé par matière)**,
so that **je peux organiser l'enseignement dans les classes**.

#### Acceptance Criteria

1. Une table `affectations_enseignants` est créée avec colonnes : id (UUID), enseignant_id (UUID FK), classe_id (UUID FK), matière_id (UUID FK nullable), date_début (DATE), date_fin (DATE nullable), établissement_id (UUID FK)
2. Un endpoint POST `/api/enseignants/:id/affectation` est créé pour affecter un enseignant à une classe
3. Si matière_id est null, l'enseignant est polyvalent de la classe
4. Si matière_id est spécifié, l'enseignant est spécialisé pour cette matière dans cette classe
5. Un enseignant peut avoir plusieurs affectations (plusieurs classes, plusieurs matières)
6. Un endpoint GET `/api/classes/:id/enseignants` est créé pour voir les enseignants d'une classe
7. Un endpoint GET `/api/enseignants/:id/affectations` est créé pour voir les affectations d'un enseignant
8. Des tests vérifient les affectations polyvalentes et spécialisées
9. Les affectations sont loggées dans audit_logs

### Story 2.9: Student Disenrollment Workflow

As a **secrétaire**,
I want **désinscrire un élève avec vérification des impayés**,
so that **je peux gérer les sorties d'élèves de manière contrôlée**.

#### Acceptance Criteria

1. Un endpoint POST `/api/élèves/:id/désinscription` est créé pour désinscrire un élève
2. Le système vérifie que le solde dû de l'élève est à 0 (blocage si impayé)
3. Si le solde est > 0, la désinscription est bloquée avec message d'erreur explicite
4. Si le solde est à 0, le statut passe à "désinscrit", la date de sortie est enregistrée, et la place dans la classe est libérée
5. Un champ "raison" (optionnel) peut être enregistré pour la désinscription
6. Un document de sortie est généré (format texte simple pour MVP)
7. L'historique académique de l'élève est conservé (pas de suppression)
8. Des tests vérifient le blocage si impayé et la désinscription si solde à 0
9. Les désinscriptions sont loggées dans audit_logs

### Story 2.10: Frontend for Student Management

As a **secrétaire**,
I want **une interface web pour gérer les élèves (inscription, admission, affectation, consultation)**,
so that **je peux utiliser le système pour remplacer les méthodes manuelles**.

#### Acceptance Criteria

1. Une page "Liste des élèves" est créée avec tableau, recherche, filtres (statut, classe), et actions (voir, modifier, affecter)
2. Une page "Inscription élève" est créée avec formulaire multi-étapes (infos élève, infos parents, classe souhaitée)
3. Une page "Fiche élève" est créée avec onglets (Informations, Parents, Affectations, Historique)
4. Une page "Admission" est créée avec liste des inscriptions en attente et bouton de validation
5. Une page "Affectation à classe" est créée avec sélection de classe et vérification d'effectif
6. Les workflows sont guidés avec indicateurs de progression et messages de confirmation
7. Les erreurs sont affichées clairement (classe pleine, impayés, etc.)
8. L'interface est responsive et fonctionne sur desktop et tablette
9. Des tests de composants vérifient le rendu et les interactions

---

## Epic 3: Evaluations & Attendance

Cet épic implémente le système complet de gestion des évaluations avec support des différents types d'évaluations selon le niveau scolaire (qualitatives pour maternelle, numériques avec coefficients pour primaire/secondaire), calculs automatiques de moyennes, validation des notes, et gestion des rattrapages. Il inclut également la prise de présence quotidienne avec statistiques d'absentéisme. À la fin de cet épic, un établissement peut gérer complètement les évaluations et présences de ses élèves, remplaçant les méthodes manuelles (Excel pour notes, papier pour présences).

### Story 3.1: Academic Periods Management

As a **directeur ou admin**,
I want **créer et gérer les périodes académiques (3 trimestres par défaut)**,
so that **je peux organiser les évaluations par période**.

#### Acceptance Criteria

1. Une table `périodes` est créée avec colonnes : id (UUID), nom (VARCHAR), date_début (DATE), date_fin (DATE), année_scolaire_id (UUID FK), établissement_id (UUID FK)
2. Un endpoint POST `/api/périodes` est créé pour créer une période avec validation des dates
3. Le système vérifie que les périodes ne se chevauchent pas
4. Par défaut, 3 trimestres sont créés automatiquement lors de la création d'une année scolaire
5. Un endpoint GET `/api/périodes` est créé pour lister les périodes avec filtres
6. Des tests vérifient la création et la validation des chevauchements

### Story 3.2: Subjects Management

As a **directeur ou admin**,
I want **créer et gérer les matières avec catalogue suggéré par niveau**,
so that **je peux configurer les matières enseignées dans mon établissement**.

#### Acceptance Criteria

1. Une table `matières` est créée avec colonnes : id (UUID), nom (VARCHAR), niveau (VARCHAR), coefficient (DECIMAL), établissement_id (UUID FK)
2. Un catalogue de matières suggérées par niveau est pré-rempli (maternelle, primaire, secondaire)
3. Un endpoint POST `/api/matières` est créé pour créer une matière personnalisée
4. Un endpoint GET `/api/matières` est créé pour lister les matières avec filtres par niveau
5. Les coefficients sont configurables par matière (essentiel pour secondaire)
6. Des tests vérifient la création et la gestion des matières

### Story 3.3: Grade Entry for Numerical Evaluations

As a **enseignant**,
I want **saisir des notes numériques par matière pour mes élèves**,
so that **je peux enregistrer les évaluations dans le système**.

#### Acceptance Criteria

1. Une table `notes` est créée avec colonnes : id (UUID), élève_id (UUID FK), matière_id (UUID FK), période_id (UUID FK), note (DECIMAL), note_max (DECIMAL), coefficient (DECIMAL), validée (BOOLEAN), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Un endpoint POST `/api/notes` est créé pour saisir une note avec validation (note entre 0 et note_max)
3. Le système vérifie que l'élève est dans la classe, que la matière est enseignée, et que l'enseignant est affecté
4. Un endpoint GET `/api/classes/:id/notes` est créé pour voir toutes les notes d'une classe par matière
5. Un endpoint GET `/api/élèves/:id/notes` est créé pour voir toutes les notes d'un élève
6. Des tests vérifient la saisie et la validation des notes

### Story 3.4: Qualitative Evaluations for Kindergarten

As a **enseignant maternelle**,
I want **saisir des évaluations qualitatives (acquis, en cours, non acquis)**,
so that **je peux évaluer les compétences des élèves de maternelle**.

#### Acceptance Criteria

1. Une table `évaluations_qualitatives` est créée avec colonnes : id (UUID), élève_id (UUID FK), domaine (VARCHAR), valeur (ENUM: acquis/en_cours/non_acquis), période_id (UUID FK), établissement_id (UUID FK)
2. Un endpoint POST `/api/évaluations-qualitatives` est créé pour saisir une évaluation qualitative
3. Le système détecte automatiquement le type d'établissement (maternelle) et propose le mode qualitatif
4. Des domaines d'apprentissage prédéfinis sont disponibles pour la maternelle
5. Un endpoint GET `/api/élèves/:id/évaluations-qualitatives` est créé pour voir les évaluations d'un élève
6. Des tests vérifient la saisie et la gestion des évaluations qualitatives

### Story 3.5: Average Calculation with Coefficients

As a **système**,
I want **calculer automatiquement les moyennes par matière et la moyenne générale avec coefficients**,
so that **les bulletins affichent des moyennes précises**.

#### Acceptance Criteria

1. Un endpoint POST `/api/notes/:id/validation` est créé pour valider une note (bloque les modifications après validation)
2. Après validation, le système calcule automatiquement la moyenne par matière : (somme des notes × coefficients) / somme des coefficients
3. Le système calcule la moyenne générale : (somme des moyennes × coefficients) / somme des coefficients
4. Une table `moyennes` stocke les moyennes calculées par élève, matière, période
5. Un endpoint GET `/api/élèves/:id/moyennes` est créé pour voir les moyennes d'un élève
6. Des tests unitaires vérifient la précision des calculs avec différents coefficients
7. Les notes ne peuvent plus être modifiées après validation (blocage au niveau API)

### Story 3.6: Missing Grade Management

As a **enseignant**,
I want **gérer les absences de note avec 3 options (zéro, exclure de moyenne, programmer rattrapage)**,
so that **je peux gérer les cas où un élève n'a pas de note**.

#### Acceptance Criteria

1. Lors de la saisie de notes, le système identifie les élèves sans note pour une matière
2. Un endpoint POST `/api/notes/absence` est créé pour gérer l'absence de note avec choix : donner zéro, exclure de moyenne, ou programmer rattrapage
3. Si "donner zéro" est choisi, une note de 0 est automatiquement créée
4. Si "exclure de moyenne" est choisi, l'élève n'est pas compté dans le calcul de moyenne pour cette matière
5. Si "programmer rattrapage" est choisi, une évaluation de rattrapage est créée avec date limite
6. Des tests vérifient les trois options et leur impact sur les moyennes

### Story 3.7: Makeup Evaluations

As a **enseignant**,
I want **programmer et saisir des notes de rattrapage**,
so that **les élèves absents peuvent rattraper leurs évaluations**.

#### Acceptance Criteria

1. Une table `évaluations_rattrapage` est créée avec colonnes : id (UUID), note_originale_id (UUID FK), date_limite (DATE), note_rattrapage (DECIMAL nullable), établissement_id (UUID FK)
2. Un endpoint POST `/api/notes/:id/rattrapage` est créé pour programmer un rattrapage avec date limite
3. Un endpoint POST `/api/rattrapages/:id/note` est créé pour saisir la note de rattrapage
4. Si la note de rattrapage est meilleure que l'originale, elle remplace l'originale dans le calcul
5. Le système recalcule automatiquement les moyennes après saisie du rattrapage
6. Des tests vérifient le remplacement et le recalcul

### Story 3.8: Simple Report Card Generation

As a **enseignant ou secrétaire**,
I want **générer un bulletin simplifié avec les notes et moyennes**,
so that **je peux fournir un bulletin aux parents**.

#### Acceptance Criteria

1. Un endpoint GET `/api/élèves/:id/bulletin/:période_id` est créé pour générer un bulletin
2. Le bulletin affiche les notes par matière avec coefficients et moyennes
3. Pour la maternelle, le bulletin affiche les évaluations qualitatives par domaine
4. Le format est texte simple ou HTML pour MVP (PDF reporté en Phase 2)
5. Des tests vérifient la génération et le format du bulletin

### Story 3.9: Daily Attendance Taking

As a **enseignant**,
I want **prendre la présence quotidienne de ma classe**,
so that **je peux suivre l'assiduité des élèves**.

#### Acceptance Criteria

1. Une table `présences` est créée avec colonnes : id (UUID), élève_id (UUID FK), classe_id (UUID FK), date (DATE), présent (BOOLEAN), établissement_id (UUID FK)
2. Un endpoint POST `/api/présences` est créé pour enregistrer les présences d'une classe pour une date
3. Le système vérifie qu'une présence n'est prise qu'une fois par jour pour une classe
4. Un endpoint GET `/api/classes/:id/présences/:date` est créé pour voir les présences d'une classe à une date
5. Un endpoint GET `/api/classes/:id/absents/:date` est créé pour voir la liste des absents
6. Des tests vérifient la prise de présence et la détection des doublons

### Story 3.10: Basic Attendance Statistics

As a **directeur ou enseignant**,
I want **voir des statistiques d'absentéisme basiques**,
so that **je peux identifier les élèves avec problèmes d'assiduité**.

#### Acceptance Criteria

1. Un endpoint GET `/api/élèves/:id/statistiques-présence` est créé pour voir les stats d'un élève (nombre de présences/absences, taux)
2. Un endpoint GET `/api/classes/:id/statistiques-présence` est créé pour voir les stats d'une classe
3. Les statistiques sont calculées par période avec pourcentages
4. Des tests vérifient le calcul des statistiques

### Story 3.11: Frontend for Evaluations and Attendance

As a **enseignant**,
I want **une interface web pour saisir les notes et prendre les présences**,
so that **je peux utiliser le système facilement**.

#### Acceptance Criteria

1. Une page "Saisie de notes" est créée avec sélection classe/matière/période et tableau de saisie
2. Une page "Prise de présence" est créée avec sélection classe/date et liste des élèves avec cases à cocher
3. Une page "Bulletins" est créée avec génération et affichage des bulletins
4. Les interfaces sont optimisées pour saisie rapide (raccourcis clavier, validation automatique)
5. Des tests de composants vérifient le rendu et les interactions

---

## Epic 4: Complete Financial Management

Cet épic met en place toute la gestion financière du système avec configuration flexible des frais scolaires (entièrement configurables, pas de types prédéfinis), génération automatique et manuelle de factures selon les échéances configurées, enregistrement des paiements avec gestion des crédits et soldes, et rapports financiers de base. À la fin de cet épic, un établissement peut gérer complètement sa partie financière : configuration des frais, facturation automatique, suivi des paiements et impayés, remplaçant les méthodes manuelles (cahiers, Excel).

### Story 4.1: Flexible Fee Configuration

As a **comptable ou directeur**,
I want **créer et configurer des types de frais scolaires entièrement personnalisables**,
so that **je peux adapter les frais à la réalité de mon établissement**.

#### Acceptance Criteria

1. Une table `types_frais` est créée avec colonnes : id (UUID), nom (VARCHAR), description (TEXT), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Un endpoint POST `/api/types-frais` est créé pour créer un type de frais (pas de types prédéfinis)
3. Un endpoint GET `/api/types-frais` est créé pour lister les types de frais
4. Un endpoint PUT `/api/types-frais/:id` est créé pour modifier un type de frais
5. Des tests vérifient le CRUD des types de frais avec isolation multi-tenant

### Story 4.2: Fee Amounts Configuration by Level/Class

As a **comptable ou directeur**,
I want **configurer les montants de frais par niveau/classe avec échéances**,
so that **je peux définir des tarifs différenciés selon les niveaux**.

#### Acceptance Criteria

1. Une table `montants_frais` est créée avec colonnes : id (UUID), type_frais_id (UUID FK), niveau_id (UUID FK nullable), classe_id (UUID FK nullable), élève_id (UUID FK nullable), montant (DECIMAL), échéance (ENUM: mensuel/trimestriel/annuel), établissement_id (UUID FK)
2. Un endpoint POST `/api/montants-frais` est créé pour configurer un montant avec priorité : élève > classe > niveau > défaut
3. La validation vérifie que le montant est > 0 et que l'échéance est valide
4. Un endpoint GET `/api/montants-frais` est créé pour voir les configurations avec filtres
5. Des tests vérifient la configuration et la priorité des montants

### Story 4.3: Automatic Invoice Generation

As a **système**,
I want **générer automatiquement des factures selon les échéances configurées**,
so that **les factures sont créées sans intervention manuelle**.

#### Acceptance Criteria

1. Une table `factures` est créée avec colonnes : id (UUID), élève_id (UUID FK), type_frais_id (UUID FK), montant (DECIMAL), date_émission (DATE), date_échéance (DATE), statut (ENUM: émise/payée/partiellement_payée/impayée), période (VARCHAR), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Un job/tâche planifiée est créée qui s'exécute quotidiennement pour générer les factures selon échéances
3. Le système parcourt les élèves actifs (statut "admis" et affectés) et génère les factures selon les échéances
4. Le système évite la regénération de factures existantes pour la même période
5. Un endpoint POST `/api/factures/génération-automatique` est créé pour déclencher manuellement la génération
6. Des tests vérifient la génération automatique et l'évitement des doublons

### Story 4.4: Manual Invoice Generation

As a **comptable**,
I want **générer manuellement des factures à tout moment**,
so that **je peux créer des factures personnalisées ou urgentes**.

#### Acceptance Criteria

1. Un endpoint POST `/api/factures` est créé pour générer une facture manuelle avec validation des données
2. Le système vérifie les doublons avant création
3. Un endpoint GET `/api/factures` est créé pour lister les factures avec filtres (élève, statut, période)
4. Un endpoint GET `/api/factures/:id` est créé pour voir les détails d'une facture
5. Des tests vérifient la génération manuelle et la détection des doublons

### Story 4.5: Invoice Status Management

As a **système**,
I want **gérer les statuts de facture (émise, payée, partiellement payée, impayée) automatiquement**,
so that **le suivi des factures est précis et à jour**.

#### Acceptance Criteria

1. Le statut "émise" est défini lors de la création de la facture
2. Le statut "impayée" est automatiquement défini si la date d'échéance est dépassée et le solde > 0
3. Le statut "partiellement payée" est défini si des paiements partiels ont été enregistrés
4. Le statut "payée" est défini quand le montant total est payé
5. Un endpoint PUT `/api/factures/:id` permet de modifier une facture si statut "émise"
6. Des tests vérifient la gestion automatique des statuts

### Story 4.6: Payment Recording

As a **comptable**,
I want **enregistrer un paiement (montant, date, mode) et l'associer à des factures**,
so that **je peux suivre les paiements des élèves**.

#### Acceptance Criteria

1. Une table `paiements` est créée avec colonnes : id (UUID), élève_id (UUID FK), montant (DECIMAL), date (DATE), mode (ENUM: espèces), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Une table `paiements_factures` (many-to-many) lie les paiements aux factures avec montant_affecté
3. Un endpoint POST `/api/paiements` est créé pour enregistrer un paiement avec sélection des factures à payer
4. Le système vérifie que le montant ne dépasse pas le solde dû (sauf création crédit)
5. Le système met à jour automatiquement les statuts des factures après paiement
6. Un endpoint GET `/api/paiements` est créé pour lister les paiements avec filtres
7. Des tests vérifient l'enregistrement et la mise à jour des statuts

### Story 4.7: Partial Payment Support

As a **comptable**,
I want **enregistrer des paiements partiels pour une facture**,
so that **je peux gérer les paiements échelonnés**.

#### Acceptance Criteria

1. Le système permet plusieurs paiements pour une même facture
2. Le solde restant de la facture est calculé automatiquement (montant - somme des paiements)
3. Le statut de la facture reste "partiellement payée" jusqu'à paiement complet
4. Un endpoint GET `/api/factures/:id/solde` est créé pour voir le solde restant
5. Des tests vérifient les paiements partiels et le calcul des soldes

### Story 4.8: Credit Management for Advance Payments

As a **comptable**,
I want **gérer les crédits (paiements en avance) et les appliquer aux factures futures**,
so that **je peux gérer les paiements anticipés**.

#### Acceptance Criteria

1. Une table `crédits` est créée avec colonnes : id (UUID), élève_id (UUID FK), montant (DECIMAL), solde_restant (DECIMAL), établissement_id (UUID FK), créé_le (TIMESTAMP)
2. Si un paiement > solde dû, un crédit est automatiquement créé
3. Si un paiement est pour une période future, la facture correspondante est générée et marquée "Payée à l'avance"
4. Un endpoint GET `/api/élèves/:id/crédits` est créé pour voir les crédits d'un élève
5. Le système applique automatiquement les crédits aux nouvelles factures
6. Des tests vérifient la création et l'application des crédits

### Story 4.9: Balance Calculation and Outstanding List

As a **comptable ou directeur**,
I want **voir les soldes par élève et la liste des impayés**,
so that **je peux suivre la situation financière**.

#### Acceptance Criteria

1. Un endpoint GET `/api/élèves/:id/solde` est créé pour voir le solde d'un élève (somme des factures - somme des paiements)
2. Un endpoint GET `/api/factures/impayées` est créé pour voir la liste des factures impayées avec filtres
3. Le calcul du solde inclut les crédits (solde peut être négatif si créditeur)
4. Des tests vérifient la précision des calculs de soldes

### Story 4.10: Basic Receipt Generation

As a **comptable**,
I want **générer un reçu basique pour un paiement**,
so that **je peux fournir une preuve de paiement**.

#### Acceptance Criteria

1. Un endpoint GET `/api/paiements/:id/reçu` est créé pour générer un reçu
2. Le reçu affiche les informations du paiement (montant, date, mode, factures payées)
3. Le format est texte simple ou HTML pour MVP (PDF reporté en Phase 2)
4. Des tests vérifient la génération du reçu

### Story 4.11: Basic Financial Reports

As a **comptable ou directeur**,
I want **voir des rapports de recettes et statistiques financières basiques**,
so that **je peux analyser la situation financière**.

#### Acceptance Criteria

1. Un endpoint GET `/api/rapports/recettes` est créé pour voir les recettes avec filtres (période, type de frais)
2. Un endpoint GET `/api/rapports/statistiques` est créé pour voir les stats financières (taux de paiement, montant total facturé, montant total payé)
3. Les rapports sont calculés par période avec agrégations
4. Des tests vérifient le calcul des rapports

### Story 4.12: Frontend for Financial Management

As a **comptable**,
I want **une interface web pour gérer la facturation et les paiements**,
so that **je peux utiliser le système facilement**.

#### Acceptance Criteria

1. Une page "Configuration des frais" est créée pour gérer types et montants de frais
2. Une page "Factures" est créée avec liste, filtres, et génération manuelle
3. Une page "Paiements" est créée avec formulaire d'enregistrement et sélection de factures
4. Une page "Rapports financiers" est créée avec visualisation des recettes et statistiques
5. Des tests de composants vérifient le rendu et les interactions

---

## Epic 5: Dashboards & Reporting

Cet épic fournit des tableaux de bord avec statistiques clés adaptées par rôle utilisateur et permet l'export des données principales au format Excel. À la fin de cet épic, chaque rôle (Directeur, Admin, Secrétaire, Comptable, Enseignant) a accès à un tableau de bord personnalisé avec les informations pertinentes, et les exports Excel permettent de travailler avec les données hors ligne.

### Story 5.1: Role-Based Dashboard Data

As a **utilisateur**,
I want **voir un tableau de bord avec statistiques adaptées à mon rôle**,
so that **j'ai une vue d'ensemble de ce qui m'intéresse**.

#### Acceptance Criteria

1. Un endpoint GET `/api/dashboard` est créé qui retourne des données différentes selon le rôle
2. Pour Directeur/Admin : statistiques globales (nombre élèves total/par classe/par niveau, nombre classes, recettes période, taux paiement, alertes)
3. Pour Enseignant : statistiques de ses classes (nombre élèves, présences récentes, notes à saisir)
4. Pour Comptable : statistiques financières (recettes, impayés, factures à générer)
5. Pour Secrétaire : statistiques académiques (inscriptions en attente, admissions à valider)
6. Des tests vérifient que chaque rôle reçoit les bonnes données

### Story 5.2: Dashboard Alerts System

As a **directeur**,
I want **voir des alertes (impayés, absences importantes)**,
so that **je peux identifier rapidement les problèmes**.

#### Acceptance Criteria

1. Un endpoint GET `/api/dashboard/alertes` est créé pour récupérer les alertes
2. Les alertes incluent : factures impayées avec échéance dépassée, élèves avec absentéisme élevé, inscriptions en attente depuis longtemps
3. Les alertes sont triées par priorité (critique, important, info)
4. Des tests vérifient la génération des alertes

### Story 5.3: Excel Export for Students List

As a **secrétaire**,
I want **exporter la liste des élèves au format Excel**,
so that **je peux travailler avec les données hors ligne**.

#### Acceptance Criteria

1. Un endpoint GET `/api/export/élèves` est créé qui génère un fichier Excel
2. Le fichier inclut : nom, prénom, date naissance, classe, statut, numéro élève
3. Les filtres appliqués à la liste sont respectés dans l'export
4. Le fichier est téléchargeable via le frontend
5. Des tests vérifient la génération et le format du fichier Excel

### Story 5.4: Excel Export for Payments List

As a **comptable**,
I want **exporter la liste des paiements au format Excel**,
so that **je peux faire des analyses financières hors ligne**.

#### Acceptance Criteria

1. Un endpoint GET `/api/export/paiements` est créé qui génère un fichier Excel
2. Le fichier inclut : date, élève, montant, mode, factures payées, période
3. Les filtres (période, élève) sont respectés dans l'export
4. Le fichier est téléchargeable via le frontend
5. Des tests vérifient la génération et le format du fichier Excel

### Story 5.5: Excel Export for Invoices List

As a **comptable**,
I want **exporter la liste des factures au format Excel**,
so that **je peux faire des rapports financiers hors ligne**.

#### Acceptance Criteria

1. Un endpoint GET `/api/export/factures` est créé qui génère un fichier Excel
2. Le fichier inclut : numéro, élève, type frais, montant, date émission, date échéance, statut, solde
3. Les filtres (statut, période, élève) sont respectés dans l'export
4. Le fichier est téléchargeable via le frontend
5. Des tests vérifient la génération et le format du fichier Excel

### Story 5.6: Frontend Dashboard Implementation

As a **utilisateur**,
I want **voir mon tableau de bord avec statistiques et alertes dans l'interface web**,
so that **j'ai une vue d'ensemble claire dès la connexion**.

#### Acceptance Criteria

1. Une page "Tableau de bord" est créée avec widgets de statistiques selon le rôle
2. Les alertes sont affichées en haut avec codes couleur (rouge critique, orange important)
3. Des graphiques simples sont affichés pour les statistiques (barres, lignes) - bibliothèque de graphiques intégrée
4. La page est responsive et s'adapte aux différentes tailles d'écran
5. Des tests de composants vérifient le rendu et l'adaptation par rôle

### Story 5.7: Frontend Export Functionality

As a **utilisateur**,
I want **exporter des données depuis l'interface web**,
so that **je peux télécharger les fichiers Excel facilement**.

#### Acceptance Criteria

1. Des boutons "Exporter Excel" sont ajoutés aux pages de listes (élèves, paiements, factures)
2. Un indicateur de chargement est affiché pendant la génération du fichier
3. Le fichier est téléchargé automatiquement après génération
4. Des messages d'erreur sont affichés si l'export échoue
5. Des tests vérifient le téléchargement et la gestion des erreurs

---

## Checklist Results Report

### Executive Summary

**Overall PRD Completeness:** 92%

**MVP Scope Appropriateness:** Just Right - Le scope est bien défini avec 13 modules essentiels, les fonctionnalités "Souhaitable" et "Phase 2" sont clairement identifiées et exclues du MVP.

**Readiness for Architecture Phase:** Ready - Le PRD est complet avec exigences fonctionnelles et non fonctionnelles détaillées, épics et stories bien structurés, et guidance technique fournie.

**Most Critical Gaps or Concerns:**
- Absence de métriques de succès quantifiables spécifiques
- Pas de plan de validation MVP explicite avec critères de succès
- Certaines exigences de performance pourraient être plus spécifiques (temps de réponse cibles)

### Category Analysis Table

| Category                         | Status | Critical Issues |
| -------------------------------- | ------ | --------------- |
| 1. Problem Definition & Context  | PASS   | Métriques de succès quantifiables manquantes |
| 2. MVP Scope Definition          | PASS   | Plan de validation MVP à préciser |
| 3. User Experience Requirements  | PASS   | Aucun problème critique |
| 4. Functional Requirements       | PASS   | Aucun problème critique |
| 5. Non-Functional Requirements   | PARTIAL| Exigences de performance à quantifier |
| 6. Epic & Story Structure        | PASS   | Aucun problème critique |
| 7. Technical Guidance            | PASS   | Aucun problème critique |
| 8. Cross-Functional Requirements | PARTIAL| Intégrations externes non spécifiées |
| 9. Clarity & Communication       | PASS   | Aucun problème critique |

### Detailed Category Analysis

#### 1. Problem Definition & Context - PASS (90%)

**Strengths:**
- ✅ Problème clairement articulé (méthodes manuelles, manque de centralisation)
- ✅ Public cible spécifique (établissements scolaires en Afrique)
- ✅ Contexte business bien documenté (Background Context)
- ✅ Différenciation des solutions existantes mentionnée

**Gaps:**
- ⚠️ Métriques de succès quantifiables manquantes (ex: réduction de X% du temps de gestion, augmentation de Y% du taux de paiement)
- ⚠️ Impact quantifié du problème non spécifié (ex: nombre d'heures perdues, erreurs financières)
- ⚠️ Pas de recherche utilisateur documentée (bien que le document de synthèse MVP suggère une session de brainstorming)

**Recommendations:**
- Ajouter des métriques de succès mesurables (KPIs) dans la section Goals
- Quantifier l'impact actuel du problème si possible
- Documenter les insights de la session de brainstorming comme recherche utilisateur

#### 2. MVP Scope Definition - PASS (95%)

**Strengths:**
- ✅ Fonctionnalités essentielles clairement distinguées (13 modules MVP)
- ✅ Ce qui est hors scope est documenté ("À reporter" dans la synthèse MVP)
- ✅ Rationale pour les décisions de scope (adaptation aux réalités africaines, MVP focus)
- ✅ Chaque épic lie les fonctionnalités aux besoins utilisateurs

**Gaps:**
- ⚠️ Plan de validation MVP non explicite (comment tester le succès du MVP ?)
- ⚠️ Critères pour passer au-delà du MVP non spécifiés
- ⚠️ Mécanismes de feedback utilisateur initiaux non planifiés

**Recommendations:**
- Ajouter une section "MVP Validation Approach" avec critères de succès
- Définir les mécanismes de collecte de feedback utilisateur
- Spécifier les critères pour décider de passer à la Phase 2

#### 3. User Experience Requirements - PASS (92%)

**Strengths:**
- ✅ User journeys documentés (workflows d'inscription → admission → affectation)
- ✅ 16 écrans critiques identifiés dans UI Design Goals
- ✅ Accessibilité spécifiée (WCAG AA)
- ✅ Plateformes cibles définies (Web Responsive)
- ✅ Paradigmes d'interaction documentés

**Gaps:**
- ⚠️ Certains cas limites pourraient être mieux documentés (ex: que faire si connexion lente échoue ?)
- ⚠️ Gestion des erreurs détaillée au niveau UX non spécifiée pour tous les workflows

**Recommendations:**
- Documenter les cas limites et la gestion d'erreurs pour les workflows critiques
- Ajouter des spécifications de performance UX (ex: temps de chargement acceptable)

#### 4. Functional Requirements - PASS (98%)

**Strengths:**
- ✅ 42 exigences fonctionnelles bien structurées et testables
- ✅ Format cohérent (FR1-FR42)
- ✅ Focus sur WHAT pas HOW
- ✅ Terminologie cohérente
- ✅ Dependencies identifiées dans les épics

**Gaps:**
- Aucun gap critique identifié

**Recommendations:**
- Continuer à maintenir cette qualité dans les futures itérations

#### 5. Non-Functional Requirements - PARTIAL (75%)

**Strengths:**
- ✅ 26 exigences non fonctionnelles bien documentées
- ✅ Sécurité très bien couverte (chiffrement, authentification, RBAC, audit)
- ✅ Conformité RGPD documentée
- ✅ Architecture multi-tenant détaillée

**Gaps:**
- ⚠️ Exigences de performance non quantifiées (ex: temps de réponse API < X ms, throughput Y req/s)
- ⚠️ Besoins de scalabilité non spécifiés (nombre d'établissements simultanés, nombre d'utilisateurs)
- ⚠️ Contraintes de ressources non définies (CPU, mémoire, stockage)

**Recommendations:**
- Ajouter des métriques de performance quantifiables (ex: API response time < 500ms pour 95% des requêtes)
- Spécifier les besoins de scalabilité (ex: support de 100 établissements, 1000 utilisateurs simultanés)
- Définir les contraintes de ressources pour le MVP

#### 6. Epic & Story Structure - PASS (95%)

**Strengths:**
- ✅ 5 épics bien structurés avec séquence logique
- ✅ 47 stories détaillées avec critères d'acceptation
- ✅ Stories de taille appropriée (2-4h de développement)
- ✅ Premier épic inclut setup infrastructure
- ✅ Stories verticales (backend + règles métier + tests)

**Gaps:**
- ⚠️ Certaines stories pourraient bénéficier de critères de testabilité locale plus explicites (ex: tests CLI pour backend)

**Recommendations:**
- Ajouter des critères de testabilité locale pour les stories backend/data quand pertinent
- Vérifier que toutes les stories peuvent être testées indépendamment

#### 7. Technical Guidance - PASS (90%)

**Strengths:**
- ✅ Stack technique documenté avec alternatives (Node.js/Python, React/Vue.js)
- ✅ Architecture décidée (Monolith) avec justification
- ✅ Contraintes techniques clairement communiquées
- ✅ Multi-tenant implementation détaillée
- ✅ Sécurité et conformité bien couvertes

**Gaps:**
- ⚠️ Certaines zones de complexité technique pourraient être mieux flaggées (ex: calculs financiers, génération automatique de factures)

**Recommendations:**
- Identifier explicitement les zones de haute complexité technique pour investigation architecturale approfondie
- Documenter les risques techniques identifiés

#### 8. Cross-Functional Requirements - PARTIAL (70%)

**Strengths:**
- ✅ Entités de données identifiées (tables documentées dans les stories)
- ✅ Relations de données définies (FK, contraintes d'intégrité)
- ✅ Politiques de rétention documentées (factures 10 ans, logs 1 an)
- ✅ Exports de données spécifiés

**Gaps:**
- ⚠️ Intégrations externes non spécifiées (ex: service d'email pour réinitialisation mot de passe, service de stockage pour logos/photos)
- ⚠️ Formats d'échange de données pour intégrations futures non définis
- ⚠️ Besoins de migration de données non adressés (si migration depuis systèmes existants)

**Recommendations:**
- Identifier les services externes nécessaires (email, stockage fichiers)
- Documenter les formats d'échange de données pour intégrations futures
- Prévoir une section sur la migration de données si applicable

#### 9. Clarity & Communication - PASS (95%)

**Strengths:**
- ✅ Document bien structuré et organisé
- ✅ Langage clair et cohérent
- ✅ Termes techniques définis où nécessaire
- ✅ Change log inclus
- ✅ Versioning documenté

**Gaps:**
- ⚠️ Diagrammes/visuels pourraient améliorer la compréhension (ex: diagramme de workflow, architecture multi-tenant)

**Recommendations:**
- Considérer l'ajout de diagrammes pour workflows complexes et architecture
- Maintenir la qualité de documentation dans les futures versions

### Top Issues by Priority

#### BLOCKERS: Must fix before architect can proceed
- Aucun blocker identifié - Le PRD est prêt pour la phase architecture

#### HIGH: Should fix for quality
1. **Métriques de succès quantifiables** - Ajouter des KPIs mesurables dans la section Goals
2. **Exigences de performance quantifiées** - Spécifier les temps de réponse cibles et besoins de scalabilité
3. **Plan de validation MVP** - Définir comment tester le succès du MVP avec critères mesurables

#### MEDIUM: Would improve clarity
1. **Intégrations externes** - Identifier et documenter les services externes nécessaires (email, stockage)
2. **Cas limites UX** - Documenter la gestion d'erreurs et cas limites pour workflows critiques
3. **Diagrammes** - Ajouter des diagrammes pour workflows complexes et architecture

#### LOW: Nice to have
1. **Recherche utilisateur** - Documenter les insights de la session de brainstorming
2. **Migration de données** - Prévoir une section si migration depuis systèmes existants

### MVP Scope Assessment

**Features Appropriateness:**
- ✅ Scope MVP bien défini avec 13 modules essentiels
- ✅ Fonctionnalités "Souhaitable" et "Phase 2" clairement exclues
- ✅ Chaque fonctionnalité MVP adresse directement le problème défini

**Potential Cuts for True MVP (if timeline pressure):**
- Story 3.8 (Bulletins) pourrait être simplifiée encore plus (juste liste de notes, pas de génération)
- Story 5.2 (Dashboard Alerts) pourrait être reportée si nécessaire
- Certaines fonctionnalités de rapports financiers avancés pourraient être réduites

**Missing Essential Features:**
- Aucune fonctionnalité essentielle manquante identifiée

**Complexity Concerns:**
- ⚠️ Architecture multi-tenant : Complexité élevée mais bien documentée
- ⚠️ Calculs financiers : Nécessite précision absolue, bien couvert dans les stories
- ⚠️ Génération automatique de factures : Job planifié, nécessite robustesse

**Timeline Realism:**
- 5 épics avec 47 stories = ~94-188 heures de développement (estimation 2-4h par story)
- Réaliste pour une équipe de 2-3 développeurs sur 3-4 mois (MVP)

### Technical Readiness

**Clarity of Technical Constraints:**
- ✅ Contraintes techniques clairement documentées
- ✅ Alternatives techniques présentées avec justifications
- ✅ Architecture décidée (Monolith) avec rationale

**Identified Technical Risks:**
1. **Multi-tenant isolation** - Risque élevé si mal implémenté, mais bien documenté
2. **Calculs financiers** - Nécessite précision absolue, bien couvert dans les tests
3. **Génération automatique de factures** - Job planifié nécessite robustesse et gestion d'erreurs
4. **Performance avec multi-tenant** - Index composites nécessaires, bien identifiés

**Areas Needing Architect Investigation:**
1. Optimisation des requêtes multi-tenant avec index composites
2. Stratégie de cache pour améliorer les performances (Redis optionnel mentionné)
3. Gestion des jobs planifiés (génération automatique de factures)
4. Stratégie de stockage pour fichiers (logos, photos élèves)

### Recommendations

**Specific Actions to Address Blockers:**
- Aucun blocker - PRD prêt pour architecture

**Suggested Improvements:**

1. **Ajouter section "Success Metrics"** dans Goals avec KPIs quantifiables :
   - Réduction de X% du temps de gestion administrative
   - Augmentation de Y% du taux de paiement
   - Réduction de Z% des erreurs financières

2. **Quantifier les exigences de performance** :
   - Temps de réponse API < 500ms pour 95% des requêtes
   - Support de 100 établissements simultanés
   - 1000 utilisateurs simultanés

3. **Ajouter section "MVP Validation"** :
   - Critères de succès mesurables
   - Mécanismes de collecte de feedback utilisateur
   - Timeline pour validation MVP

4. **Documenter les intégrations externes** :
   - Service d'email (réinitialisation mot de passe, notifications)
   - Service de stockage fichiers (logos, photos)
   - Service de monitoring (Sentry, LogRocket)

5. **Ajouter diagrammes** :
   - Workflow inscription → admission → affectation
   - Architecture multi-tenant
   - Flux de facturation automatique

**Next Steps:**

1. ✅ PRD est prêt pour la phase architecture
2. Recommandé : Ajouter les améliorations HIGH priority avant de passer à l'architecture
3. L'architecte peut commencer avec le PRD actuel et les améliorations peuvent être ajoutées en parallèle

### Final Decision

**✅ READY FOR ARCHITECT**: Le PRD et les épics sont complets, bien structurés, et prêts pour la conception architecturale. Les améliorations suggérées (métriques de succès, performance quantifiée) peuvent être ajoutées en parallèle sans bloquer le travail de l'architecte.

---

## Next Steps

### UX Expert Prompt

Créer l'architecture UX pour le SaaS de gestion des établissements scolaires en utilisant ce PRD comme référence. Le système doit être adapté aux réalités africaines avec une interface simple et accessible, supportant 5 rôles utilisateurs (Directeur, Admin, Secrétaire, Comptable, Enseignant) avec des besoins différents. Focus sur les workflows critiques : inscription → admission → affectation d'élèves, saisie de notes, et gestion financière. L'interface doit être responsive (desktop/tablette prioritaire) et conforme WCAG AA. Référence : Section "User Interface Design Goals" et les 16 écrans critiques identifiés.

### Architect Prompt

Créer l'architecture technique pour le SaaS de gestion des établissements scolaires en utilisant ce PRD comme référence. Points critiques à adresser : architecture multi-tenant avec isolation stricte des données (base de données partagée avec `établissement_id`), calculs financiers nécessitant précision absolue, génération automatique de factures via jobs planifiés, et performance avec index composites. Stack technique : Monolith avec Node.js/Express ou Python/Django, PostgreSQL, React ou Vue.js. Référence : Section "Technical Assumptions" pour contraintes et choix techniques. Zones nécessitant investigation approfondie : optimisation requêtes multi-tenant, stratégie de cache, gestion des jobs planifiés, stockage fichiers.

---

