import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPrismaQuery } from "@/lib/prisma-safe";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formations = await withPrismaQuery(
      () =>
        prisma.formationType.findMany({
          orderBy: { order: "asc" },
        }),
      []
    );
    return NextResponse.json(formations);
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

    const maxOrder = await prisma.formationType.aggregate({ _max: { order: true } });

    const formation = await prisma.formationType.create({
      data: {
        name: data.name,
        order: data.order ?? (maxOrder._max.order ?? -1) + 1,
        active: data.active ?? true,
      },
    });

    return NextResponse.json(formation);
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

    const formation = await prisma.formationType.update({
      where: { id },
      data,
    });

    return NextResponse.json(formation);
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

    await prisma.formationType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
