import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPrismaQuery, runPrismaMutation } from "@/lib/prisma-safe";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";
import { revalidateCms } from "@/lib/revalidate-cms";

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  description: z.string().trim().min(1, "Description requise"),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const packs = await withPrismaQuery(
      () =>
        prisma.productPack.findMany({
          orderBy: { order: "asc" },
        }),
      []
    );
    return NextResponse.json(packs);
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
    const body = await request.json();
    const data = schema.parse(body);

    const result = await runPrismaMutation(async () => {
      const maxOrder = await prisma.productPack.aggregate({ _max: { order: true } });
      return prisma.productPack.create({
        data: {
          name: data.name,
          description: data.description,
          order: data.order ?? (maxOrder._max.order ?? -1) + 1,
          active: data.active ?? true,
        },
      });
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    revalidateCms("packs");
    return NextResponse.json(result.data, { status: 201 });
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
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const data = schema.partial().parse(rest);

    const result = await runPrismaMutation(() =>
      prisma.productPack.update({
        where: { id },
        data,
      })
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    revalidateCms("packs");
    return NextResponse.json(result.data);
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
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const result = await runPrismaMutation(() =>
      prisma.productPack.delete({ where: { id } })
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    revalidateCms("packs");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
