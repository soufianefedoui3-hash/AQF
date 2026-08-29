import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createdFromStore,
  jsonError,
  readJsonBody,
  zodErrorResponse,
} from "@/lib/form-api";
import { insertConsultation } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Téléphone invalide"),
  company: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    if (!body) return jsonError("JSON invalide", 400);

    const data = schema.parse(body);
    return createdFromStore(await insertConsultation(data));
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(error);
    console.error("[forms] consultation:", error);
    return jsonError("Enregistrement temporairement indisponible", 503);
  }
}

export async function GET() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
