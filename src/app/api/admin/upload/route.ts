import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const prefix = (formData.get("prefix") as string) || "upload";

  if (!file) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  const url = await saveUploadedFile(file, prefix);
  return NextResponse.json({ url });
}
