import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, validateFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const positionName = formData.get("positionName") as string;
    const applicantName = formData.get("applicantName") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || null;
    const cv = formData.get("cv") as File;
    const letter = formData.get("letter") as File;

    if (!positionName || !applicantName || !email || !cv || !letter) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const cvError = validateFile(cv, { allowedTypes: ["application/pdf"] });
    const letterError = validateFile(letter, { allowedTypes: ["application/pdf"] });

    if (cvError) return NextResponse.json({ error: cvError }, { status: 400 });
    if (letterError) return NextResponse.json({ error: letterError }, { status: 400 });

    const cvPath = await saveUploadedFile(cv, "cv");
    const letterPath = await saveUploadedFile(letter, "letter");

    await prisma.jobApplication.create({
      data: {
        positionName,
        applicantName,
        email,
        phone,
        cvPath,
        letterPath,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
