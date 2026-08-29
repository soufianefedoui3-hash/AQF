import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import {
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_CAREERS_SETTINGS,
  DEFAULT_FORMATION_TYPES,
  DEFAULT_GED_SERVICE,
  DEFAULT_NEWS_ARTICLE,
  DEFAULT_PAGE_CONTENT,
  DEFAULT_PRODUCT_PACKS,
  DEFAULT_SECTORS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TEAM_MEMBERS,
} from "@/lib/seed-data";
import {
  PLACEHOLDER_GENERIC,
  isAllowedLocalImageUrl,
} from "@/lib/placeholder-images";

export interface SeedOptions {
  includeAdmin?: boolean;
}

function needsImageRepair(url: string | null | undefined): boolean {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return true;
  return !isAllowedLocalImageUrl(trimmed);
}

/** Strip every external/disallowed image URL; keep only /uploads, /placeholders, /brand. */
export async function repairBrokenSectorImages(
  client: PrismaClient
): Promise<number> {
  let repaired = 0;

  for (const sector of DEFAULT_SECTORS) {
    const existing = await client.sector.findUnique({
      where: { slug: sector.slug },
      select: { id: true, imageUrl: true },
    });
    if (!existing) continue;
    if (!needsImageRepair(existing.imageUrl)) continue;

    await client.sector.update({
      where: { id: existing.id },
      data: { imageUrl: sector.imageUrl },
    });
    repaired += 1;
  }

  const leftoverSectors = await client.sector.findMany({
    select: { id: true, imageUrl: true },
  });
  for (const row of leftoverSectors) {
    if (!needsImageRepair(row.imageUrl)) continue;
    await client.sector.update({
      where: { id: row.id },
      data: { imageUrl: PLACEHOLDER_GENERIC },
    });
    repaired += 1;
  }

  const clearExternal = async (
    rows: Array<{ id: string; imageUrl: string | null }>,
    update: (id: string) => Promise<unknown>
  ) => {
    for (const row of rows) {
      if (!row.imageUrl?.trim()) continue;
      if (isAllowedLocalImageUrl(row.imageUrl)) continue;
      await update(row.id);
      repaired += 1;
    }
  };

  await clearExternal(
    await client.newsArticle.findMany({ select: { id: true, imageUrl: true } }),
    (id) => client.newsArticle.update({ where: { id }, data: { imageUrl: null } })
  );

  await clearExternal(
    await client.teamMember.findMany({ select: { id: true, imageUrl: true } }),
    (id) => client.teamMember.update({ where: { id }, data: { imageUrl: null } })
  );

  const ged = await client.gedService.findUnique({
    where: { id: "default" },
    select: { id: true, imageUrl: true },
  });
  if (ged?.imageUrl && !isAllowedLocalImageUrl(ged.imageUrl)) {
    await client.gedService.update({
      where: { id: "default" },
      data: { imageUrl: null },
    });
    repaired += 1;
  }

  return repaired;
}

function getAdminCredentials() {
  let email = (process.env.ADMIN_EMAIL || "admin@aqf.ma").trim();
  let password = (process.env.ADMIN_PASSWORD || "Admin@AQF2026").trim();

  if (
    (email.startsWith('"') && email.endsWith('"')) ||
    (email.startsWith("'") && email.endsWith("'"))
  ) {
    email = email.slice(1, -1).trim();
  }

  if (
    (password.startsWith('"') && password.endsWith('"')) ||
    (password.startsWith("'") && password.endsWith("'"))
  ) {
    password = password.slice(1, -1).trim();
  }

  return {
    email: email.toLowerCase(),
    password,
  };
}

export async function needsDefaultSeed(client: PrismaClient): Promise<boolean> {
  try {
    const settingsCount = await client.siteSettings.count();
    return settingsCount === 0;
  } catch {
    return true;
  }
}

export async function seedDefaultContent(
  client: PrismaClient,
  options: SeedOptions = {}
): Promise<void> {
  const includeAdmin = options.includeAdmin !== false;

  if (includeAdmin) {
    const { email, password } = getAdminCredentials();
    const passwordHash = await hashPassword(password);

    await client.admin.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
  }

  await repairBrokenSectorImages(client);

  for (const sector of DEFAULT_SECTORS) {
    await client.sector.upsert({
      where: { slug: sector.slug },
      update: {},
      create: sector,
    });
  }

  for (let i = 0; i < DEFAULT_FORMATION_TYPES.length; i++) {
    const name = DEFAULT_FORMATION_TYPES[i];
    await client.formationType.upsert({
      where: { name },
      // Preserve active/order changes from admin.
      update: {},
      create: { name, order: i, active: true },
    });
  }

  for (const section of DEFAULT_ABOUT_SECTIONS) {
    await client.aboutSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }

  const existingTeam = await client.teamMember.count();
  if (existingTeam === 0) {
    await client.teamMember.createMany({
      data: DEFAULT_TEAM_MEMBERS.map((member) => ({ ...member })),
    });
  }

  await client.careersSettings.upsert({
    where: { id: DEFAULT_CAREERS_SETTINGS.id },
    update: {},
    create: DEFAULT_CAREERS_SETTINGS,
  });

  await client.siteSettings.upsert({
    where: { id: DEFAULT_SITE_SETTINGS.id },
    update: {},
    create: DEFAULT_SITE_SETTINGS,
  });

  for (const page of DEFAULT_PAGE_CONTENT) {
    await client.pageContent.upsert({
      where: { key: page.key },
      update: {},
      create: page,
    });
  }

  await client.gedService.upsert({
    where: { id: DEFAULT_GED_SERVICE.id },
    update: {},
    create: DEFAULT_GED_SERVICE,
  });

  const existingNews = await client.newsArticle.count();
  if (existingNews === 0) {
    await client.newsArticle.create({
      data: DEFAULT_NEWS_ARTICLE,
    });
  }

  const existingPacks = await client.productPack.count();
  if (existingPacks === 0) {
    await client.productPack.createMany({
      data: DEFAULT_PRODUCT_PACKS.map((pack) => ({ ...pack })),
    });
  }
}
