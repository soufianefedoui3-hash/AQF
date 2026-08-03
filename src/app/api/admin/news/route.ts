import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPrismaQuery, runPrismaMutation } from "@/lib/prisma-safe";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { saveUploadedFile, validateFile } from "@/lib/upload";
import { serializeNewsArticle } from "@/lib/news";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().trim().min(2, "Le titre est requis"),
  content: z.string().trim().min(1, "Le contenu est requis"),
  excerpt: z.string().trim().optional().nullable(),
  published: z.boolean(),
});

function parseArticleForm(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const excerptRaw = formData.get("excerpt");
  const excerpt =
    excerptRaw === null || String(excerptRaw).trim() === ""
      ? null
      : String(excerptRaw).trim();
  const published = formData.get("published") === "true";

  return articleSchema.parse({ title, content, excerpt, published });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const articles = await withPrismaQuery(
      () =>
        prisma.newsArticle.findMany({
          orderBy: { createdAt: "desc" },
        }),
      []
    );

    return NextResponse.json(articles.map(serializeNewsArticle));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const data = parseArticleForm(formData);
    const image = formData.get("image");

    let imageUrl: string | null = null;
    if (image instanceof File && image.size > 0) {
      const imageError = validateFile(image, {
        maxSizeMB: 5,
        allowedTypes: ["image/"],
      });
      if (imageError) {
        return NextResponse.json({ error: imageError }, { status: 400 });
      }
      imageUrl = await saveUploadedFile(image, "news");
    }

    const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;

    const result = await runPrismaMutation(() =>
      prisma.newsArticle.create({
        data: {
          title: data.title,
          slug,
          content: data.content,
          excerpt: data.excerpt,
          imageUrl,
          published: data.published,
        },
      })
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(serializeNewsArticle(result.data), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const data = parseArticleForm(formData);
    const image = formData.get("image");

    const updateData: {
      title: string;
      content: string;
      excerpt: string | null;
      published: boolean;
      imageUrl?: string;
    } = {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt ?? null,
      published: data.published,
    };

    if (image instanceof File && image.size > 0) {
      const imageError = validateFile(image, {
        maxSizeMB: 5,
        allowedTypes: ["image/"],
      });
      if (imageError) {
        return NextResponse.json({ error: imageError }, { status: 400 });
      }
      updateData.imageUrl = await saveUploadedFile(image, "news");
    }

    const result = await runPrismaMutation(() =>
      prisma.newsArticle.update({
        where: { id },
        data: updateData,
      })
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(serializeNewsArticle(result.data));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const id = body && typeof body === "object" && "id" in body ? String(body.id || "") : "";
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const result = await runPrismaMutation(() =>
      prisma.newsArticle.delete({ where: { id } })
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
