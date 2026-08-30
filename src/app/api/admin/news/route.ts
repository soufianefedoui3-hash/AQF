import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { saveUploadedFile, validateFile } from "@/lib/upload";
import { serializeNewsArticle } from "@/lib/news";
import { revalidateCms } from "@/lib/revalidate-cms";
import {
  createNews,
  deleteNews,
  getNewsById,
  listNews,
  updateNews,
} from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function parseArticleForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const excerptRaw = formData.get("excerpt");
  const excerpt =
    excerptRaw === null || String(excerptRaw).trim() === ""
      ? null
      : String(excerptRaw).trim();
  const published = formData.get("published") === "true";

  if (title.length < 2) throw new Error("Le titre est requis");
  if (!content) throw new Error("Le contenu est requis");

  return { title, content, excerpt, published };
}

export async function GET(request: NextRequest) {
  try {
    const session = sessionFromRequest(request);
    if (!session) return jsonError("Non autorisé", 401);
    const articles = await listNews(false);
    return NextResponse.json(articles.map(serializeNewsArticle));
  } catch (error) {
    console.error("[cms] news GET failed:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = sessionFromRequest(request);
    if (!session) return jsonError("Non autorisé", 401);

    const formData = await request.formData();
    const data = parseArticleForm(formData);
    const image = formData.get("image");

    let imageUrl: string | null = null;
    if (image instanceof File && image.size > 0) {
      const imageError = validateFile(image, {
        maxSizeMB: 5,
        allowedTypes: ["image/"],
      });
      if (imageError) return jsonError(imageError, 400);
      imageUrl = await saveUploadedFile(image, "news");
    }

    const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
    const result = await createNews({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      imageUrl,
      published: data.published,
    });

    if (!result.ok) return jsonError(result.error, 503);
    revalidateCms();
    return NextResponse.json(serializeNewsArticle(result.data), { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Création impossible",
      400
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = sessionFromRequest(request);
    if (!session) return jsonError("Non autorisé", 401);

    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    if (!id) return jsonError("ID requis", 400);

    const data = parseArticleForm(formData);
    const image = formData.get("image");
    const existing = await getNewsById(id);
    if (!existing) return jsonError("Article introuvable", 404);

    let imageUrl = existing.imageUrl;
    if (image instanceof File && image.size > 0) {
      const imageError = validateFile(image, {
        maxSizeMB: 5,
        allowedTypes: ["image/"],
      });
      if (imageError) return jsonError(imageError, 400);
      imageUrl = await saveUploadedFile(image, "news");
    }

    const result = await updateNews(id, {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      published: data.published,
      imageUrl,
    });

    if (!result.ok) return jsonError(result.error, 503);
    revalidateCms();
    return NextResponse.json(serializeNewsArticle(result.data));
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Mise à jour impossible",
      400
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = sessionFromRequest(request);
    if (!session) return jsonError("Non autorisé", 401);

    const body = await request.json().catch(() => null);
    const id =
      body && typeof body === "object" && "id" in body
        ? String((body as { id?: unknown }).id || "")
        : "";
    if (!id) return jsonError("ID requis", 400);

    const result = await deleteNews(id);
    if (!result.ok) return jsonError(result.error, 503);
    revalidateCms();
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Suppression impossible", 503);
  }
}
