import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  responsableName: z.string().min(2),
  companyName: z.string().min(2),
  phone: z.string().min(6),
  requestInfo: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    await prisma.webServiceRequest.create({
      data: {
        ...data,
        requestInfo: data.requestInfo || null,
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
