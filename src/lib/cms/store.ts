import { execute, newId, query, queryOne, readyDb } from "@/lib/db";
import { toLocalImageUrl } from "@/lib/placeholder-images";

export type CmsOk<T> = { ok: true; data: T };
export type CmsFail = { ok: false; error: string };
export type CmsResult<T> = CmsOk<T> | CmsFail;

function nowIso(): string {
  return new Date().toISOString();
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value == null) return fallback;
  return String(value);
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

function asDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const parsed = new Date(asString(value));
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function localImage(value: unknown): string | null {
  return toLocalImageUrl(typeof value === "string" ? value : null);
}

function slugifyName(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || `secteur-${newId().slice(0, 8)}`;
}

async function withDb<T>(work: () => T | Promise<T>, fallbackError: string): Promise<CmsResult<T>> {
  try {
    await readyDb();
    const data = await work();
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : fallbackError;
    console.error("[cms]", message);
    return { ok: false, error: message };
  }
}

export type AboutRow = {
  id: string;
  key: string;
  title: string;
  content: string;
  updatedAt: Date;
};

export type TeamRow = {
  id: string;
  name: string;
  role: string;
  skills: string;
  imageUrl: string | null;
  order: number;
  updatedAt: Date;
};

export type SectorRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  order: number;
  updatedAt: Date;
};

export type PageRow = {
  id: string;
  key: string;
  title: string | null;
  content: string;
  updatedAt: Date;
};

export type SettingsRow = {
  id: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  updatedAt: Date;
};

export type CareersRow = {
  id: string;
  title: string;
  content: string;
  email: string;
  phone: string;
  updatedAt: Date;
};

export type GedRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  updatedAt: Date;
};

export type PackRow = {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FormationRow = {
  id: string;
  name: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function mapAbout(row: Record<string, unknown>): AboutRow {
  return {
    id: asString(row.id),
    key: asString(row.key),
    title: asString(row.title),
    content: asString(row.content),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapTeam(row: Record<string, unknown>): TeamRow {
  return {
    id: asString(row.id),
    name: asString(row.name),
    role: asString(row.role),
    skills: asString(row.skills),
    imageUrl: localImage(row.imageUrl),
    order: asNumber(row.order),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapSector(row: Record<string, unknown>): SectorRow {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    name: asString(row.name),
    description: asString(row.description),
    imageUrl: localImage(row.imageUrl),
    order: asNumber(row.order),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapPage(row: Record<string, unknown>): PageRow {
  return {
    id: asString(row.id),
    key: asString(row.key),
    title: asNullableString(row.title),
    content: asString(row.content),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapSettings(row: Record<string, unknown>): SettingsRow {
  return {
    id: asString(row.id, "default"),
    whatsappNumber: asString(row.whatsappNumber),
    contactEmail: asString(row.contactEmail),
    contactPhone: asString(row.contactPhone),
    address: asString(row.address),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapCareers(row: Record<string, unknown>): CareersRow {
  return {
    id: asString(row.id, "default"),
    title: asString(row.title),
    content: asString(row.content),
    email: asString(row.email),
    phone: asString(row.phone),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapGed(row: Record<string, unknown>): GedRow {
  return {
    id: asString(row.id, "default"),
    title: asString(row.title),
    description: asString(row.description),
    imageUrl: localImage(row.imageUrl),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapPack(row: Record<string, unknown>): PackRow {
  return {
    id: asString(row.id),
    name: asString(row.name),
    description: asString(row.description),
    order: asNumber(row.order),
    active: asBool(row.active),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapFormation(row: Record<string, unknown>): FormationRow {
  return {
    id: asString(row.id),
    name: asString(row.name),
    order: asNumber(row.order),
    active: asBool(row.active),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapNews(row: Record<string, unknown>): NewsRow {
  return {
    id: asString(row.id),
    title: asString(row.title),
    slug: asString(row.slug),
    excerpt: asNullableString(row.excerpt),
    content: asString(row.content),
    imageUrl: localImage(row.imageUrl),
    published: asBool(row.published),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

export async function listAboutSections(): Promise<AboutRow[]> {
  await readyDb();
  return query(`SELECT * FROM "AboutSection"`).rows.map(mapAbout);
}

export async function listTeamMembers(): Promise<TeamRow[]> {
  await readyDb();
  return query(
    `SELECT * FROM "TeamMember" ORDER BY "order" ASC`
  ).rows.map(mapTeam);
}

export async function listSectors(): Promise<SectorRow[]> {
  await readyDb();
  return query(`SELECT * FROM "Sector" ORDER BY "order" ASC`).rows.map(mapSector);
}

export async function getSectorRow(slug: string): Promise<SectorRow | null> {
  await readyDb();
  const row = queryOne(`SELECT * FROM "Sector" WHERE "slug" = ?`, [slug]);
  return row ? mapSector(row) : null;
}

export async function listPages(): Promise<PageRow[]> {
  await readyDb();
  return query(`SELECT * FROM "PageContent"`).rows.map(mapPage);
}

export async function getPageRow(key: string): Promise<PageRow | null> {
  await readyDb();
  const row = queryOne(`SELECT * FROM "PageContent" WHERE "key" = ?`, [key]);
  return row ? mapPage(row) : null;
}

export async function getSettingsRow(): Promise<SettingsRow | null> {
  await readyDb();
  const row = queryOne(`SELECT * FROM "SiteSettings" WHERE "id" = ?`, ["default"]);
  return row ? mapSettings(row) : null;
}

export async function getCareersRow(): Promise<CareersRow | null> {
  await readyDb();
  const row = queryOne(`SELECT * FROM "CareersSettings" WHERE "id" = ?`, ["default"]);
  return row ? mapCareers(row) : null;
}

export async function getGedRow(): Promise<GedRow | null> {
  await readyDb();
  const row = queryOne(`SELECT * FROM "GedService" WHERE "id" = ?`, ["default"]);
  return row ? mapGed(row) : null;
}

export async function listPacks(activeOnly = false): Promise<PackRow[]> {
  await readyDb();
  const sql = activeOnly
    ? `SELECT * FROM "ProductPack" WHERE "active" = 1 ORDER BY "order" ASC`
    : `SELECT * FROM "ProductPack" ORDER BY "order" ASC`;
  return query(sql).rows.map(mapPack);
}

export async function listFormations(activeOnly = false): Promise<FormationRow[]> {
  await readyDb();
  const sql = activeOnly
    ? `SELECT * FROM "FormationType" WHERE "active" = 1 ORDER BY "order" ASC`
    : `SELECT * FROM "FormationType" ORDER BY "order" ASC`;
  return query(sql).rows.map(mapFormation);
}

export async function listNews(publishedOnly = false): Promise<NewsRow[]> {
  await readyDb();
  const sql = publishedOnly
    ? `SELECT * FROM "NewsArticle" WHERE "published" = 1 ORDER BY "createdAt" DESC`
    : `SELECT * FROM "NewsArticle" ORDER BY "createdAt" DESC`;
  return query(sql).rows.map(mapNews);
}

export async function getNewsBySlug(
  slug: string,
  publishedOnly = false
): Promise<NewsRow | null> {
  await readyDb();
  const row = publishedOnly
    ? queryOne(
        `SELECT * FROM "NewsArticle" WHERE "slug" = ? AND "published" = 1`,
        [slug]
      )
    : queryOne(`SELECT * FROM "NewsArticle" WHERE "slug" = ?`, [slug]);
  return row ? mapNews(row) : null;
}

export async function getNewsById(id: string): Promise<NewsRow | null> {
  await readyDb();
  const row = queryOne(`SELECT * FROM "NewsArticle" WHERE "id" = ?`, [id]);
  return row ? mapNews(row) : null;
}

export async function loadAdminContent() {
  const [about, team, sectors, careers, settings, pages, ged] = await Promise.all([
    listAboutSections(),
    listTeamMembers(),
    listSectors(),
    getCareersRow(),
    getSettingsRow(),
    listPages(),
    getGedRow(),
  ]);
  return { about, team, sectors, careers, settings, pages, ged };
}

export async function upsertAbout(data: {
  key: string;
  title?: string;
  content?: string;
}): Promise<CmsResult<AboutRow>> {
  return withDb(async () => {
    const key = data.key.trim();
    const existing = queryOne(`SELECT "id" FROM "AboutSection" WHERE "key" = ?`, [key]);
    const id = existing ? asString(existing.id) : newId();
    const title = asString(data.title);
    const content = asString(data.content);
    const updatedAt = nowIso();
    if (existing) {
      execute(
        `UPDATE "AboutSection" SET "title" = ?, "content" = ?, "updatedAt" = ? WHERE "key" = ?`,
        [title, content, updatedAt, key]
      );
    } else {
      execute(
        `INSERT INTO "AboutSection" ("id", "key", "title", "content", "updatedAt") VALUES (?, ?, ?, ?, ?)`,
        [id, key, title, content, updatedAt]
      );
    }
    return mapAbout({ id, key, title, content, updatedAt });
  }, "Impossible d'enregistrer la section");
}

export async function deleteAbout(key: string): Promise<CmsResult<true>> {
  return withDb(async () => {
    const result = execute(`DELETE FROM "AboutSection" WHERE "key" = ?`, [key.trim()]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer la section");
}

export async function upsertTeam(data: {
  id?: string;
  name?: string;
  role?: string;
  skills?: string;
  imageUrl?: unknown;
  order?: number;
}): Promise<CmsResult<TeamRow>> {
  return withDb(async () => {
    const updatedAt = nowIso();
    const imageUrl = localImage(data.imageUrl);
    const name = asString(data.name, "Nouveau membre");
    const role = asString(data.role, "Rôle");
    const skills = asString(data.skills);
    const order = asNumber(data.order);
    if (data.id) {
      const result = execute(
        `UPDATE "TeamMember" SET "name" = ?, "role" = ?, "skills" = ?, "imageUrl" = ?, "order" = ?, "updatedAt" = ? WHERE "id" = ?`,
        [name, role, skills, imageUrl, order, updatedAt, data.id]
      );
      if (!result.ok || result.changes === 0) {
        throw new Error("Membre introuvable");
      }
      return mapTeam({ id: data.id, name, role, skills, imageUrl, order, updatedAt });
    }
    const id = newId();
    execute(
      `INSERT INTO "TeamMember" ("id", "name", "role", "skills", "imageUrl", "order", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, role, skills, imageUrl, order, updatedAt]
    );
    return mapTeam({ id, name, role, skills, imageUrl, order, updatedAt });
  }, "Impossible d'enregistrer le membre");
}

export async function deleteTeam(id: string): Promise<CmsResult<true>> {
  return withDb(async () => {
    const result = execute(`DELETE FROM "TeamMember" WHERE "id" = ?`, [id]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer le membre");
}

export async function upsertSector(data: {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  imageUrl?: unknown;
  order?: number;
}): Promise<CmsResult<SectorRow>> {
  return withDb(async () => {
    const updatedAt = nowIso();
    const payload = {
      name: asString(data.name),
      description: asString(data.description),
      imageUrl: localImage(data.imageUrl),
      order: typeof data.order === "number" ? data.order : 0,
    };

    if (data.slug) {
      const slug = data.slug.trim();
      const existing = queryOne(`SELECT "id" FROM "Sector" WHERE "slug" = ?`, [slug]);
      const id = existing ? asString(existing.id) : newId();
      if (existing) {
        execute(
          `UPDATE "Sector" SET "name" = ?, "description" = ?, "imageUrl" = ?, "order" = ?, "updatedAt" = ? WHERE "slug" = ?`,
          [payload.name, payload.description, payload.imageUrl, payload.order, updatedAt, slug]
        );
      } else {
        execute(
          `INSERT INTO "Sector" ("id", "slug", "name", "description", "imageUrl", "order", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, slug, payload.name, payload.description, payload.imageUrl, payload.order, updatedAt]
        );
      }
      return mapSector({ id, slug, ...payload, updatedAt });
    }

    if (data.id && !String(data.id).startsWith("default-")) {
      execute(
        `UPDATE "Sector" SET "name" = ?, "description" = ?, "imageUrl" = ?, "order" = ?, "updatedAt" = ? WHERE "id" = ?`,
        [payload.name, payload.description, payload.imageUrl, payload.order, updatedAt, data.id]
      );
      const row = queryOne(`SELECT * FROM "Sector" WHERE "id" = ?`, [data.id]);
      if (!row) throw new Error("slug ou id de secteur valide requis");
      return mapSector(row);
    }

    let slug = slugifyName(payload.name || "nouveau-secteur");
    if (queryOne(`SELECT "id" FROM "Sector" WHERE "slug" = ?`, [slug])) {
      slug = `${slug}-${newId().slice(0, 6)}`;
    }
    const id = newId();
    execute(
      `INSERT INTO "Sector" ("id", "slug", "name", "description", "imageUrl", "order", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, slug, payload.name || "Nouveau secteur", payload.description, payload.imageUrl, payload.order, updatedAt]
    );
    return mapSector({ id, slug, ...payload, name: payload.name || "Nouveau secteur", updatedAt });
  }, "Impossible d'enregistrer le secteur");
}

export async function deleteSector(id: string): Promise<CmsResult<true>> {
  return withDb(async () => {
    const result = execute(`DELETE FROM "Sector" WHERE "id" = ?`, [id]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer le secteur");
}

export async function upsertCareers(data: {
  title?: string;
  content?: string;
  email?: string;
  phone?: string;
}): Promise<CmsResult<CareersRow>> {
  return withDb(async () => {
    const updatedAt = nowIso();
    const title = asString(data.title);
    const content = asString(data.content);
    const email = asString(data.email);
    const phone = asString(data.phone);
    const existing = queryOne(`SELECT "id" FROM "CareersSettings" WHERE "id" = ?`, ["default"]);
    if (existing) {
      execute(
        `UPDATE "CareersSettings" SET "title" = ?, "content" = ?, "email" = ?, "phone" = ?, "updatedAt" = ? WHERE "id" = ?`,
        [title, content, email, phone, updatedAt, "default"]
      );
    } else {
      execute(
        `INSERT INTO "CareersSettings" ("id", "title", "content", "email", "phone", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)`,
        ["default", title, content, email, phone, updatedAt]
      );
    }
    return mapCareers({ id: "default", title, content, email, phone, updatedAt });
  }, "Impossible d'enregistrer les carrières");
}

export async function upsertSettings(data: {
  whatsappNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}): Promise<CmsResult<SettingsRow>> {
  return withDb(async () => {
    const updatedAt = nowIso();
    const whatsappNumber = asString(data.whatsappNumber);
    const contactEmail = asString(data.contactEmail);
    const contactPhone = asString(data.contactPhone);
    const address = asString(data.address);
    const existing = queryOne(`SELECT "id" FROM "SiteSettings" WHERE "id" = ?`, ["default"]);
    if (existing) {
      execute(
        `UPDATE "SiteSettings" SET "whatsappNumber" = ?, "contactEmail" = ?, "contactPhone" = ?, "address" = ?, "updatedAt" = ? WHERE "id" = ?`,
        [whatsappNumber, contactEmail, contactPhone, address, updatedAt, "default"]
      );
    } else {
      execute(
        `INSERT INTO "SiteSettings" ("id", "whatsappNumber", "contactEmail", "contactPhone", "address", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)`,
        ["default", whatsappNumber, contactEmail, contactPhone, address, updatedAt]
      );
    }
    return mapSettings({
      id: "default",
      whatsappNumber,
      contactEmail,
      contactPhone,
      address,
      updatedAt,
    });
  }, "Impossible d'enregistrer les paramètres");
}

export async function upsertPage(data: {
  key: string;
  title?: string | null;
  content?: string;
}): Promise<CmsResult<PageRow>> {
  return withDb(async () => {
    const key = data.key.trim();
    const title = data.title == null ? null : asString(data.title);
    const content = asString(data.content);
    const updatedAt = nowIso();
    const existing = queryOne(`SELECT "id" FROM "PageContent" WHERE "key" = ?`, [key]);
    const id = existing ? asString(existing.id) : newId();
    if (existing) {
      execute(
        `UPDATE "PageContent" SET "title" = ?, "content" = ?, "updatedAt" = ? WHERE "key" = ?`,
        [title, content, updatedAt, key]
      );
    } else {
      execute(
        `INSERT INTO "PageContent" ("id", "key", "title", "content", "updatedAt") VALUES (?, ?, ?, ?, ?)`,
        [id, key, title, content, updatedAt]
      );
    }
    return mapPage({ id, key, title, content, updatedAt });
  }, "Impossible d'enregistrer la page");
}

export async function deletePage(key: string): Promise<CmsResult<true>> {
  return withDb(async () => {
    const result = execute(`DELETE FROM "PageContent" WHERE "key" = ?`, [key.trim()]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer la section");
}

export async function upsertGed(data: {
  title?: string;
  description?: string;
  imageUrl?: unknown;
}): Promise<CmsResult<GedRow>> {
  return withDb(async () => {
    const updatedAt = nowIso();
    const title = asString(data.title);
    const description = asString(data.description);
    const imageUrl = localImage(data.imageUrl);
    const existing = queryOne(`SELECT "id" FROM "GedService" WHERE "id" = ?`, ["default"]);
    if (existing) {
      execute(
        `UPDATE "GedService" SET "title" = ?, "description" = ?, "imageUrl" = ?, "updatedAt" = ? WHERE "id" = ?`,
        [title, description, imageUrl, updatedAt, "default"]
      );
    } else {
      execute(
        `INSERT INTO "GedService" ("id", "title", "description", "imageUrl", "updatedAt") VALUES (?, ?, ?, ?, ?)`,
        ["default", title, description, imageUrl, updatedAt]
      );
    }
    return mapGed({ id: "default", title, description, imageUrl, updatedAt });
  }, "Impossible d'enregistrer le service GED");
}

export async function createPack(data: {
  name: string;
  description: string;
  order?: number;
  active?: boolean;
}): Promise<CmsResult<PackRow>> {
  return withDb(async () => {
    const max = queryOne<{ maxOrder: number }>(
      `SELECT MAX("order") AS maxOrder FROM "ProductPack"`
    );
    const order = data.order ?? asNumber(max?.maxOrder, -1) + 1;
    const id = newId();
    const now = nowIso();
    const active = data.active === false ? 0 : 1;
    execute(
      `INSERT INTO "ProductPack" ("id", "name", "description", "order", "active", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.description, order, active, now, now]
    );
    return mapPack({
      id,
      name: data.name,
      description: data.description,
      order,
      active,
      createdAt: now,
      updatedAt: now,
    });
  }, "Impossible de créer le pack");
}

export async function updatePack(
  id: string,
  data: Partial<{ name: string; description: string; order: number; active: boolean }>
): Promise<CmsResult<PackRow>> {
  return withDb(async () => {
    const current = queryOne(`SELECT * FROM "ProductPack" WHERE "id" = ?`, [id]);
    if (!current) throw new Error("Pack introuvable");
    const name = data.name ?? asString(current.name);
    const description = data.description ?? asString(current.description);
    const order = data.order ?? asNumber(current.order);
    const active = data.active === undefined ? asBool(current.active) : data.active;
    const updatedAt = nowIso();
    execute(
      `UPDATE "ProductPack" SET "name" = ?, "description" = ?, "order" = ?, "active" = ?, "updatedAt" = ? WHERE "id" = ?`,
      [name, description, order, active ? 1 : 0, updatedAt, id]
    );
    return mapPack({ ...current, name, description, order, active, updatedAt });
  }, "Impossible de modifier le pack");
}

export async function deletePack(id: string): Promise<CmsResult<true>> {
  return withDb(async () => {
    const result = execute(`DELETE FROM "ProductPack" WHERE "id" = ?`, [id]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer le pack");
}

export async function createFormation(data: {
  name: string;
  order?: number;
  active?: boolean;
}): Promise<CmsResult<FormationRow>> {
  return withDb(async () => {
    const conflict = queryOne(`SELECT "id" FROM "FormationType" WHERE "name" = ?`, [data.name]);
    if (conflict) throw new Error("Une formation avec ce nom existe déjà");
    const max = queryOne<{ maxOrder: number }>(
      `SELECT MAX("order") AS maxOrder FROM "FormationType"`
    );
    const order = data.order ?? asNumber(max?.maxOrder, -1) + 1;
    const id = newId();
    const now = nowIso();
    const active = data.active === false ? 0 : 1;
    execute(
      `INSERT INTO "FormationType" ("id", "name", "order", "active", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.name, order, active, now, now]
    );
    return mapFormation({ id, name: data.name, order, active, createdAt: now, updatedAt: now });
  }, "Impossible de créer la formation");
}

export async function updateFormation(
  id: string,
  data: Partial<{ name: string; order: number; active: boolean }>
): Promise<CmsResult<FormationRow>> {
  return withDb(async () => {
    const current = queryOne(`SELECT * FROM "FormationType" WHERE "id" = ?`, [id]);
    if (!current) throw new Error("Formation introuvable");
    const name = data.name ?? asString(current.name);
    if (data.name) {
      const conflict = queryOne(
        `SELECT "id" FROM "FormationType" WHERE "name" = ? AND "id" != ?`,
        [name, id]
      );
      if (conflict) throw new Error("Une formation avec ce nom existe déjà");
    }
    const order = data.order ?? asNumber(current.order);
    const active = data.active === undefined ? asBool(current.active) : data.active;
    const updatedAt = nowIso();
    execute(
      `UPDATE "FormationType" SET "name" = ?, "order" = ?, "active" = ?, "updatedAt" = ? WHERE "id" = ?`,
      [name, order, active ? 1 : 0, updatedAt, id]
    );
    return mapFormation({ ...current, name, order, active, updatedAt });
  }, "Impossible de modifier la formation");
}

export async function deleteFormation(id: string): Promise<CmsResult<true>> {
  return withDb(async () => {
    const result = execute(`DELETE FROM "FormationType" WHERE "id" = ?`, [id]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer la formation");
}

export async function createNews(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  published: boolean;
}): Promise<CmsResult<NewsRow>> {
  return withDb(async () => {
    const id = newId();
    const now = nowIso();
    const imageUrl = localImage(data.imageUrl);
    execute(
      `INSERT INTO "NewsArticle" ("id", "title", "slug", "excerpt", "content", "imageUrl", "published", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.slug,
        data.excerpt ?? null,
        data.content,
        imageUrl,
        data.published ? 1 : 0,
        now,
        now,
      ]
    );
    return mapNews({
      id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      imageUrl,
      published: data.published,
      createdAt: now,
      updatedAt: now,
    });
  }, "Impossible de créer l'article");
}

export async function updateNews(
  id: string,
  data: {
    title: string;
    content: string;
    excerpt?: string | null;
    published: boolean;
    imageUrl?: string | null;
  }
): Promise<CmsResult<NewsRow>> {
  return withDb(async () => {
    const current = queryOne(`SELECT * FROM "NewsArticle" WHERE "id" = ?`, [id]);
    if (!current) throw new Error("Article introuvable");
    const updatedAt = nowIso();
    const imageUrl =
      data.imageUrl === undefined ? localImage(current.imageUrl) : localImage(data.imageUrl);
    execute(
      `UPDATE "NewsArticle" SET "title" = ?, "content" = ?, "excerpt" = ?, "published" = ?, "imageUrl" = ?, "updatedAt" = ? WHERE "id" = ?`,
      [
        data.title,
        data.content,
        data.excerpt ?? null,
        data.published ? 1 : 0,
        imageUrl,
        updatedAt,
        id,
      ]
    );
    return mapNews({
      ...current,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt ?? null,
      published: data.published,
      imageUrl,
      updatedAt,
    });
  }, "Impossible de modifier l'article");
}

export async function deleteNews(id: string): Promise<CmsResult<true>> {
  return withDb(async () => {
    const result = execute(`DELETE FROM "NewsArticle" WHERE "id" = ?`, [id]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer l'article");
}

