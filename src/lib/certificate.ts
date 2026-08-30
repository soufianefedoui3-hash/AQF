export type CertificateData = {
  studentName: string;
  trainingTitle: string;
  startDate: string;
  endDate: string;
  hours: string;
  trainerName: string;
  issuePlace: string;
  issueDate: string;
  backgroundImage: string;
};

export type CertificateFormat = "a4" | "a3";

export const CERTIFICATE_DEFAULTS: CertificateData = {
  studentName: "",
  trainingTitle: "",
  startDate: "",
  endDate: "",
  hours: "",
  trainerName: "",
  issuePlace: "",
  issueDate: "",
  backgroundImage: "",
};

export const CERTIFICATE_STORAGE_KEY = "aqf-admin-certificate-draft-v2";

export function formatCertificateDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "[DATE]";
  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return trimmed.toUpperCase();
  return parsed
    .toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function certificateFileName(studentName: string): string {
  const slug = studentName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `Attestation-AQF-${slug || "participant"}.pdf`;
}

export function parseCertificateDraft(raw: unknown): CertificateData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  return {
    studentName: String(data.studentName ?? ""),
    trainingTitle: String(data.trainingTitle ?? ""),
    startDate: String(data.startDate ?? ""),
    endDate: String(data.endDate ?? ""),
    hours: String(data.hours ?? ""),
    trainerName: String(data.trainerName ?? ""),
    issuePlace: String(data.issuePlace ?? ""),
    issueDate: String(data.issueDate ?? ""),
    backgroundImage: String(data.backgroundImage ?? ""),
  };
}
