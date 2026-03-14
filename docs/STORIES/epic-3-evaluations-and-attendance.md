# Epic 3: Evaluations & Attendance

Cet epic implémente le système complet de gestion des évaluations (qualitatives et numériques) et de la présence quotidienne. À la fin de cet epic, un établissement peut saisir des notes, calculer des moyennes, gérer les rattrapages, générer des bulletins simplifiés et suivre l’absentéisme.

---

## Story 3.1: Academic Periods Management

As a **directeur ou admin**,  
I want **créer et gérer les périodes académiques (3 trimestres par défaut)**,  
so that **je peux organiser les évaluations par période**.

### Acceptance Criteria

1. Une table `periodes` est créée avec colonnes : `id` (UUID), `nom` (VARCHAR), `date_debut` (DATE), `date_fin` (DATE), `annee_scolaire_id` (UUID FK), `etablissement_id` (UUID FK).
2. Un endpoint POST `/api/periodes` permet de créer une période avec validation des dates (date_debut < date_fin).
3. Le système empêche le chevauchement de périodes pour une même année scolaire (validation applicative).
4. Par défaut, 3 trimestres sont créés automatiquement lors de la création d’une année scolaire (configurable).
5. Un endpoint GET `/api/periodes` liste les périodes avec filtres par année scolaire et type.
6. Des tests vérifient la création, la validation des chevauchements et la génération automatique par défaut.

---

## Story 3.2: Subjects Management

As a **directeur ou admin**,  
I want **créer et gérer les matières avec catalogue suggéré par niveau**,  
so that **je peux configurer les matières enseignées dans mon établissement**.

### Acceptance Criteria

1. Une table `matieres` est créée avec colonnes : `id` (UUID), `nom` (VARCHAR), `niveau` (VARCHAR), `coefficient` (DECIMAL), `etablissement_id` (UUID FK).
2. Un catalogue initial de matières suggérées par niveau (maternelle, primaire, secondaire) est proposé et peut être chargé lors de l’initialisation.
3. Un endpoint POST `/api/matieres` permet de créer une matière personnalisée.
4. Un endpoint GET `/api/matieres` liste les matières avec filtres par niveau et recherche par nom.
5. Les coefficients sont configurables par matière et utilisés dans les calculs de moyennes.
6. Des tests vérifient la création, la modification et la suppression (soft delete si nécessaire) des matières.

---

## Story 3.3: Grade Entry for Numerical Evaluations

As a **enseignant**,  
I want **saisir des notes numériques par matière pour mes élèves**,  
so that **je peux enregistrer les évaluations dans le système**.

### Acceptance Criteria

1. Une table `notes` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `matiere_id` (UUID FK), `periode_id` (UUID FK), `note` (DECIMAL), `note_max` (DECIMAL), `coefficient` (DECIMAL), `validee` (BOOLEAN), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Un endpoint POST `/api/notes` permet de saisir une note avec validation (0 ≤ note ≤ note_max, types numériques corrects).
3. Le système vérifie que l’élève est affecté à la classe concernée, que la matière est enseignée dans la classe, et que l’enseignant est autorisé (affectation).
4. Un endpoint GET `/api/classes/:id/notes` retourne toutes les notes d’une classe par matière et période.
5. Un endpoint GET `/api/eleves/:id/notes` retourne les notes d’un élève par matière et période.
6. Des tests vérifient la saisie, les validations, et les autorisations.

---

## Story 3.4: Qualitative Evaluations for Kindergarten

As a **enseignant maternelle**,  
I want **saisir des évaluations qualitatives (acquis, en cours, non acquis)**,  
so that **je peux évaluer les compétences des élèves de maternelle**.

### Acceptance Criteria

1. Une table `evaluations_qualitatives` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `domaine` (VARCHAR), `valeur` (ENUM: acquis/en_cours/non_acquis), `periode_id` (UUID FK), `etablissement_id` (UUID FK).
2. Un endpoint POST `/api/evaluations-qualitatives` permet de saisir une évaluation qualitative.
3. Le système détecte automatiquement le type d’établissement (maternelle) pour proposer le mode qualitatif par défaut.
4. Des domaines d’apprentissage prédéfinis (motricité, langage, socialisation, etc.) sont disponibles et configurables.
5. Un endpoint GET `/api/eleves/:id/evaluations-qualitatives` retourne les évaluations qualitatives d’un élève.
6. Des tests vérifient la saisie, la liste et les validations.

---

## Story 3.5: Average Calculation with Coefficients

As a **système**,  
I want **calculer automatiquement les moyennes par matière et la moyenne générale avec coefficients**,  
so that **les bulletins affichent des moyennes précises**.

### Acceptance Criteria

1. Un endpoint POST `/api/notes/:id/validation` permet de valider une note ; après validation, elle ne peut plus être modifiée.
2. Après validation des notes, le système calcule automatiquement la moyenne par matière pour chaque élève : \((\sum (note \times coefficient)) / \sum(coefficient)\).
3. Le système calcule la moyenne générale par élève pour la période : \((\sum (moyenne_matiere \times coefficient_matiere)) / \sum(coefficient_matiere)\).
4. Une table `moyennes` stocke les moyennes par élève, matière et période (et éventuellement la moyenne générale).
5. Un endpoint GET `/api/eleves/:id/moyennes` retourne les moyennes d’un élève par matière et la moyenne générale.
6. Des tests unitaires vérifient la précision des calculs avec différents coefficients et cas limites (notes manquantes, coefficients nuls interdits).
7. Les notes validées sont protégées de toute modification ultérieure (contrôle au niveau API et éventuellement base).

---

## Story 3.6: Missing Grade Management

As a **enseignant**,  
I want **gérer les absences de note avec 3 options (zéro, exclure de moyenne, programmer rattrapage)**,  
so that **je peux gérer les cas où un élève n’a pas de note**.

### Acceptance Criteria

1. Lors de la saisie ou de la revue des notes, le système identifie les élèves sans note pour une matière donnée.
2. Un endpoint POST `/api/notes/absence` permet de gérer l’absence de note pour un élève/matière/période avec un champ `strategie` : `zero`, `exclure_moyenne`, `rattrapage`.
3. Si `zero` est choisi, une note de 0 est créée et prise en compte dans les calculs.
4. Si `exclure_moyenne` est choisi, l’élève est exclu du calcul de moyenne pour cette matière (la moyenne est calculée sur les notes existantes).
5. Si `rattrapage` est choisi, une évaluation de rattrapage est programmée (cf. Story 3.7).
6. Des tests vérifient que chaque option a l’effet attendu sur les calculs de moyennes et sur l’affichage des bulletins.

---

## Story 3.7: Makeup Evaluations

As a **enseignant**,  
I want **programmer et saisir des notes de rattrapage**,  
so that **les élèves absents peuvent rattraper leurs évaluations**.

### Acceptance Criteria

1. Une table `evaluations_rattrapage` est créée avec colonnes : `id` (UUID), `note_originale_id` (UUID FK), `date_limite` (DATE), `note_rattrapage` (DECIMAL nullable), `etablissement_id` (UUID FK).
2. Un endpoint POST `/api/notes/:id/rattrapage` permet de programmer un rattrapage pour une note donnée avec une `date_limite`.
3. Un endpoint POST `/api/rattrapages/:id/note` permet de saisir la note de rattrapage.
4. Si la note de rattrapage est meilleure que l’originale, elle remplace l’originale dans les calculs (moyennes) en restant traçable.
5. Le système recalcule automatiquement les moyennes impactées après saisie de la note de rattrapage.
6. Des tests vérifient le remplacement, le recalcul et la traçabilité (historique de l’ancienne note).

---

## Story 3.8: Simple Report Card Generation

As a **enseignant ou secrétaire**,  
I want **générer un bulletin simplifié avec les notes et moyennes**,  
so that **je peux fournir un bulletin aux parents**.

### Acceptance Criteria

1. Un endpoint GET `/api/eleves/:id/bulletin/:periode_id` génère un bulletin simplifié pour un élève et une période donnée.
2. Pour le primaire/secondaire, le bulletin affiche les matières avec : notes, coefficients, moyennes par matière, moyenne générale.
3. Pour la maternelle, le bulletin affiche les évaluations qualitatives par domaine (acquis/en cours/non acquis).
4. Le format est HTML ou JSON structuré pour le MVP (PDF reporté à une phase ultérieure).
5. Des tests vérifient la génération, la cohérence des données (alignement avec notes/moyennes) et le format.

---

## Story 3.9: Daily Attendance Taking

As a **enseignant**,  
I want **prendre la présence quotidienne de ma classe**,  
so that **je peux suivre l’assiduité des élèves**.

### Acceptance Criteria

1. Une table `presences` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `classe_id` (UUID FK), `date` (DATE), `present` (BOOLEAN), `etablissement_id` (UUID FK).
2. Un endpoint POST `/api/presences` permet d’enregistrer les présences d’une classe pour une date donnée (liste d’élèves et leur statut).
3. Le système empêche la prise de présence en double pour une même classe et date (contrainte ou validation applicative).
4. Un endpoint GET `/api/classes/:id/presences/:date` retourne les présences d’une classe pour une date donnée.
5. Un endpoint GET `/api/classes/:id/absents/:date` retourne la liste des élèves absents pour cette date.
6. Des tests vérifient l’enregistrement, la détection des doublons et les listes d’absents.

---

## Story 3.10: Basic Attendance Statistics

As a **directeur ou enseignant**,  
I want **voir des statistiques d’absentéisme basiques**,  
so that **je peux identifier les élèves avec problèmes d’assiduité**.

### Acceptance Criteria

1. Un endpoint GET `/api/eleves/:id/statistiques-presence` retourne pour un élève : nombre de jours de présence, d’absence et taux de présence/absence sur une période.
2. Un endpoint GET `/api/classes/:id/statistiques-presence` retourne des statistiques globales par classe (taux de présence moyen, nombre d’absents récurrents, etc.).
3. Les statistiques peuvent être filtrées par période (dates ou période académique).
4. Des tests vérifient les calculs de statistiques et les cas limites (peu de données, classes vides, etc.).

---

## Story 3.11: Frontend for Evaluations and Attendance

As a **enseignant**,  
I want **une interface web pour saisir les notes et prendre les présences**,  
so that **je peux utiliser le système facilement**.

### Acceptance Criteria

1. Une page “Saisie de notes” permet de sélectionner classe, matière et période, et d’afficher un tableau pour saisir/modifier les notes des élèves, avec validations en temps réel.
2. Une page “Prise de présence” permet de sélectionner classe et date et d’afficher la liste des élèves avec cases à cocher pour présent/absent (optimisée pour saisie rapide).
3. Une page “Bulletins” permet de générer et visualiser les bulletins simplifiés par élève et période.
4. Les interfaces sont optimisées pour une saisie rapide (navigation clavier, focus automatique, messages d’erreur clairs).
5. Des tests de composants vérifient le rendu des pages, les principales interactions et la gestion des erreurs (API indisponible, validation).

