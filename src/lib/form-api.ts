import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { runPrismaMutation } from "@/lib/prisma-safe";

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

export async function createWithPrisma<T>(
  create: () => Promise<T>
): Promise<NextResponse> {
  const result = await runPrismaMutation(create);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
