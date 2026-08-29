import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { revalidateCms } from "@/lib/revalidate-cms";
import {
  createPack,
  deletePack,
  listPacks,
  updatePack,
} from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function readPackBody(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const order = typeof body.order === "number" ? body.order : undefined;
  const active = typeof body.active === "boolean" ? body.active : undefined;
  return { name, description, order, active };
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    return NextResponse.json(await listPacks(false));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data = readPackBody(body);
    if (!data.name) return jsonError("Nom requis", 400);
    if (!data.description) return jsonError("Description requise", 400);

    const result = await createPack(data);
    if (!result.ok) return jsonError(result.error, 503);
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
    const data = readPackBody(body);
    const result = await updatePack(id, {
      name: data.name || undefined,
      description: data.description || undefined,
      order: data.order,
      active: data.active,
    });
    if (!result.ok) return jsonError(result.error, 503);
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
    const result = await deletePack(id);
    if (!result.ok) return jsonError(result.error, 503);
    revalidateCms();
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Suppression impossible", 503);
  }
}
