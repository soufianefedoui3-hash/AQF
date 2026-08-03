import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createWithPrisma, readJsonBody, zodErrorResponse } from "@/lib/form-api";

const schema = z.object({
  responsableName: z.string().min(2, "Nom trop court"),
  companyName: z.string().min(2, "Nom d'entreprise trop court"),
  phone: z.string().min(6, "Téléphone invalide"),
  requestInfo: z.string().optional(),
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
      prisma.webServiceRequest.create({
        data: {
          ...data,
          requestInfo: data.requestInfo || null,
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
