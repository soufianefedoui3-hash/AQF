import { PrismaClient } from "@prisma/client";
import { resolveProductionDatabaseUrl } from "../src/lib/database-url";
import { seedDefaultContent } from "../src/lib/seed-database";

const databaseUrl = resolveProductionDatabaseUrl();

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl },
  },
});

async function main() {
  await seedDefaultContent(prisma, { includeAdmin: true });

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@aqf.ma").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@AQF2026";

  console.log("Seed completed successfully!");
  console.log(`Database: ${databaseUrl}`);
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
