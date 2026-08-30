import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import { saveUploadedFile, validateFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const session = sessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const prefix = String(formData.get("prefix") || "upload").trim() || "upload";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    const validationError = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/"],
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const url = await saveUploadedFile(file, prefix);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Échec de l'upload du fichier" },
      { status: 500 }
    );
  }
}
