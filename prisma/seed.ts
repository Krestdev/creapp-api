import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const roles = [
    "ADMIN",
    "USER",
    "MANAGER",
    "SALES",
    "SALES_MANAGER",
    "VOLT",
    "VOLT_MANAGER",
  ];

  for (const label of roles) {
    const existing = await prisma.role.findFirst({ where: { label } });
    if (!existing) {
      await prisma.role.create({ data: { label } });
      console.log(`Created role: ${label}`);
    } else {
      console.log(`Role exists: ${label}`);
    }
  }

  // Category with explicit id = 0
  const categoryId = 0;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    await prisma.category.create({
      data: {
        id: categoryId,
        label: "facilitation",
        description: "facilitation services and related expenses",
      },
    });
    console.log("Created category: facilitation (id=0)");
  } else {
    console.log("Category exists: facilitation (id=0)");
  }

  // Project: provide full scalar fields
  const projectLabel = "GESION INTERNE";
  const project = await prisma.project.findFirst({
    where: { label: projectLabel },
  });
  if (!project) {
    await prisma.project.create({
      data: {
        label: projectLabel,
        reference: "GESTION-INTERNE-001",
        status: "ongoing",
        description:
          "Projet de gestion interne pour les opérations et la maintenance",
        budget: 0.0,
        // chiefId omitted (null) on creation — relation is optional
        createdAt: now,
        updatedAt: now,
      },
    });
    console.log(`Created project: ${projectLabel}`);
  } else {
    console.log(`Project exists: ${projectLabel}`);
  }

  // Provider: provide full scalar fields
  const providerName = "Creaconsult";
  const provider = await prisma.provider.findFirst({
    where: { name: providerName },
  });
  if (!provider) {
    await prisma.provider.create({
      data: {
        name: providerName,
        phone: "+243000000000",
        email: "contact@creaconsult.com",
        address: "Avenue Exemple 123, Kinshasa, DRC",
        RCCM: "RCCM-CR-2025-001",
        NIU: "NIU-CR-2025-001",
        regem: "Regem-001",
        status: true,
        createdAt: now,
        updatedAt: now,
        carte_contribuable: "CC-123456",
        acf: "ACF-7890",
        plan_localisation: "Kinshasa, Gombe",
        commerce_registre: "CR-555-2025",
        banck_attestation: "BA-2025-001",
      },
    });
    console.log(`Created provider: ${providerName}`);
  } else {
    console.log(`Provider exists: ${providerName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
