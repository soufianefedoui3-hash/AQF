import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPrismaQuery, runPrismaMutation } from "@/lib/prisma-safe";
import { getAdminSession } from "@/lib/auth";

function parseNorms(raw: string): string[] | string {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : raw;
  } catch {
    return raw;
  }
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") || "all";

  const leads = await withPrismaQuery(async () => {
    const items: Record<string, unknown>[] = [];

    if (type === "all" || type === "consultation") {
      const consultations = await prisma.consultationRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      items.push(...consultations.map((i) => ({ ...i, type: "consultation" })));
    }
    if (type === "all" || type === "accompagnement") {
      const accompagnements = await prisma.accompagnementRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      items.push(
        ...accompagnements.map((i) => ({
          ...i,
          type: "accompagnement",
        }))
      );
    }
    if (type === "all" || type === "formation") {
      const formations = await prisma.formationRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      items.push(...formations.map((i) => ({ ...i, type: "formation" })));
    }
    if (type === "all" || type === "audit") {
      const audits = await prisma.auditRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      items.push(
        ...audits.map((i) => ({
          ...i,
          type: "audit",
          norms: parseNorms(i.norms),
        }))
      );
    }
    if (type === "all" || type === "web-service") {
      const webServices = await prisma.webServiceRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      items.push(...webServices.map((i) => ({ ...i, type: "web-service" })));
    }

    items.sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime()
    );

    return items;
  }, []);

  return NextResponse.json(leads);
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    const type = String(body.type || "").trim();
    const status = String(body.status || "").trim();

    if (!id || !type || !status) {
      return NextResponse.json(
        { error: "id, type et status sont requis" },
        { status: 400 }
      );
    }

    const result = await runPrismaMutation(async () => {
      switch (type) {
        case "consultation":
          return prisma.consultationRequest.update({ where: { id }, data: { status } });
        case "accompagnement":
          return prisma.accompagnementRequest.update({ where: { id }, data: { status } });
        case "formation":
          return prisma.formationRequest.update({ where: { id }, data: { status } });
        case "audit":
          return prisma.auditRequest.update({ where: { id }, data: { status } });
        case "web-service":
          return prisma.webServiceRequest.update({ where: { id }, data: { status } });
        default:
          return null;
      }
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (result.data === null) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead update error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
