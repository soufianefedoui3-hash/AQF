import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPrismaQuery } from "@/lib/prisma-safe";
import { getAdminSession } from "@/lib/auth";

const EMPTY_STATS = {
  stats: {
    totalLeads: 0,
    consultations: 0,
    accompagnements: 0,
    formations: 0,
    audits: 0,
    webServices: 0,
    applications: 0,
  },
  recent: [],
};

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const payload = await withPrismaQuery(async () => {
    const [
      consultations,
      accompagnements,
      formations,
      audits,
      webServices,
      applications,
    ] = await Promise.all([
      prisma.consultationRequest.count(),
      prisma.accompagnementRequest.count(),
      prisma.formationRequest.count(),
      prisma.auditRequest.count(),
      prisma.webServiceRequest.count(),
      prisma.jobApplication.count(),
    ]);

    const totalLeads =
      consultations + accompagnements + formations + audits + webServices;

    const recentConsultations = await prisma.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      stats: {
        totalLeads,
        consultations,
        accompagnements,
        formations,
        audits,
        webServices,
        applications,
      },
      recent: recentConsultations,
    };
  }, EMPTY_STATS);

  return NextResponse.json(payload);
}
