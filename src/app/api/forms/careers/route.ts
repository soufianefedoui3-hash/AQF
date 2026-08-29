import { NextRequest } from "next/server";
import { saveUploadedFile, validateFile } from "@/lib/upload";
import { createdFromStore, jsonError } from "@/lib/form-api";
import { insertApplication } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      return jsonError("Champs requis manquants", 400);
    }
    if (!email.includes("@")) {
      return jsonError("Email invalide", 400);
    }
    if (!(cv instanceof File) || cv.size === 0) {
      return jsonError("CV (PDF) requis", 400);
    }
    if (!(letter instanceof File) || letter.size === 0) {
      return jsonError("Lettre de motivation (PDF) requise", 400);
    }

    const cvError = validateFile(cv, { allowedTypes: ["application/pdf"] });
    const letterError = validateFile(letter, { allowedTypes: ["application/pdf"] });
    if (cvError) return jsonError(cvError, 400);
    if (letterError) return jsonError(letterError, 400);

    const cvPath = await saveUploadedFile(cv, "cv");
    const letterPath = await saveUploadedFile(letter, "letter");

    return createdFromStore(
      await insertApplication({
        positionName,
        applicantName,
        email,
        phone,
        cvPath,
        letterPath,
      })
    );
  } catch (error) {
    console.error("[forms] careers:", error);
    return jsonError("Enregistrement temporairement indisponible", 503);
  }
}
