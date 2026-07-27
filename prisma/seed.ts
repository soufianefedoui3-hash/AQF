import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aqf.ma";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@AQF2026";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  const sectors = [
    {
      slug: "laboratoire-biologie-medicale",
      name: "Laboratoire de biologie médicale",
      description:
        "Accompagnement ISO 15189, GBEA et bonnes pratiques pour garantir la fiabilité des résultats analytiques et la conformité réglementaire.",
      imageUrl:
        "https://images.unsplash.com/photo-1579154204601-01588f351e38?auto=format&fit=crop&w=1200&q=80",
      order: 0,
    },
    {
      slug: "entreprise-agroalimentaire",
      name: "Entreprise agroalimentaire",
      description:
        "Mise en conformité ISO 22000, ONSSA et systèmes HACCP pour assurer la sécurité alimentaire de vos produits.",
      imageUrl:
        "https://images.unsplash.com/photo-1566645876731-bbfca2ee4e70?auto=format&fit=crop&w=1200&q=80",
      order: 1,
    },
    {
      slug: "universite",
      name: "Université",
      description:
        "Structuration des processus qualité, laboratoires de recherche et programmes de formation pour l'enseignement supérieur.",
      imageUrl:
        "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
      order: 2,
    },
    {
      slug: "clinique",
      name: "Clinique",
      description:
        "Optimisation des parcours de soins, gestion de la qualité et conformité réglementaire pour les établissements de santé.",
      imageUrl:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      order: 3,
    },
    {
      slug: "pharma",
      name: "Pharma",
      description:
        "Excellence opérationnelle, BPF et systèmes qualité pour l'industrie pharmaceutique et dispositifs médicaux.",
      imageUrl:
        "https://images.unsplash.com/photo-1582719471130-be2718ec2d44?auto=format&fit=crop&w=1200&q=80",
      order: 4,
    },
  ];

  for (const sector of sectors) {
    await prisma.sector.upsert({
      where: { slug: sector.slug },
      update: {
        name: sector.name,
        description: sector.description,
        imageUrl: sector.imageUrl,
        order: sector.order,
      },
      create: sector,
    });
  }

  const formationTypes = [
    "ISO 9001",
    "ISO 17025",
    "ISO 15189",
    "ISO 22000",
    "ISO 13485",
    "ISO 14001",
    "ONSSA",
    "Certification HALAL",
    "SMETA",
  ];

  for (let i = 0; i < formationTypes.length; i++) {
    await prisma.formationType.upsert({
      where: { name: formationTypes[i] },
      update: { order: i, active: true },
      create: { name: formationTypes[i], order: i, active: true },
    });
  }

  const aboutSections = [
    {
      key: "presentation",
      title: "Présentation du site",
      content:
        "AQF — Académie de Qualité et de Formation — est un centre d'excellence dédié à l'accompagnement des organisations dans leur démarche qualité. Nous intervenons auprès des laboratoires de biologie médicale, entreprises agroalimentaires, universités, cliniques et industries pharmaceutiques.\n\nNotre mission est de garantir la conformité aux normes internationales (ISO 9001, ISO 15189, ISO 17025, ISO 22000, etc.) tout en favorisant l'amélioration continue et la compétitivité de nos clients.",
    },
    {
      key: "steps",
      title: "Étapes à suivre pour demander un service",
      content:
        "1. Accédez à la page du service souhaité via le menu Services.\n\n2. Remplissez le formulaire dédié.\n\n3. Cliquez sur « Demande de confirmation ».\n\n4. Notre équipe AQF vous contactera dans un délai inférieur à 24 heures.",
    },
  ];

  for (const section of aboutSections) {
    await prisma.aboutSection.upsert({
      where: { key: section.key },
      update: section,
      create: section,
    });
  }

  const teamMembers = [
    {
      name: "Dr. Karim El Amrani",
      role: "Directeur Qualité & Audits",
      skills: "ISO 15189, ISO 17025, Audits internes, GBEA, Certification",
      order: 0,
    },
    {
      name: "Sara Benali",
      role: "Responsable Formation",
      skills: "Formation ISO 9001, ISO 22000, Pédagogie qualité, E-learning",
      order: 1,
    },
    {
      name: "Youssef Tazi",
      role: "Consultant Digital & Web",
      skills: "Solutions web qualité, Dashboards, Automatisation, ISO digitale",
      order: 2,
    },
  ];

  const existingTeam = await prisma.teamMember.count();
  if (existingTeam === 0) {
    await prisma.teamMember.createMany({ data: teamMembers });
  }

  await prisma.careersSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: "Rejoignez une équipe passionnée par la qualité",
      content:
        "AQF recherche des experts qualité, formateurs, auditeurs et consultants pour renforcer son réseau national. Si vous partagez notre vision de l'excellence et souhaitez contribuer à l'amélioration des organisations, nous serions ravis de recevoir votre candidature.\n\nMerci de joindre votre CV et votre lettre de motivation via le formulaire ci-contre ou par email direct.",
      email: "recrutement@aqf.ma",
      phone: "+212 600 000 000",
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      whatsappNumber: "+212600000000",
      contactEmail: "contact@aqf.ma",
      contactPhone: "+212 600 000 000",
      address: "Maroc",
    },
  });

  await prisma.pageContent.upsert({
    where: { key: "homepage_presentation" },
    update: {},
    create: {
      key: "homepage_presentation",
      title: "Présentation",
      content:
        "AQF — Académie de Qualité et de Formation — est votre partenaire de confiance en management de la qualité, formation professionnelle et audit. Nous accompagnons les laboratoires, entreprises agroalimentaires, universités, cliniques et industries pharmaceutiques vers l'excellence opérationnelle.",
    },
  });

  await prisma.pageContent.upsert({
    where: { key: "formation_intro" },
    update: {},
    create: {
      key: "formation_intro",
      title: "Formation Qualité",
      content:
        "Nos formations qualité sont conçues sur mesure pour répondre aux besoins des étudiants souhaitant se spécialiser, ainsi que des professionnels de santé et du corporate désireux de renforcer leurs compétences en management de la qualité, normes ISO et bonnes pratiques sectorielles.",
    },
  });

  await prisma.gedService.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: "GED — Gestion Électronique des Documents",
      description:
        "Notre solution web GED permet de centraliser, structurer et sécuriser l'ensemble de votre documentation qualité. Gestion des versions, traçabilité, workflows de validation et accès contrôlé — le tout conforme aux exigences ISO.\n\nDéveloppée par AQF, cette plateforme s'adapte à vos processus métier et facilite la préparation aux audits et certifications.",
    },
  });

  const existingNews = await prisma.newsArticle.count();
  if (existingNews === 0) {
    await prisma.newsArticle.create({
      data: {
        title: "AQF lance son nouveau programme de formation ISO 15189",
        slug: "aqf-lance-programme-iso-15189",
        excerpt:
          "Un programme complet dédié aux laboratoires de biologie médicale souhaitant obtenir la certification ISO 15189.",
        content:
          "L'Académie de Qualité et de Formation (AQF) est fière d'annoncer le lancement de son nouveau programme de formation ISO 15189, spécialement conçu pour les laboratoires de biologie médicale.\n\nCe programme couvre l'ensemble des exigences de la norme, de la structuration documentaire à la préparation à l'audit de certification. Nos formateurs experts vous accompagnent à chaque étape.\n\nInscrivez-vous dès maintenant via notre formulaire de formation qualité.",
        published: true,
      },
    });
  }

  const productPacks = [
    { name: "ISO 9001", description: "Pack d'implémentation complet pour la gestion de la qualité.", order: 0 },
    { name: "ISO 15189", description: "Pack spécialisé pour laboratoires de biologie médicale.", order: 1 },
    { name: "ISO 17025", description: "Pack pour laboratoires d'essais et d'étalonnage.", order: 2 },
    { name: "ISO 22000", description: "Pack sécurité alimentaire pour l'agroalimentaire.", order: 3 },
    { name: "ISO 14001", description: "Pack management environnemental.", order: 4 },
    { name: "GBEA", description: "Guide Bonnes Exercices d'Analyse — accompagnement complet.", order: 5 },
    { name: "ONSSA", description: "Conformité réglementaire agroalimentaire Maroc.", order: 6 },
    { name: "ISO 13189", description: "Pack norme spécialisée pour votre secteur.", order: 7 },
  ];

  const existingPacks = await prisma.productPack.count();
  if (existingPacks === 0) {
    await prisma.productPack.createMany({ data: productPacks });
  }

  console.log("Seed completed successfully!");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
