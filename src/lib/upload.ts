import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUploadedFile(
  file: File,
  prefix: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || ".bin";
  const safeName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, safeName);

  await writeFile(filePath, buffer);

  return `/uploads/${safeName}`;
}

export function validateFile(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): string | null {
  const { maxSizeMB = 5, allowedTypes = ["application/pdf", "image/"] } = options;

  if (!file || file.size === 0) {
    return "Fichier requis.";
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Le fichier ne doit pas dépasser ${maxSizeMB} Mo.`;
  }

  const mime = (file.type || "").toLowerCase();
  const ext = path.extname(file.name || "").toLowerCase();
  const allowsPdf = allowedTypes.some(
    (type) => type === "application/pdf" || type.includes("pdf")
  );

  const isAllowed = allowedTypes.some((type) =>
    type.endsWith("/") ? mime.startsWith(type) : mime === type
  );

  // Some browsers send an empty MIME type for PDFs — accept by extension.
  if (!isAllowed && !(allowsPdf && (!mime || mime === "application/octet-stream") && ext === ".pdf")) {
    return "Type de fichier non autorisé.";
  }

  return null;
}
