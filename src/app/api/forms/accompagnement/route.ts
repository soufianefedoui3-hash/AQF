import { NextRequest } from "next/server";
import { z } from "zod";
import {
  createdFromStore,
  jsonError,
  readJsonBody,
  zodErrorResponse,
} from "@/lib/form-api";
import { insertAccompagnement } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    if (!body) return jsonError("JSON invalide", 400);

    const data = schema.parse(body);
    return createdFromStore(
      await insertAccompagnement({
        ...data,
        appointmentDate: data.appointmentDate || null,
        appointmentTime: data.appointmentTime || null,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(error);
    console.error("[forms] accompagnement:", error);
    return jsonError("Enregistrement temporairement indisponible", 503);
  }
}
