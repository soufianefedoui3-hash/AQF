import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  sector: z.string().min(1),
  entityName: z.string().min(2),
  responsableName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  entityDetails: z.string().min(10),
  requestType: z.string().min(2),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    await prisma.accompagnementRequest.create({
      data: {
        ...data,
        appointmentDate: data.appointmentDate || null,
        appointmentTime: data.appointmentTime || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
