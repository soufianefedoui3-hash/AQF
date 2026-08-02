import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolve the local Prisma CLI entrypoint without relying on PATH/global installs.
 */
export function resolvePrismaCliEntry() {
  const candidates = [];

  try {
    const require = createRequire(join(process.cwd(), "package.json"));
    const prismaPackageJson = require.resolve("prisma/package.json");
    candidates.push(join(dirname(prismaPackageJson), "build", "index.js"));
  } catch {
    /* package may be missing at runtime */
  }

  try {
    const require = createRequire(join(__dirname, "..", "package.json"));
    const prismaPackageJson = require.resolve("prisma/package.json");
    candidates.push(join(dirname(prismaPackageJson), "build", "index.js"));
  } catch {
    /* ignore */
  }

  candidates.push(
    join(process.cwd(), "node_modules", "prisma", "build", "index.js"),
    join(process.cwd(), "node_modules", "prisma", "build", "index.mjs"),
    join(__dirname, "..", "node_modules", "prisma", "build", "index.js")
  );

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return { type: "node", path: candidate };
    }
  }

  const binCandidates = [
    join(process.cwd(), "node_modules", ".bin", "prisma"),
    join(process.cwd(), "node_modules", ".bin", "prisma.cmd"),
    join(__dirname, "..", "node_modules", ".bin", "prisma"),
    join(__dirname, "..", "node_modules", ".bin", "prisma.cmd"),
  ];

  for (const candidate of binCandidates) {
    if (existsSync(candidate)) {
      return { type: "bin", path: candidate };
    }
  }

  return null;
}

export function runPrismaCli(args, { stdio = "inherit" } = {}) {
  const resolved = resolvePrismaCliEntry();

  if (!resolved) {
    return {
      ok: false,
      error: "Prisma CLI not found in node_modules",
      status: null,
    };
  }

  const result =
    resolved.type === "node"
      ? spawnSync(process.execPath, [resolved.path, ...args], {
          stdio,
          env: process.env,
          cwd: process.cwd(),
        })
      : spawnSync(resolved.path, args, {
          stdio,
          env: process.env,
          cwd: process.cwd(),
          shell: process.platform === "win32",
        });

  if (result.error) {
    return { ok: false, error: result.error.message, status: null };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      error: `prisma ${args.join(" ")} exited with code ${result.status ?? "unknown"}`,
      status: result.status,
    };
  }

  return { ok: true, status: 0, path: resolved.path };
}

/**
 * SQLite CREATE TABLE statements matching prisma/schema.prisma.
 * Used when the Prisma CLI package is unavailable at runtime.
 */
export const SQLITE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email")`,

  `CREATE TABLE IF NOT EXISTS "ConsultationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "AccompagnementRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sector" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "responsableName" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "entityDetails" TEXT NOT NULL,
    "requestType" TEXT NOT NULL DEFAULT '',
    "appointmentDate" TEXT,
    "appointmentTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "FormationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingType" TEXT NOT NULL,
    "audienceType" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "AuditRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "norms" TEXT NOT NULL,
    "customNorm" TEXT,
    "auditNature" TEXT NOT NULL,
    "customAuditNature" TEXT,
    "companyName" TEXT NOT NULL,
    "companyActivity" TEXT NOT NULL DEFAULT '',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "FormationType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "FormationType_name_key" ON "FormationType"("name")`,

  `CREATE TABLE IF NOT EXISTS "WebServiceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responsableName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "requestInfo" TEXT,
    "appointmentDate" TEXT,
    "appointmentTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "Sector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Sector_slug_key" ON "Sector"("slug")`,

  `CREATE TABLE IF NOT EXISTS "AboutSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AboutSection_key_key" ON "AboutSection"("key")`,

  `CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "PageContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PageContent_key_key" ON "PageContent"("key")`,

  `CREATE TABLE IF NOT EXISTS "GedService" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "ProductPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "NewsArticle_slug_key" ON "NewsArticle"("slug")`,

  `CREATE TABLE IF NOT EXISTS "CareersSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "positionName" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cvPath" TEXT NOT NULL,
    "letterPath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+212600000000',
    "contactEmail" TEXT NOT NULL DEFAULT 'contact@aqf.ma',
    "contactPhone" TEXT NOT NULL DEFAULT '+212600000000',
    "address" TEXT NOT NULL DEFAULT 'Maroc',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

export async function applySqlSchemaWithClient(client) {
  for (const statement of SQLITE_SCHEMA_STATEMENTS) {
    await client.$executeRawUnsafe(statement);
  }
}

export async function applySqlSchemaFallback(databaseUrl) {
  const client = new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });

  try {
    await applySqlSchemaWithClient(client);
    return { ok: true };
  } finally {
    await client.$disconnect();
  }
}
