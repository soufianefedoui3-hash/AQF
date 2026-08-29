import { NextRequest } from "next/server";
import { z } from "zod";
import {
  createdFromStore,
  jsonError,
  readJsonBody,
  zodErrorResponse,
} from "@/lib/form-api";
import { insertFormation } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    if (!body) return jsonError("JSON invalide", 400);

    const data = schema.parse(body);
    return createdFromStore(await insertFormation(data));
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(error);
    console.error("[forms] formation:", error);
    return jsonError("Enregistrement temporairement indisponible", 503);
  }
}
