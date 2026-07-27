import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const schema = z.object({
  norms: z.array(z.string()),
  customNorm: z.string().nullable().optional(),
  auditNature: z.string().min(1),
  customAuditNature: z.string().nullable().optional(),
  companyName: z.string().min(2),
  companyActivity: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(6, "Numéro de téléphone requis"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    if (data.norms.length === 0 && !data.customNorm) {
      return NextResponse.json({ error: "Norme requise" }, { status: 400 });
    }

    await prisma.auditRequest.create({
      data: {
        norms: JSON.stringify(data.norms),
        customNorm: data.customNorm || null,
        auditNature: data.auditNature,
        customAuditNature: data.customAuditNature || null,
        companyName: data.companyName,
        companyActivity: data.companyActivity,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      },
    });

    return NextResponse.json({ success: true });
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
