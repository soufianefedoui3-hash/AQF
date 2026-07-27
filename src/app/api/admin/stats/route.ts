import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
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

    return NextResponse.json({
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
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
