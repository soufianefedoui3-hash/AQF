import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createWithPrisma, readJsonBody, zodErrorResponse } from "@/lib/form-api";

const schema = z.object({
  sector: z.string().min(1, "Secteur requis"),
  entityName: z.string().min(2, "Nom de l'entité trop court"),
  responsableName: z.string().min(2, "Nom du responsable trop court"),
  phone: z.string().min(6, "Téléphone invalide"),
  email: z.string().email("Email invalide"),
  entityDetails: z.string().min(10, "Veuillez détailler davantage l'entité (10 caractères min.)"),
  requestType: z.string().min(2, "Type de demande requis"),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const data = schema.parse(body);

    return createWithPrisma(() =>
      prisma.accompagnementRequest.create({
        data: {
          ...data,
          appointmentDate: data.appointmentDate || null,
          appointmentTime: data.appointmentTime || null,
        },
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
