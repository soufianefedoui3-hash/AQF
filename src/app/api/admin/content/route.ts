import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import { DEFAULT_ADMIN_CONTENT } from "@/lib/seed-data";
import { revalidateCms } from "@/lib/revalidate-cms";
import {
  deleteAbout,
  deleteCustomPage,
  deletePage,
  deleteSector,
  deleteSitePage,
  deleteTeam,
  loadAdminContent,
  upsertAbout,
  upsertCareers,
  upsertCustomPage,
  upsertGed,
  upsertPage,
  upsertSector,
  upsertLabel,
  upsertPageLayout,
  upsertSettings,
  upsertSitePage,
  upsertTeam,
} from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const session = sessionFromRequest(request);
    if (!session) return jsonError("Non autorisé", 401);

    const data = await loadAdminContent();
    return NextResponse.json({
      about: data.about.length > 0 ? data.about : DEFAULT_ADMIN_CONTENT.about,
      team: data.team,
      sectors:
        data.sectors.length > 0 ? data.sectors : DEFAULT_ADMIN_CONTENT.sectors,
      careers: data.careers || DEFAULT_ADMIN_CONTENT.careers,
      settings: data.settings || DEFAULT_ADMIN_CONTENT.settings,
      pages: data.pages.length > 0 ? data.pages : DEFAULT_ADMIN_CONTENT.pages,
      ged: data.ged || DEFAULT_ADMIN_CONTENT.ged,
      labels: { ...DEFAULT_ADMIN_CONTENT.labels, ...data.labels },
      customPages: Array.isArray(data.customPages) ? data.customPages : [],
      sitePages: Array.isArray(data.sitePages)
        ? data.sitePages
        : DEFAULT_ADMIN_CONTENT.sitePages,
      layouts:
        data.layouts && typeof data.layouts === "object" ? data.layouts : {},
    });
  } catch (error) {
    console.error("[cms] admin GET failed:", error);
    return NextResponse.json({
      ...DEFAULT_ADMIN_CONTENT,
      labels: { ...DEFAULT_ADMIN_CONTENT.labels },
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = sessionFromRequest(request);
    if (!session) return jsonError("Non autorisé", 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("JSON invalide", 400);
    }

    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const section = String(record.section || "");
    const data =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : null;

    if (!section || !data) {
      return jsonError("section et data sont requis", 400);
    }

    let result;
    switch (section) {
      case "about":
        if (!data.key) return jsonError("Clé de section requise", 400);
        result = await upsertAbout({
          key: String(data.key),
          title: data.title == null ? "" : String(data.title),
          content: data.content == null ? "" : String(data.content),
        });
        break;
      case "about-delete":
        if (!data.key) return jsonError("Clé de section requise", 400);
        result = await deleteAbout(String(data.key));
        break;
      case "team":
        result = await upsertTeam({
          id: data.id ? String(data.id) : undefined,
          name: data.name == null ? undefined : String(data.name),
          role: data.role == null ? undefined : String(data.role),
          skills: data.skills == null ? undefined : String(data.skills),
          imageUrl: data.imageUrl,
          order: typeof data.order === "number" ? data.order : undefined,
        });
        break;
      case "team-delete":
        if (!data.id) return jsonError("ID requis", 400);
        result = await deleteTeam(String(data.id));
        break;
      case "sector":
        result = await upsertSector({
          id: data.id ? String(data.id) : undefined,
          slug: data.slug ? String(data.slug) : undefined,
          name: data.name == null ? undefined : String(data.name),
          description:
            data.description == null ? undefined : String(data.description),
          imageUrl: data.imageUrl,
          order: typeof data.order === "number" ? data.order : undefined,
        });
        break;
      case "sector-delete":
        if (!data.id) return jsonError("ID requis", 400);
        result = await deleteSector(String(data.id));
        break;
      case "careers":
        result = await upsertCareers({
          title: data.title == null ? undefined : String(data.title),
          content: data.content == null ? undefined : String(data.content),
          email: data.email == null ? undefined : String(data.email),
          phone: data.phone == null ? undefined : String(data.phone),
        });
        break;
      case "settings":
        result = await upsertSettings({
          whatsappNumber:
            data.whatsappNumber == null ? undefined : String(data.whatsappNumber),
          contactEmail:
            data.contactEmail == null ? undefined : String(data.contactEmail),
          contactPhone:
            data.contactPhone == null ? undefined : String(data.contactPhone),
          address: data.address == null ? undefined : String(data.address),
        });
        break;
      case "page":
        if (!data.key) return jsonError("Clé de page requise", 400);
        result = await upsertPage({
          key: String(data.key),
          title: data.title == null ? null : String(data.title),
          content: data.content == null ? "" : String(data.content),
        });
        break;
      case "page-delete":
        if (!data.key) return jsonError("Clé de page requise", 400);
        result = await deletePage(String(data.key));
        break;
      case "label":
        if (!data.id) return jsonError("Identifiant de libellé requis", 400);
        result = await upsertLabel({
          id: String(data.id),
          label: data.label == null ? "" : String(data.label),
        });
        break;
      case "labels": {
        const items = Array.isArray(data.items) ? data.items : [];
        const saved: Array<{ id: string; label: string }> = [];
        let batchError: { ok: false; error: string } | null = null;
        for (const item of items) {
          if (!item || typeof item !== "object") continue;
          const row = item as Record<string, unknown>;
          if (!row.id) continue;
          const upserted = await upsertLabel({
            id: String(row.id),
            label: row.label == null ? "" : String(row.label),
          });
          if (!upserted.ok) {
            batchError = upserted;
            break;
          }
          saved.push({
            id: String(row.id),
            label: row.label == null ? "" : String(row.label),
          });
        }
        result = batchError ?? { ok: true as const, data: saved };
        break;
      }
      case "ged":
        result = await upsertGed({
          title: data.title == null ? undefined : String(data.title),
          description:
            data.description == null ? undefined : String(data.description),
          imageUrl: data.imageUrl,
        });
        break;
      case "custom-page":
        result = await upsertCustomPage({
          id: data.id ? String(data.id) : undefined,
          slug: data.slug == null ? undefined : String(data.slug),
          title: data.title == null ? undefined : String(data.title),
          showInNav:
            data.showInNav === undefined ? undefined : Boolean(data.showInNav),
          sortOrder:
            typeof data.sortOrder === "number" ? data.sortOrder : undefined,
          blocks: data.blocks,
        });
        break;
      case "custom-page-delete": {
        const id = data.id ? String(data.id).trim() : "";
        if (!id) return jsonError("ID requis", 400);
        result = await deleteCustomPage(id);
        break;
      }
      case "site-page":
        if (!data.id) return jsonError("Identifiant de page requis", 400);
        result = await upsertSitePage({
          id: String(data.id),
          label: data.label == null ? undefined : String(data.label),
          href: data.href == null ? undefined : String(data.href),
          showInNav:
            data.showInNav === undefined ? undefined : Boolean(data.showInNav),
          sortOrder:
            typeof data.sortOrder === "number" ? data.sortOrder : undefined,
        });
        break;
      case "site-page-delete": {
        const id = data.id ? String(data.id).trim() : "";
        if (!id) return jsonError("ID requis", 400);
        result = await deleteSitePage(id);
        break;
      }
      case "layout":
        if (!data.tabId) return jsonError("Onglet requis", 400);
        result = await upsertPageLayout({
          tabId: String(data.tabId),
          blocks: data.blocks,
        });
        break;
      default:
        return jsonError("Section invalide", 400);
    }

    if (!result.ok) {
      return jsonError(result.error, 503);
    }

    const extraPaths: string[] = [];
    if (
      (section === "custom-page" || section === "custom-page-delete") &&
      result.data &&
      typeof result.data === "object" &&
      "slug" in result.data &&
      typeof (result.data as { slug?: unknown }).slug === "string"
    ) {
      extraPaths.push(`/${(result.data as { slug: string }).slug}`);
    }
    if (section === "custom-page" && typeof data.slug === "string" && data.slug.trim()) {
      extraPaths.push(`/${data.slug.trim()}`);
    }
    if (
      (section === "site-page" || section === "site-page-delete") &&
      result.data &&
      typeof result.data === "object" &&
      "href" in result.data &&
      typeof (result.data as { href?: unknown }).href === "string" &&
      (result.data as { href: string }).href.trim()
    ) {
      extraPaths.push((result.data as { href: string }).href.trim());
    }
    revalidateCms(extraPaths);
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[cms] admin PUT failed:", error);
    return jsonError(
      error instanceof Error ? error.message : "Enregistrement impossible",
      503
    );
  }
}
