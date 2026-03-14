# Epic 5: Dashboards & Reporting

Cet epic fournit des tableaux de bord avec statistiques clés adaptées par rôle utilisateur et permet l’export des données principales au format Excel. À la fin de cet epic, chaque rôle dispose d’un tableau de bord pertinent et peut exporter les listes d’élèves, paiements et factures.

---

## Story 5.1: Role-Based Dashboard Data

As a **utilisateur**,  
I want **voir un tableau de bord avec statistiques adaptées à mon rôle**,  
so that **j’ai une vue d’ensemble de ce qui m’intéresse**.

### Acceptance Criteria

1. Un endpoint GET `/api/dashboard` retourne des données différentes selon le rôle de l’utilisateur (Directeur, Admin, Secrétaire, Comptable, Enseignant).
2. Pour Directeur/Admin : statistiques globales (nombre d’élèves total/par classe/par niveau, nombre de classes, recettes sur la période, taux de paiement, principales alertes).
3. Pour Enseignant : statistiques de ses classes (nombre d’élèves, dernières présences, devoirs/notes à saisir, éventuels retards de saisie).
4. Pour Comptable : statistiques financières (recettes de la période, montants impayés, factures à générer ou en retard).
5. Pour Secrétaire : statistiques académiques (inscriptions en attente, admissions à valider, désinscriptions récentes).
6. Des tests vérifient que chaque rôle reçoit un payload adapté et que les données sont correctement filtrées par `etablissement_id`.

---

## Story 5.2: Dashboard Alerts System

As a **directeur**,  
I want **voir des alertes (impayés, absences importantes)**,  
so that **je peux identifier rapidement les problèmes**.

### Acceptance Criteria

1. Un endpoint GET `/api/dashboard/alertes` retourne une liste d’alertes pour l’établissement.
2. Les types d’alertes incluent : factures impayées avec échéance dépassée, élèves avec absentéisme élevé, inscriptions en attente depuis longtemps.
3. Chaque alerte inclut un niveau de priorité (critique, important, info) et un message clair.
4. Les règles de calcul des alertes (ex : seuil d’absentéisme, délai d’inscription) sont documentées et raisonnablement paramétrables.
5. Des tests vérifient la génération correcte des alertes dans différents scénarios (beaucoup d’impayés, forte absence, etc.).

---

## Story 5.3: Excel Export for Students List

As a **secrétaire**,  
I want **exporter la liste des élèves au format Excel**,  
so that **je peux travailler avec les données hors ligne**.

### Acceptance Criteria

1. Un endpoint GET `/api/export/eleves` génère un fichier Excel contenant la liste des élèves.
2. Le fichier inclut au minimum : nom, prénom, date de naissance, classe actuelle, statut, numéro d’élève.
3. Les filtres appliqués sur la liste des élèves (statut, classe, recherche) sont respectés dans l’export.
4. Le fichier est servi en téléchargement avec un nom explicite (`eleves-YYYY-MM-DD.xlsx`).
5. Des tests vérifient la génération, le contenu et le format minimal du fichier Excel.

---

## Story 5.4: Excel Export for Payments List

As a **comptable**,  
I want **exporter la liste des paiements au format Excel**,  
so that **je peux faire des analyses financières hors ligne**.

### Acceptance Criteria

1. Un endpoint GET `/api/export/paiements` génère un fichier Excel avec la liste des paiements.
2. Le fichier inclut : date, élève, montant, mode, factures payées, période ou référence, et éventuellement l’utilisateur ayant enregistré le paiement.
3. Les filtres appliqués (période, élève, type de frais) sont respectés dans l’export.
4. Le fichier est téléchargeable via le frontend et nommé de manière explicite (`paiements-YYYY-MM-DD.xlsx`).
5. Des tests vérifient la génération, la cohérence des données et le format du fichier Excel.

---

## Story 5.5: Excel Export for Invoices List

As a **comptable**,  
I want **exporter la liste des factures au format Excel**,  
so that **je peux faire des rapports financiers hors ligne**.

### Acceptance Criteria

1. Un endpoint GET `/api/export/factures` génère un fichier Excel contenant la liste des factures.
2. Le fichier inclut : numéro ou identifiant, élève, type de frais, montant, date d’émission, date d’échéance, statut, solde restant.
3. Les filtres appliqués (statut, période, élève, type de frais) sont respectés dans l’export.
4. Le fichier est téléchargeable via le frontend et nommé de manière explicite (`factures-YYYY-MM-DD.xlsx`).
5. Des tests vérifient la génération et le format.

---

## Story 5.6: Frontend Dashboard Implementation

As a **utilisateur**,  
I want **voir mon tableau de bord avec statistiques et alertes dans l’interface web**,  
so that **j’ai une vue d’ensemble claire dès la connexion**.

### Acceptance Criteria

1. Une page “Tableau de bord” est créée dans le frontend, consommant les endpoints `/api/dashboard` et `/api/dashboard/alertes`.
2. Les widgets affichés (cartes, graphiques, tableaux) varient en fonction du rôle connecté (Directeur, Enseignant, Comptable, Secrétaire, Admin).
3. Les alertes sont affichées en haut avec codes couleur (rouge pour critique, orange pour important, neutre pour info).
4. Des graphiques simples (barres, lignes, donuts) présentent les statistiques clés (effectifs, recettes, impayés, absences).
5. La page est responsive et reste lisible sur desktop et tablette.
6. Des tests de composants vérifient le rendu, la logique conditionnelle par rôle et la gestion des erreurs (API injoignable).

---

## Story 5.7: Frontend Export Functionality

As a **utilisateur**,  
I want **exporter des données depuis l’interface web**,  
so that **je peux télécharger les fichiers Excel facilement**.

### Acceptance Criteria

1. Des boutons “Exporter Excel” sont ajoutés aux pages de listes principales (élèves, paiements, factures), et déclenchent les endpoints d’export correspondants.
2. Un indicateur de chargement est affiché pendant la génération du fichier, avec blocage minimal de l’UI.
3. Le fichier est téléchargé automatiquement après génération, avec gestion des erreurs (message clair si échec).
4. Des tests vérifient le déclenchement de l’export, la gestion de l’état de chargement et le download effectif des fichiers.

