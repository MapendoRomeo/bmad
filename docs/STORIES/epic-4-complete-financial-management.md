# Epic 4: Complete Financial Management

Cet epic met en place la gestion financière complète : configuration flexible des frais, génération automatique et manuelle de factures, enregistrement des paiements, gestion des crédits, calcul des soldes, reçus et rapports financiers de base.

---

## Story 4.1: Flexible Fee Configuration

As a **comptable ou directeur**,  
I want **créer et configurer des types de frais scolaires entièrement personnalisables**,  
so that **je peux adapter les frais à la réalité de mon établissement**.

### Acceptance Criteria

1. Une table `types_frais` est créée avec colonnes : `id` (UUID), `nom` (VARCHAR), `description` (TEXT), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Un endpoint POST `/api/types-frais` permet de créer un type de frais (aucun type prédéfini obligatoire).
3. Un endpoint GET `/api/types-frais` liste les types de frais existants pour l’établissement.
4. Un endpoint PUT `/api/types-frais/:id` permet de modifier le nom et la description d’un type de frais.
5. Des tests vérifient le CRUD des types de frais et l’isolation multi-tenant.

---

## Story 4.2: Fee Amounts Configuration by Level/Class

As a **comptable ou directeur**,  
I want **configurer les montants de frais par niveau/classe avec échéances**,  
so that **je peux définir des tarifs différenciés selon les niveaux**.

### Acceptance Criteria

1. Une table `montants_frais` est créée avec colonnes : `id` (UUID), `type_frais_id` (UUID FK), `niveau_id` (UUID FK nullable), `classe_id` (UUID FK nullable), `eleve_id` (UUID FK nullable), `montant` (DECIMAL), `echeance` (ENUM: mensuel/trimestriel/annuel), `etablissement_id` (UUID FK).
2. Un endpoint POST `/api/montants-frais` permet de créer une configuration de montant, avec la priorité métier : élève > classe > niveau > défaut.
3. La validation vérifie que `montant` est strictement > 0 et que `echeance` est une valeur valide.
4. Un endpoint GET `/api/montants-frais` liste les configurations avec filtres par type de frais, niveau, classe, élève.
5. Des tests vérifient l’application correcte de la priorité de montants dans les scénarios de facturation.

---

## Story 4.3: Automatic Invoice Generation

As a **système**,  
I want **générer automatiquement des factures selon les échéances configurées**,  
so that **les factures sont créées sans intervention manuelle**.

### Acceptance Criteria

1. Une table `factures` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `type_frais_id` (UUID FK), `montant` (DECIMAL), `date_emission` (DATE), `date_echeance` (DATE), `statut` (ENUM: emise/payee/partiellement_payee/impayee), `periode` (VARCHAR), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Un job planifié (cron/worker) s’exécute quotidiennement pour générer les factures en fonction des échéances et de la configuration des montants.
3. Le système parcourt les élèves actifs (statut `admis` et affectés à une classe) et génère les factures attendues pour la période.
4. Le système évite la régénération de factures existantes pour une même période/type_frais/élève (contrôle de doublon).
5. Un endpoint POST `/api/factures/generation-automatique` permet de déclencher manuellement la génération (pour tests ou régénération contrôlée).
6. Des tests vérifient la génération automatique, l’absence de doublons, et la cohérence des montants.

---

## Story 4.4: Manual Invoice Generation

As a **comptable**,  
I want **générer manuellement des factures à tout moment**,  
so that **je peux créer des factures personnalisées ou urgentes**.

### Acceptance Criteria

1. Un endpoint POST `/api/factures` permet de créer une facture manuelle avec sélection de l’élève, du type de frais, du montant, de la période et des dates.
2. Le système vérifie les doublons de façon raisonnable (facture identique sur même période / même type de frais).
3. Un endpoint GET `/api/factures` liste les factures avec filtres (élève, statut, période, type de frais).
4. Un endpoint GET `/api/factures/:id` retourne les détails d’une facture.
5. Des tests vérifient la génération manuelle, la détection de doublons et les règles de validation.

---

## Story 4.5: Invoice Status Management

As a **système**,  
I want **gérer les statuts de facture (émise, payée, partiellement payée, impayée) automatiquement**,  
so that **le suivi des factures est précis et à jour**.

### Acceptance Criteria

1. À la création, une facture est en statut `emise`.
2. Le statut `impayee` est automatiquement défini si la date d’échéance est dépassée et que le solde > 0 (tâche planifiée ou logique à l’accès).
3. Le statut `partiellement_payee` est défini si au moins un paiement a été enregistré mais que le solde reste > 0.
4. Le statut `payee` est défini quand le montant total est entièrement réglé.
5. Un endpoint PUT `/api/factures/:id` permet de modifier certains champs (ex : dates, description) uniquement tant que la facture est en statut `emise`.
6. Des tests vérifient que les statuts évoluent correctement en fonction des paiements et des dates.

---

## Story 4.6: Payment Recording

As a **comptable**,  
I want **enregistrer un paiement (montant, date, mode) et l’associer à des factures**,  
so that **je peux suivre les paiements des élèves**.

### Acceptance Criteria

1. Une table `paiements` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `montant` (DECIMAL), `date` (DATE), `mode` (ENUM: especes), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Une table `paiements_factures` (relation many-to-many) lie les paiements aux factures avec `montant_affecte`.
3. Un endpoint POST `/api/paiements` permet d’enregistrer un paiement en sélectionnant les factures à régler et en répartissant le montant.
4. Le système vérifie que le montant affecté aux factures ne dépasse pas le montant du paiement, et que le total n’est pas supérieur au solde dû (sauf cas de crédit géré en Story 4.8).
5. Le système met à jour automatiquement les statuts des factures associées après chaque paiement.
6. Un endpoint GET `/api/paiements` liste les paiements avec filtres (élève, période, mode).
7. Des tests vérifient l’enregistrement, la répartition sur les factures et la mise à jour des statuts.

---

## Story 4.7: Partial Payment Support

As a **comptable**,  
I want **enregistrer des paiements partiels pour une facture**,  
so that **je peux gérer les paiements échelonnés**.

### Acceptance Criteria

1. Le modèle et la logique métier supportent plusieurs paiements pour une même facture via la table `paiements_factures`.
2. Le solde restant d’une facture est calculé automatiquement comme `montant_facture - somme(montants_affectes)`.
3. Tant que le solde > 0 et des paiements sont enregistrés, le statut de la facture est `partiellement_payee`.
4. Un endpoint GET `/api/factures/:id/solde` retourne le solde restant calculé.
5. Des tests vérifient les scénarios de paiements multiples, les changements de statut et les calculs de solde.

---

## Story 4.8: Credit Management for Advance Payments

As a **comptable**,  
I want **gérer les crédits (paiements en avance) et les appliquer aux factures futures**,  
so that **je peux gérer les paiements anticipés**.

### Acceptance Criteria

1. Une table `credits` est créée avec colonnes : `id` (UUID), `eleve_id` (UUID FK), `montant` (DECIMAL), `solde_restant` (DECIMAL), `etablissement_id` (UUID FK), `cree_le` (TIMESTAMP).
2. Si un paiement dépasse le solde dû des factures sélectionnées, la différence est enregistrée comme crédit pour l’élève.
3. Si un paiement est explicitement marqué comme “avance”, le système peut générer une facture future correspondante et la marquer `payee_a_l_avance` ou créer du crédit selon la stratégie définie.
4. Un endpoint GET `/api/eleves/:id/credits` retourne les crédits existants pour un élève.
5. Lors de la génération de nouvelles factures, le système applique automatiquement les crédits disponibles pour réduire les montants dus.
6. Des tests vérifient la création, la consommation et le suivi des crédits.

---

## Story 4.9: Balance Calculation and Outstanding List

As a **comptable ou directeur**,  
I want **voir les soldes par élève et la liste des impayés**,  
so that **je peux suivre la situation financière**.

### Acceptance Criteria

1. Un endpoint GET `/api/eleves/:id/solde` retourne le solde d’un élève : somme des montants de factures - somme des paiements + prise en compte des crédits (solde pouvant être négatif si créditeur).
2. Un endpoint GET `/api/factures/impayees` retourne la liste des factures impayées avec filtres (période, type de frais, classe, etc.).
3. Les requêtes sont paginées et optimisées via index (sur `statut`, `date_echeance`, `etablissement_id`).
4. Des tests vérifient la précision des calculs de solde et la cohérence de la liste des impayés.

---

## Story 4.10: Basic Receipt Generation

As a **comptable**,  
I want **générer un reçu basique pour un paiement**,  
so that **je peux fournir une preuve de paiement**.

### Acceptance Criteria

1. Un endpoint GET `/api/paiements/:id/recu` génère un reçu pour un paiement donné.
2. Le reçu affiche : informations de l’établissement, nom de l’élève, montant, date, mode de paiement, factures réglées et montants affectés.
3. Le format est texte simple ou HTML pour le MVP (PDF non obligatoire).
4. Des tests vérifient que les informations du reçu sont complètes et cohérentes avec les données de paiement.

---

## Story 4.11: Basic Financial Reports

As a **comptable ou directeur**,  
I want **voir des rapports de recettes et statistiques financières basiques**,  
so that **je peux analyser la situation financière**.

### Acceptance Criteria

1. Un endpoint GET `/api/rapports/recettes` retourne les recettes agrégées avec filtres (période, type de frais, classe, etc.).
2. Un endpoint GET `/api/rapports/statistiques` retourne des indicateurs clés : montant total facturé, montant total payé, taux de paiement global, taux d’impayés.
3. Les rapports sont calculés pour une période donnée (dates ou période académique) avec agrégations SQL optimisées.
4. Des tests vérifient les calculs des rapports sur des datasets de test variés.

---

## Story 4.12: Frontend for Financial Management

As a **comptable**,  
I want **une interface web pour gérer la facturation et les paiements**,  
so that **je peux utiliser le système facilement**.

### Acceptance Criteria

1. Une page “Configuration des frais” permet de gérer les types de frais et les montants (niveau/classe/élève) avec UI claire et validations.
2. Une page “Factures” affiche la liste des factures avec filtres (élève, statut, période), détails et actions (génération manuelle, modification autorisée).
3. Une page “Paiements” permet d’enregistrer un paiement, de sélectionner les factures à régler et de visualiser le solde restant.
4. Une page “Rapports financiers” affiche les recettes, impayés et statistiques de base avec tableaux et graphiques simples.
5. Des tests de composants vérifient le rendu, les principales interactions (création de facture, paiement, consultation de rapports) et la gestion des erreurs.

