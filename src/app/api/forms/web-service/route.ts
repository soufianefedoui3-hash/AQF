import { NextRequest } from "next/server";
import { z } from "zod";
import {
  createdFromStore,
  jsonError,
  readJsonBody,
  zodErrorResponse,
} from "@/lib/form-api";
import { insertWebService } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    if (!body) return jsonError("JSON invalide", 400);

    const data = schema.parse(body);
    return createdFromStore(
      await insertWebService({
        ...data,
        requestInfo: data.requestInfo || null,
        appointmentDate: data.appointmentDate || null,
        appointmentTime: data.appointmentTime || null,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(error);
    console.error("[forms] web-service:", error);
    return jsonError("Enregistrement temporairement indisponible", 503);
  }
}
