import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") || "all";

  try {
    const leads: Record<string, unknown>[] = [];

    if (type === "all" || type === "consultation") {
      const items = await prisma.consultationRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      leads.push(...items.map((i) => ({ ...i, type: "consultation" })));
    }
    if (type === "all" || type === "accompagnement") {
      const items = await prisma.accompagnementRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      leads.push(
        ...items.map((i) => ({
          ...i,
          type: "accompagnement",
        }))
      );
    }
    if (type === "all" || type === "formation") {
      const items = await prisma.formationRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      leads.push(...items.map((i) => ({ ...i, type: "formation" })));
    }
    if (type === "all" || type === "audit") {
      const items = await prisma.auditRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      leads.push(
        ...items.map((i) => ({
          ...i,
          type: "audit",
          norms: JSON.parse(i.norms),
        }))
      );
    }
    if (type === "all" || type === "web-service") {
      const items = await prisma.webServiceRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      leads.push(...items.map((i) => ({ ...i, type: "web-service" })));
    }

    leads.sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime()
    );

    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id, type, status } = await request.json();

  switch (type) {
    case "consultation":
      await prisma.consultationRequest.update({ where: { id }, data: { status } });
      break;
    case "accompagnement":
      await prisma.accompagnementRequest.update({ where: { id }, data: { status } });
      break;
    case "formation":
      await prisma.formationRequest.update({ where: { id }, data: { status } });
      break;
    case "audit":
      await prisma.auditRequest.update({ where: { id }, data: { status } });
      break;
    case "web-service":
      await prisma.webServiceRequest.update({ where: { id }, data: { status } });
      break;
    default:
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
