import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createWithPrisma, readJsonBody, zodErrorResponse } from "@/lib/form-api";

const schema = z.object({
  norms: z.array(z.string()),
  customNorm: z.string().nullable().optional(),
  auditNature: z.string().min(1, "Nature d'audit requise"),
  customAuditNature: z.string().nullable().optional(),
  companyName: z.string().min(2, "Nom d'entreprise trop court"),
  companyActivity: z.string().min(2, "Activité trop courte"),
  contactName: z.string().min(2, "Nom trop court"),
  contactEmail: z.string().email("Email invalide"),
  contactPhone: z.string().min(6, "Numéro de téléphone requis"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const data = schema.parse(body);

    if (data.norms.length === 0 && !data.customNorm) {
      return NextResponse.json({ error: "Norme requise" }, { status: 400 });
    }

    return createWithPrisma(() =>
      prisma.auditRequest.create({
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
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
