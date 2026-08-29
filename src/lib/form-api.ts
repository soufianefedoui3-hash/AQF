import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { StoreResult } from "@/lib/leads/store";

export async function readJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function zodErrorResponse(error: ZodError) {
  return NextResponse.json(
    { error: error.errors[0]?.message || "Données invalides" },
    { status: 400 }
  );
}

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function createdFromStore(result: StoreResult<unknown>): NextResponse {
  if (!result.ok) {
    return jsonError(result.error || "Enregistrement temporairement indisponible", 503);
  }
  return NextResponse.json({ success: true }, { status: 201 });
}
