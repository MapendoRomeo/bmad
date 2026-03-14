import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Établissement de démo
  const etab = await prisma.etablissement.create({
    data: {
      nom: 'École Primaire Excellence',
      type: 'primaire',
      adresse: '123 Avenue de la République, Dakar',
      telephone: '+221 33 123 4567',
      email: 'contact@ecole-excellence.sn',
      actif: true,
    },
  });

  const hash = await bcrypt.hash('Password1', 10);

  // Utilisateurs par rôle
  const users = [
    { nom: 'Diop', prenom: 'Amadou', email: 'directeur@ecole-excellence.sn', role: 'directeur' },
    { nom: 'Ndiaye', prenom: 'Fatou', email: 'admin@ecole-excellence.sn', role: 'admin' },
    { nom: 'Sow', prenom: 'Mariama', email: 'secretaire@ecole-excellence.sn', role: 'secretaire' },
    { nom: 'Fall', prenom: 'Ibrahima', email: 'comptable@ecole-excellence.sn', role: 'comptable' },
    { nom: 'Ba', prenom: 'Ousmane', email: 'enseignant@ecole-excellence.sn', role: 'enseignant' },
  ];

  for (const u of users) {
    await prisma.utilisateur.create({
      data: {
        ...u,
        motDePasseHash: hash,
        etablissementId: etab.id,
        actif: true,
      },
    });
  }

  // Année scolaire
  const annee = await prisma.anneeScolaire.create({
    data: {
      nom: '2025-2026',
      dateDebut: new Date('2025-09-01'),
      dateFin: new Date('2026-06-30'),
      etablissementId: etab.id,
      active: true,
    },
  });

  // Périodes (3 trimestres)
  const trimestres = [
    { nom: 'Trimestre 1', dateDebut: new Date('2025-09-01'), dateFin: new Date('2025-12-15') },
    { nom: 'Trimestre 2', dateDebut: new Date('2026-01-05'), dateFin: new Date('2026-03-31') },
    { nom: 'Trimestre 3', dateDebut: new Date('2026-04-14'), dateFin: new Date('2026-06-30') },
  ];

  for (const t of trimestres) {
    await prisma.periode.create({
      data: { ...t, anneeScolaireId: annee.id, etablissementId: etab.id },
    });
  }

  // Classes
  const niveaux = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  const classes = [];
  for (const niveau of niveaux) {
    const cls = await prisma.classe.create({
      data: {
        nom: `${niveau} A`,
        niveau,
        effectifMax: 35,
        etablissementId: etab.id,
        anneeScolaireId: annee.id,
      },
    });
    classes.push(cls);
  }

  // Matières (primaire)
  const matieresPrimaire = [
    { nom: 'Français', coefficient: 3 },
    { nom: 'Mathématiques', coefficient: 3 },
    { nom: 'Histoire-Géographie', coefficient: 2 },
    { nom: 'Sciences', coefficient: 2 },
    { nom: 'Éducation civique', coefficient: 1 },
    { nom: 'Éducation physique', coefficient: 1 },
    { nom: 'Arts plastiques', coefficient: 1 },
    { nom: 'Musique', coefficient: 1 },
  ];

  for (const niveau of niveaux) {
    for (const m of matieresPrimaire) {
      await prisma.matiere.create({
        data: { ...m, niveau, etablissementId: etab.id },
      });
    }
  }

  // Quelques élèves de démo
  const elevesData = [
    { nom: 'Diallo', prenom: 'Aminata', dateNaissance: new Date('2016-03-15'), sexe: 'F' },
    { nom: 'Sarr', prenom: 'Moussa', dateNaissance: new Date('2016-07-22'), sexe: 'M' },
    { nom: 'Mbaye', prenom: 'Aïssatou', dateNaissance: new Date('2015-11-10'), sexe: 'F' },
    { nom: 'Gueye', prenom: 'Ababacar', dateNaissance: new Date('2016-01-05'), sexe: 'M' },
    { nom: 'Faye', prenom: 'Khady', dateNaissance: new Date('2015-09-18'), sexe: 'F' },
  ];

  for (let i = 0; i < elevesData.length; i++) {
    const eleve = await prisma.eleve.create({
      data: {
        ...elevesData[i],
        statut: 'admis',
        numeroEleve: `2025-${String(i + 1).padStart(4, '0')}`,
        etablissementId: etab.id,
      },
    });

    // Parent
    await prisma.parentRecord.create({
      data: {
        eleveId: eleve.id,
        nom: `Parent de ${elevesData[i].prenom}`,
        telephone: `+221 77 ${String(100 + i).padStart(3, '0')} ${String(2000 + i).padStart(4, '0')}`,
        etablissementId: etab.id,
      },
    });

    // Affectation dans CP A
    await prisma.affectationEleve.create({
      data: {
        eleveId: eleve.id,
        classeId: classes[0].id,
        etablissementId: etab.id,
      },
    });
  }

  // Type de frais
  const scolarite = await prisma.typeFrais.create({
    data: { nom: 'Scolarité', description: 'Frais de scolarité annuels', etablissementId: etab.id },
  });

  await prisma.typeFrais.create({
    data: { nom: 'Inscription', description: "Frais d'inscription", etablissementId: etab.id },
  });

  // Montant frais
  await prisma.montantFrais.create({
    data: {
      typeFraisId: scolarite.id,
      niveau: 'CP',
      montant: 150000,
      etablissementId: etab.id,
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Établissement: ${etab.nom} (${etab.id})`);
  console.log('Login: directeur@ecole-excellence.sn / Password1');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
