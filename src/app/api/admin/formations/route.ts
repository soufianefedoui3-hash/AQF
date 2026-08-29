import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { revalidateCms } from "@/lib/revalidate-cms";
import {
  createFormation,
  deleteFormation,
  listFormations,
  updateFormation,
} from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function readFormationBody(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const order = typeof body.order === "number" ? body.order : undefined;
  const active = typeof body.active === "boolean" ? body.active : undefined;
  return { name, order, active };
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    return NextResponse.json(await listFormations(false));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data = readFormationBody(body);
    if (!data.name) return jsonError("Nom requis", 400);

    const result = await createFormation(data);
    if (!result.ok) {
      const status = result.error.includes("existe déjà") ? 409 : 503;
      return jsonError(result.error, status);
    }
    revalidateCms();
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Création impossible",
      503
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const id = body.id ? String(body.id) : "";
    if (!id) return jsonError("ID requis", 400);
    const data = readFormationBody(body);
    const result = await updateFormation(id, {
      name: data.name || undefined,
      order: data.order,
      active: data.active,
    });
    if (!result.ok) {
      const status = result.error.includes("existe déjà") ? 409 : 503;
      return jsonError(result.error, status);
    }
    revalidateCms();
    return NextResponse.json(result.data);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Mise à jour impossible",
      503
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const id = body.id ? String(body.id) : "";
    if (!id) return jsonError("ID requis", 400);
    const result = await deleteFormation(id);
    if (!result.ok) return jsonError(result.error, 503);
    revalidateCms();
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Suppression impossible", 503);
  }
}
