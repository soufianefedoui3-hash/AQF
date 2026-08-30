import { getAdminCredentials } from "@/lib/env-credentials";
import { hashPassword } from "@/lib/password";
import {
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_CAREERS_SETTINGS,
  DEFAULT_FORMATION_TYPES,
  DEFAULT_GED_SERVICE,
  DEFAULT_PAGE_CONTENT,
  DEFAULT_PRODUCT_PACKS,
  DEFAULT_CONTENT_LABELS,
  DEFAULT_SECTORS,
  DEFAULT_SITE_PAGES,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/seed-data";
import { execute, getDb, newId, queryOne } from "./client";

function tableCount(table: string): number {
  const row = queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM "${table}"`
  );
  return Number(row?.count ?? 0);
}

async function seedAdmin(): Promise<void> {
  if (tableCount("Admin") > 0) return;

  const { email, password } = getAdminCredentials();
  const passwordHash = await hashPassword(password);
  execute(
    `INSERT INTO "Admin" ("id", "email", "passwordHash") VALUES (?, ?, ?)`,
    [newId(), email, passwordHash]
  );
}

function seedIfEmpty(
  table: string,
  insert: () => void
): void {
  if (tableCount(table) === 0) {
    insert();
  }
}

/**
 * Idempotent defaults. Never overwrites CMS rows an admin already saved.
 */
export async function seedDefaults(): Promise<boolean> {
  try {
    if (!getDb()) return false;

    await seedAdmin();

    seedIfEmpty("SiteSettings", () => {
      execute(
        `INSERT INTO "SiteSettings" ("id", "whatsappNumber", "contactEmail", "contactPhone", "address")
         VALUES (?, ?, ?, ?, ?)`,
        [
          DEFAULT_SITE_SETTINGS.id,
          DEFAULT_SITE_SETTINGS.whatsappNumber,
          DEFAULT_SITE_SETTINGS.contactEmail,
          DEFAULT_SITE_SETTINGS.contactPhone,
          DEFAULT_SITE_SETTINGS.address,
        ]
      );
    });

    seedIfEmpty("CareersSettings", () => {
      execute(
        `INSERT INTO "CareersSettings" ("id", "title", "content", "email", "phone")
         VALUES (?, ?, ?, ?, ?)`,
        [
          DEFAULT_CAREERS_SETTINGS.id,
          DEFAULT_CAREERS_SETTINGS.title,
          DEFAULT_CAREERS_SETTINGS.content,
          DEFAULT_CAREERS_SETTINGS.email,
          DEFAULT_CAREERS_SETTINGS.phone,
        ]
      );
    });

    seedIfEmpty("GedService", () => {
      execute(
        `INSERT INTO "GedService" ("id", "title", "description", "imageUrl") VALUES (?, ?, ?, ?)`,
        [
          DEFAULT_GED_SERVICE.id,
          DEFAULT_GED_SERVICE.title,
          DEFAULT_GED_SERVICE.description,
          DEFAULT_GED_SERVICE.imageUrl,
        ]
      );
    });

    seedIfEmpty("PageContent", () => {
      for (const page of DEFAULT_PAGE_CONTENT) {
        execute(
          `INSERT INTO "PageContent" ("id", "key", "title", "content") VALUES (?, ?, ?, ?)`,
          [newId(), page.key, page.title, page.content]
        );
      }
    });

    seedIfEmpty("AboutSection", () => {
      for (const section of DEFAULT_ABOUT_SECTIONS) {
        execute(
          `INSERT INTO "AboutSection" ("id", "key", "title", "content") VALUES (?, ?, ?, ?)`,
          [newId(), section.key, section.title, section.content]
        );
      }
    });

    seedIfEmpty("Sector", () => {
      for (const sector of DEFAULT_SECTORS) {
        execute(
          `INSERT INTO "Sector" ("id", "slug", "name", "description", "imageUrl", "order")
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newId(),
            sector.slug,
            sector.name,
            sector.description,
            sector.imageUrl,
            sector.order,
          ]
        );
      }
    });

    seedIfEmpty("FormationType", () => {
      DEFAULT_FORMATION_TYPES.forEach((name, order) => {
        execute(
          `INSERT INTO "FormationType" ("id", "name", "order", "active") VALUES (?, ?, ?, 1)`,
          [newId(), name, order]
        );
      });
    });

    seedIfEmpty("SitePage", () => {
      const now = new Date().toISOString();
      for (const page of DEFAULT_SITE_PAGES) {
        execute(
          `INSERT INTO "SitePage"
            ("id", "label", "href", "showInNav", "sortOrder", "kind", "adminTab", "deleted", "updatedAt")
           VALUES (?, ?, ?, ?, ?, 'system', ?, 0, ?)`,
          [
            page.id,
            page.label,
            page.href,
            page.showInNav ? 1 : 0,
            page.sortOrder,
            page.adminTab ? 1 : 0,
            now,
          ]
        );
      }
    });

    seedIfEmpty("ContentLabel", () => {
      const now = new Date().toISOString();
      for (const [id, label] of Object.entries(DEFAULT_CONTENT_LABELS)) {
        execute(
          `INSERT INTO "ContentLabel" ("id", "label", "updatedAt") VALUES (?, ?, ?)`,
          [id, label, now]
        );
      }
    });

    seedIfEmpty("ProductPack", () => {
      for (const pack of DEFAULT_PRODUCT_PACKS) {
        execute(
          `INSERT INTO "ProductPack" ("id", "name", "description", "order", "active")
           VALUES (?, ?, ?, ?, 1)`,
          [newId(), pack.name, pack.description, pack.order]
        );
      }
    });

    return true;
  } catch (error) {
    console.error(
      "[db] seedDefaults failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

let seedPromise: Promise<boolean> | null = null;

export function ensureSeeded(): Promise<boolean> {
  if (!seedPromise) {
    seedPromise = seedDefaults().catch((error) => {
      seedPromise = null;
      console.error("[db] ensureSeeded failed:", error);
      return false;
    });
  }
  return seedPromise;
}
