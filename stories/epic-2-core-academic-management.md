# Epic 2: Core Academic Management

Cet epic couvre la gestion complète des entités académiques fondamentales : élèves, inscriptions, admissions, classes, affectations élèves, enseignants et transferts. À la fin de cet epic, un établissement peut gérer entièrement ses élèves, classes et enseignants avec les workflows métier clés (inscription → admission → affectation, transferts, désinscription).

---

## Story 2.1: Student Registration Workflow

As a **secrétaire**,  
I want **inscrire un nouvel élève avec ses informations personnelles et celles de ses parents**,  
so that **je peux enregistrer les demandes d’inscription dans le système**.

### Acceptance Criteria

1. Une table `eleves` est créée avec colonnes : `id` (UUID), `numero_eleve` (VARCHAR unique, nullable avant admission), `nom` (VARCHAR), `prenom` (VARCHAR), `date_naissance` (DATE), `sexe` (ENUM), `photo_url` (VARCHAR nullable), `statut` (ENUM: inscrit/admis/desinscrit), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Une table `parents` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `nom` (VARCHAR), `telephone` (VARCHAR), `email` (VARCHAR nullable), `adresse` (TEXT), `etablissement_id` (UUID FK).
3. Un endpoint POST `/api/eleves/inscription` accepte les données de l’élève et des parents (un ou plusieurs) avec validation stricte (champs requis, formats, âges).
4. Le statut initial de l’élève est `inscrit` et `numero_eleve` est null à ce stade.
5. L’âge de l’élève est validé en fonction du niveau souhaité (règles de business simples configurables ou constantes).
6. Un endpoint GET `/api/eleves` liste les élèves avec filtres (statut, niveau souhaité, date d’inscription) et recherche (nom, prénom).
7. Des tests d’intégration vérifient la création d’inscription avec validation des données et la persistance correcte des parents liés.
8. Toutes les opérations sont loggées dans `audit_logs` avec l’utilisateur ayant effectué l’inscription.

---

## Story 2.2: Class Capacity Check and Waiting List

As a **secrétaire**,  
I want **vérifier si une classe a des places disponibles et gérer une liste d’attente si la classe est pleine**,  
so that **je peux gérer les inscriptions même quand les classes sont complètes**.

### Acceptance Criteria

1. Une table `classes` est créée avec colonnes : `id` (UUID), `nom` (VARCHAR), `niveau` (VARCHAR), `effectif_max` (INTEGER), `etablissement_id` (UUID FK), `annee_scolaire_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Une table `inscriptions` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `classe_souhaitee_id` (UUID FK), `statut` (ENUM: en_attente/validee), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
3. Lors de l’inscription, le système vérifie l’effectif actuel de la classe souhaitée (nombre d’élèves déjà affectés/admis dans cette classe pour l’année).
4. Si la classe a des places disponibles, l’inscription est marquée `validee` et l’élève est positionné pour admission dans cette classe.
5. Si la classe est pleine, l’inscription est marquée `en_attente` et ajoutée à la liste d’attente.
6. Un endpoint GET `/api/inscriptions/liste-attente` affiche les élèves en attente par classe, triés par date d’inscription (premier arrivé, premier servi).
7. Des tests vérifient la gestion de la liste d’attente et la mise à jour du statut quand une place se libère (par désinscription ou transfert).

---

## Story 2.3: Student Admission with Number Assignment

As a **directeur ou secrétaire**,  
I want **valider une inscription et attribuer un numéro d’élève unique (format ANNEE-NUM)**,  
so that **l’élève devient officiellement admis dans l’établissement**.

### Acceptance Criteria

1. Un endpoint POST `/api/eleves/:id/admission` permet de valider une inscription existante.
2. Le système génère automatiquement un numéro d’élève unique au format `YYYY-NNN` (ex : `2024-001`) pour l’établissement et l’année scolaire en cours.
3. Le numéro est unique par établissement et par année scolaire (contrainte d’unicité en base).
4. Le statut de l’élève passe de `inscrit` à `admis` lors de l’admission.
5. Seuls le Directeur et le Secrétaire ont le droit de valider une admission (contrôle RBAC).
6. Un workflow optionnel d’approbation (Secrétaire soumet → Directeur valide) est supporté par un champ ou une configuration simple.
7. Un endpoint GET `/api/eleves/:id` retourne la fiche complète de l’élève incluant son numéro d’élève.
8. Des tests vérifient l’unicité des numéros, le changement de statut et le respect des permissions.
9. Les admissions sont loggées dans `audit_logs` avec identifiant de l’approbateur.

---

## Story 2.4: Class Creation and Management

As a **directeur ou admin**,  
I want **créer et gérer des classes (nom, niveau, effectif max)**,  
so that **je peux organiser les élèves par classes**.

### Acceptance Criteria

1. Un endpoint POST `/api/classes` crée une classe avec `nom`, `niveau`, `effectif_max`, rattachée à l’établissement et à l’année scolaire active.
2. La validation vérifie que le nom est unique par établissement et année scolaire (contrainte d’unicité).
3. La validation vérifie que `effectif_max` est strictement > 0.
4. Un endpoint GET `/api/classes` liste les classes avec effectif actuel calculé (nombre d’élèves affectés actifs).
5. Un endpoint GET `/api/classes/:id` retourne les détails d’une classe.
6. Un endpoint PUT `/api/classes/:id` permet de modifier `nom`, `niveau` et `effectif_max`, avec une règle interdisant de réduire `effectif_max` sous l’effectif actuel.
7. Des tests couvrent création, modification, validations et erreurs (doublons, effectif invalide).
8. Les opérations sont loggées dans `audit_logs`.

---

## Story 2.5: Student to Class Assignment

As a **secrétaire**,  
I want **affecter un élève admis à une classe en vérifiant l’effectif disponible**,  
so that **je peux organiser les élèves dans les classes appropriées**.

### Acceptance Criteria

1. Une table `affectations_eleves` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `classe_id` (UUID FK), `date_debut` (DATE), `date_fin` (DATE nullable), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Un endpoint POST `/api/eleves/:id/affectation` permet d’affecter un élève à une classe.
3. Le système vérifie que l’élève a le statut `admis`.
4. Le système vérifie que la classe n’est pas pleine (`effectif_actuel < effectif_max`).
5. Si la classe est pleine, le système renvoie une erreur claire et peut suggérer la création d’une nouvelle classe (story séparée/extension).
6. Un élève ne peut avoir qu’une seule affectation active (date_fin null) à la fois ; une contrainte métier garantit cette unicité.
7. Un endpoint GET `/api/classes/:id/eleves` retourne tous les élèves de la classe.
8. Des tests vérifient l’affectation, le contrôle d’effectif, et l’unicité de l’affectation active.
9. Les affectations sont loggées dans `audit_logs`.

---

## Story 2.6: Student Transfer Between Classes

As a **secrétaire**,  
I want **transférer un élève d’une classe à une autre**,  
so that **je peux réorganiser les classes si nécessaire**.

### Acceptance Criteria

1. Un endpoint POST `/api/eleves/:id/transfert` permet de transférer un élève vers une nouvelle classe.
2. Le système clôt l’affectation actuelle en renseignant `date_fin = aujourd’hui` et crée une nouvelle affectation pour la classe de destination avec `date_debut = aujourd’hui`.
3. Le système vérifie que la classe de destination n’est pas pleine avant la création de la nouvelle affectation.
4. Une règle métier empêche les transferts en cours d’année sauf si une option/autorisation Directeur est activée (paramètre simple au niveau établissement).
5. L’historique des affectations (ancienne et nouvelle) est conservé pour traçabilité complète.
6. Des tests vérifient le transfert, le respect des contraintes de capacité et la conservation de l’historique.
7. Les transferts sont loggés dans `audit_logs` avec l’utilisateur responsable.

---

## Story 2.7: Teacher Management CRUD

As a **directeur ou admin**,  
I want **créer et gérer les enseignants (nom, prénom, email, téléphone)**,  
so that **je peux enregistrer les enseignants de l’établissement**.

### Acceptance Criteria

1. Une table `enseignants` est créée avec colonnes : `id` (UUID), `nom` (VARCHAR), `prenom` (VARCHAR), `email` (VARCHAR), `telephone` (VARCHAR), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Un endpoint POST `/api/enseignants` crée un enseignant avec validation des données (champs requis, email au bon format).
3. Un endpoint GET `/api/enseignants` liste les enseignants avec recherche (nom, prénom) et filtres éventuels.
4. Un endpoint GET `/api/enseignants/:id` affiche la fiche complète d’un enseignant.
5. Un endpoint PUT `/api/enseignants/:id` permet de modifier les informations d’un enseignant.
6. Un endpoint DELETE `/api/enseignants/:id` réalise un soft delete (flag actif ou suppression logique) sans supprimer l’historique.
7. Des tests vérifient le CRUD complet avec isolation multi-tenant.
8. Toutes les opérations sont loggées dans `audit_logs`.

---

## Story 2.8: Teacher to Class Assignment

As a **directeur ou admin**,  
I want **affecter un enseignant à une classe (polyvalent ou spécialisé par matière)**,  
so that **je peux organiser l’enseignement dans les classes**.

### Acceptance Criteria

1. Une table `affectations_enseignants` est créée avec colonnes : `id` (UUID), `enseignant_id` (UUID FK), `classe_id` (UUID FK), `matiere_id` (UUID FK nullable), `date_debut` (DATE), `date_fin` (DATE nullable), `etablissement_id` (UUID FK).
2. Un endpoint POST `/api/enseignants/:id/affectation` affecte un enseignant à une classe, avec ou sans matière spécifique.
3. Si `matiere_id` est null, l’enseignant est considéré comme polyvalent de la classe.
4. Si `matiere_id` est spécifié, l’enseignant est spécialisé pour cette matière dans cette classe.
5. Un enseignant peut avoir plusieurs affectations simultanées (plusieurs classes, plusieurs matières).
6. Un endpoint GET `/api/classes/:id/enseignants` retourne les enseignants d’une classe avec distinction polyvalent/spécialisé.
7. Un endpoint GET `/api/enseignants/:id/affectations` retourne les affectations d’un enseignant.
8. Des tests vérifient les différents cas d’affectation (polyvalent, spécialisé, historique).
9. Les affectations sont loggées dans `audit_logs`.

---

## Story 2.9: Student Disenrollment Workflow

As a **secrétaire**,  
I want **désinscrire un élève avec vérification des impayés**,  
so that **je peux gérer les sorties d’élèves de manière contrôlée**.

### Acceptance Criteria

1. Un endpoint POST `/api/eleves/:id/desinscription` permet de désinscrire un élève.
2. Avant désinscription, le système vérifie le solde dû de l’élève en interrogeant le module financier ; si le solde > 0, l’opération est bloquée.
3. Si le solde est > 0, la désinscription renvoie un message d’erreur explicite indiquant le montant dû.
4. Si le solde est à 0, le statut de l’élève passe à `desinscrit`, la date de sortie est enregistrée, et la place dans la classe est libérée (affectation clôturée).
5. Un champ optionnel `raison` permet d’enregistrer la raison de la désinscription (changement d’école, déménagement, etc.).
6. Un document de sortie simple (texte ou HTML) peut être généré pour le MVP (pas de PDF obligatoire).
7. L’historique académique de l’élève est conservé (notes, présences, factures, etc. non supprimés).
8. Des tests vérifient le blocage si impayé, la désinscription réussie si solde nul, et la génération du document.
9. La désinscription est loggée dans `audit_logs`.

---

## Story 2.10: Frontend for Student Management

As a **secrétaire**,  
I want **une interface web pour gérer les élèves (inscription, admission, affectation, consultation)**,  
so that **je peux utiliser le système pour remplacer les méthodes manuelles**.

### Acceptance Criteria

1. Une page “Liste des élèves” est créée avec tableau, recherche, filtres (statut, classe, niveau) et actions rapides (voir, modifier, affecter, désinscrire).
2. Une page “Inscription élève” est créée avec formulaire multi-étapes (informations élève, informations parents, classe souhaitée), avec validations frontend alignées sur le backend.
3. Une page “Fiche élève” est créée avec onglets (Informations, Parents, Affectations, Historique académique de base).
4. Une vue “Admissions” liste les inscriptions en attente avec actions de validation (admission) accessibles selon le rôle.
5. Une interface d’affectation à une classe permet de sélectionner la classe, affiche l’effectif actuel/max et gère les erreurs de classe pleine.
6. Les workflows sont guidés avec indicateurs de progression, messages de confirmation et gestion claire des erreurs (ex : impayés bloquants, classe pleine).
7. L’interface est responsive et fonctionne sur desktop et tablette ; l’expérience reste utilisable sur connexions lentes (feedback de chargement).
8. Des tests de composants vérifient le rendu et les principales interactions (création, admission, affectation).

