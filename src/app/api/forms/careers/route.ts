import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, validateFile } from "@/lib/upload";
import { runPrismaMutation } from "@/lib/prisma-safe";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const positionName = String(formData.get("positionName") || "").trim();
    const applicantName = String(formData.get("applicantName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phoneRaw = formData.get("phone");
    const phone = phoneRaw ? String(phoneRaw).trim() || null : null;
    const cv = formData.get("cv");
    const letter = formData.get("letter");

    if (!positionName || !applicantName || !email) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    if (!(cv instanceof File) || cv.size === 0) {
      return NextResponse.json({ error: "CV (PDF) requis" }, { status: 400 });
    }

    if (!(letter instanceof File) || letter.size === 0) {
      return NextResponse.json(
        { error: "Lettre de motivation (PDF) requise" },
        { status: 400 }
      );
    }

    const cvError = validateFile(cv, { allowedTypes: ["application/pdf"] });
    const letterError = validateFile(letter, { allowedTypes: ["application/pdf"] });

    if (cvError) return NextResponse.json({ error: cvError }, { status: 400 });
    if (letterError) return NextResponse.json({ error: letterError }, { status: 400 });

    const cvPath = await saveUploadedFile(cv, "cv");
    const letterPath = await saveUploadedFile(letter, "letter");

    const result = await runPrismaMutation(() =>
      prisma.jobApplication.create({
        data: {
          positionName,
          applicantName,
          email,
          phone,
          cvPath,
          letterPath,
        },
      })
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
