import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createWithPrisma, readJsonBody, zodErrorResponse } from "@/lib/form-api";

const schema = z.object({
  trainingType: z.string().min(1, "Formation requise"),
  audienceType: z.string().optional(),
  contactName: z.string().min(2, "Nom trop court"),
  contactEmail: z.string().email("Email invalide"),
  contactPhone: z.string().min(6, "Téléphone invalide"),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const data = schema.parse(body);
    return createWithPrisma(() => prisma.formationRequest.create({ data }));
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
