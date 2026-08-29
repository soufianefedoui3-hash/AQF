import { execute, ensureSchema, getDb, newId, query, queryOne, readyDb } from "@/lib/db";

export type LeadType =
  | "consultation"
  | "accompagnement"
  | "formation"
  | "audit"
  | "web-service";

export type StoreOk<T> = { ok: true; data: T };
export type StoreFail = { ok: false; error: string };
export type StoreResult<T> = StoreOk<T> | StoreFail;

const LEAD_TABLES: Record<LeadType, string> = {
  consultation: "ConsultationRequest",
  accompagnement: "AccompagnementRequest",
  formation: "FormationRequest",
  audit: "AuditRequest",
  "web-service": "WebServiceRequest",
};

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

function asCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asIso(value: unknown): string {
  const parsed = new Date(asString(value));
  return Number.isNaN(parsed.getTime()) ? nowIso() : parsed.toISOString();
}

function parseNorms(raw: unknown): string[] | string {
  const text = asString(raw);
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : text;
  } catch {
    return text;
  }
}

async function withDb<T>(work: () => T | Promise<T>, fallbackError: string): Promise<StoreResult<T>> {
  try {
    try {
      await readyDb();
    } catch {
      /* seed is optional for lead inserts */
    }
    if (!getDb() && !ensureSchema()) {
      return { ok: false, error: fallbackError };
    }
    return { ok: true, data: await work() };
  } catch (error) {
    const message = error instanceof Error ? error.message : fallbackError;
    console.error("[leads]", message);
    return { ok: false, error: message };
  }
}

function mapRow(row: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    mapped[key] = value;
  }
  if ("createdAt" in mapped) {
    mapped.createdAt = asIso(mapped.createdAt);
  }
  return mapped;
}

function tableCount(table: string): number {
  const row = queryOne<{ count: unknown }>(`SELECT COUNT(*) AS count FROM "${table}"`);
  return asCount(row?.count);
}

export async function insertConsultation(data: {
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  message?: string | null;
}): Promise<StoreResult<{ id: string }>> {
  return withDb(() => {
    const id = newId();
    const result = execute(
      `INSERT INTO "ConsultationRequest" ("id", "name", "email", "phone", "company", "message", "status", "createdAt")
       VALUES (?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        id,
        data.name,
        data.email,
        data.phone,
        data.company || null,
        data.message || null,
        nowIso(),
      ]
    );
    if (!result.ok) throw new Error(result.error || "Enregistrement impossible");
    return { id };
  }, "Impossible d'enregistrer la consultation");
}

export async function insertAccompagnement(data: {
  sector: string;
  entityName: string;
  responsableName: string;
  phone: string;
  email: string;
  entityDetails: string;
  requestType: string;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
}): Promise<StoreResult<{ id: string }>> {
  return withDb(() => {
    const id = newId();
    const result = execute(
      `INSERT INTO "AccompagnementRequest" (
        "id", "sector", "entityName", "responsableName", "phone", "email",
        "entityDetails", "requestType", "appointmentDate", "appointmentTime", "status", "createdAt"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        id,
        data.sector,
        data.entityName,
        data.responsableName,
        data.phone,
        data.email,
        data.entityDetails,
        data.requestType,
        data.appointmentDate || null,
        data.appointmentTime || null,
        nowIso(),
      ]
    );
    if (!result.ok) throw new Error(result.error || "Enregistrement impossible");
    return { id };
  }, "Impossible d'enregistrer la demande d'accompagnement");
}

export async function insertFormation(data: {
  trainingType: string;
  audienceType?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message?: string | null;
}): Promise<StoreResult<{ id: string }>> {
  return withDb(() => {
    const id = newId();
    const result = execute(
      `INSERT INTO "FormationRequest" (
        "id", "trainingType", "audienceType", "contactName", "contactEmail", "contactPhone", "message", "status", "createdAt"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        id,
        data.trainingType,
        data.audienceType || null,
        data.contactName,
        data.contactEmail,
        data.contactPhone,
        data.message || null,
        nowIso(),
      ]
    );
    if (!result.ok) throw new Error(result.error || "Enregistrement impossible");
    return { id };
  }, "Impossible d'enregistrer l'inscription formation");
}

export async function insertAudit(data: {
  norms: string;
  customNorm?: string | null;
  auditNature: string;
  customAuditNature?: string | null;
  companyName: string;
  companyActivity: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}): Promise<StoreResult<{ id: string }>> {
  return withDb(() => {
    const id = newId();
    const result = execute(
      `INSERT INTO "AuditRequest" (
        "id", "norms", "customNorm", "auditNature", "customAuditNature",
        "companyName", "companyActivity", "contactName", "contactEmail", "contactPhone", "status", "createdAt"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        id,
        data.norms,
        data.customNorm || null,
        data.auditNature,
        data.customAuditNature || null,
        data.companyName,
        data.companyActivity,
        data.contactName,
        data.contactEmail,
        data.contactPhone,
        nowIso(),
      ]
    );
    if (!result.ok) throw new Error(result.error || "Enregistrement impossible");
    return { id };
  }, "Impossible d'enregistrer la demande d'audit");
}

export async function insertWebService(data: {
  responsableName: string;
  companyName: string;
  phone: string;
  requestInfo?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
}): Promise<StoreResult<{ id: string }>> {
  return withDb(() => {
    const id = newId();
    const result = execute(
      `INSERT INTO "WebServiceRequest" (
        "id", "responsableName", "companyName", "phone", "requestInfo",
        "appointmentDate", "appointmentTime", "status", "createdAt"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        id,
        data.responsableName,
        data.companyName,
        data.phone,
        data.requestInfo || null,
        data.appointmentDate || null,
        data.appointmentTime || null,
        nowIso(),
      ]
    );
    if (!result.ok) throw new Error(result.error || "Enregistrement impossible");
    return { id };
  }, "Impossible d'enregistrer la demande web");
}

export async function insertApplication(data: {
  positionName: string;
  applicantName: string;
  email: string;
  phone?: string | null;
  cvPath: string;
  letterPath: string;
}): Promise<StoreResult<{ id: string }>> {
  return withDb(() => {
    const id = newId();
    const result = execute(
      `INSERT INTO "JobApplication" (
        "id", "positionName", "applicantName", "email", "phone", "cvPath", "letterPath", "status", "createdAt"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        id,
        data.positionName,
        data.applicantName,
        data.email,
        data.phone || null,
        data.cvPath,
        data.letterPath,
        nowIso(),
      ]
    );
    if (!result.ok) throw new Error(result.error || "Enregistrement impossible");
    return { id };
  }, "Impossible d'enregistrer la candidature");
}

export async function listLeads(type: string = "all"): Promise<Record<string, unknown>[]> {
  const ready = await readyDb();
  if (!ready) return [];

  const items: Record<string, unknown>[] = [];
  const wanted = type === "all" || type in LEAD_TABLES ? type : "all";

  if (wanted === "all" || wanted === "consultation") {
    for (const row of query(`SELECT * FROM "ConsultationRequest" ORDER BY "createdAt" DESC`).rows) {
      items.push({ ...mapRow(row), type: "consultation" });
    }
  }
  if (wanted === "all" || wanted === "accompagnement") {
    for (const row of query(`SELECT * FROM "AccompagnementRequest" ORDER BY "createdAt" DESC`).rows) {
      items.push({ ...mapRow(row), type: "accompagnement" });
    }
  }
  if (wanted === "all" || wanted === "formation") {
    for (const row of query(`SELECT * FROM "FormationRequest" ORDER BY "createdAt" DESC`).rows) {
      items.push({ ...mapRow(row), type: "formation" });
    }
  }
  if (wanted === "all" || wanted === "audit") {
    for (const row of query(`SELECT * FROM "AuditRequest" ORDER BY "createdAt" DESC`).rows) {
      const mapped = mapRow(row);
      mapped.norms = parseNorms(mapped.norms);
      items.push({ ...mapped, type: "audit" });
    }
  }
  if (wanted === "all" || wanted === "web-service") {
    for (const row of query(`SELECT * FROM "WebServiceRequest" ORDER BY "createdAt" DESC`).rows) {
      items.push({ ...mapRow(row), type: "web-service" });
    }
  }

  items.sort(
    (a, b) =>
      new Date(asString(b.createdAt)).getTime() -
      new Date(asString(a.createdAt)).getTime()
  );
  return items;
}

export async function updateLeadStatus(
  type: string,
  id: string,
  status: string
): Promise<StoreResult<true>> {
  const table = LEAD_TABLES[type as LeadType];
  if (!table) {
    return { ok: false, error: "Type invalide" };
  }

  return withDb(() => {
    const result = execute(`UPDATE "${table}" SET "status" = ? WHERE "id" = ?`, [
      status,
      id,
    ]);
    if (!result.ok) throw new Error(result.error || "Mise à jour impossible");
    if (result.changes === 0) throw new Error("Enregistrement introuvable");
    return true as const;
  }, "Impossible de mettre à jour le statut");
}

export async function listApplications(): Promise<Record<string, unknown>[]> {
  const ready = await readyDb();
  if (!ready) return [];
  return query(`SELECT * FROM "JobApplication" ORDER BY "createdAt" DESC`).rows.map((row) => ({
    id: asString(row.id),
    positionName: asString(row.positionName),
    applicantName: asString(row.applicantName),
    email: asString(row.email),
    phone: asNullableString(row.phone),
    cvPath: asString(row.cvPath),
    letterPath: asString(row.letterPath),
    status: asString(row.status, "new"),
    createdAt: asIso(row.createdAt),
  }));
}

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<StoreResult<true>> {
  return withDb(() => {
    const result = execute(`UPDATE "JobApplication" SET "status" = ? WHERE "id" = ?`, [
      status,
      id,
    ]);
    if (!result.ok) throw new Error(result.error || "Mise à jour impossible");
    if (result.changes === 0) throw new Error("Candidature introuvable");
    return true as const;
  }, "Impossible de mettre à jour la candidature");
}

export async function deleteApplication(id: string): Promise<StoreResult<true>> {
  return withDb(() => {
    const result = execute(`DELETE FROM "JobApplication" WHERE "id" = ?`, [id]);
    if (!result.ok) throw new Error(result.error || "Suppression impossible");
    return true as const;
  }, "Impossible de supprimer la candidature");
}

export async function getLeadStats() {
  const empty = {
    stats: {
      totalLeads: 0,
      consultations: 0,
      accompagnements: 0,
      formations: 0,
      audits: 0,
      webServices: 0,
      applications: 0,
    },
    recent: [] as Array<{ id: string; name: string; email: string; createdAt: string }>,
  };

  try {
    const ready = await readyDb();
    if (!ready) return empty;

    const consultations = tableCount("ConsultationRequest");
    const accompagnements = tableCount("AccompagnementRequest");
    const formations = tableCount("FormationRequest");
    const audits = tableCount("AuditRequest");
    const webServices = tableCount("WebServiceRequest");
    const applications = tableCount("JobApplication");

    const recent = query(
      `SELECT "id", "name", "email", "createdAt" FROM "ConsultationRequest" ORDER BY "createdAt" DESC LIMIT 5`
    ).rows.map((row) => ({
      id: asString(row.id),
      name: asString(row.name),
      email: asString(row.email),
      createdAt: asIso(row.createdAt),
    }));

    return {
      stats: {
        totalLeads: consultations + accompagnements + formations + audits + webServices,
        consultations,
        accompagnements,
        formations,
        audits,
        webServices,
        applications,
      },
      recent,
    };
  } catch (error) {
    console.error("[leads] stats failed:", error);
    return empty;
  }
}
