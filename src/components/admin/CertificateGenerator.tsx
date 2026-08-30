"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Award, FileDown } from "lucide-react";
import { CertificatePreview, CERTIFICATE_HEIGHT, CERTIFICATE_WIDTH } from "@/components/admin/CertificatePreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/ui/PageSection";
import {
  CERTIFICATE_DEFAULTS,
  CERTIFICATE_STORAGE_KEY,
  certificateFileName,
  parseCertificateDraft,
  todayIsoDate,
  type CertificateData,
  type CertificateFormat,
} from "@/lib/certificate";

function loadDraft(): CertificateData {
  const fallback = {
    ...CERTIFICATE_DEFAULTS,
    startDate: todayIsoDate(),
    endDate: todayIsoDate(),
    issueDate: todayIsoDate(),
  };
  try {
    const raw = localStorage.getItem(CERTIFICATE_STORAGE_KEY);
    if (!raw) return fallback;
    return parseCertificateDraft(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function CertificateGenerator() {
  const exportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CertificateData>(CERTIFICATE_DEFAULTS);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [formatOpen, setFormatOpen] = useState(false);
  const [format, setFormat] = useState<CertificateFormat>("a4");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setData(loadDraft());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota */
    }
  }, [data, ready]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setScale(Math.min(1, width / CERTIFICATE_WIDTH));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [ready]);

  function update<K extends keyof CertificateData>(key: K, value: CertificateData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function generatePdf() {
    const node = exportRef.current;
    if (!node) {
      toast.error("Aperçu introuvable");
      return;
    }

    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#004d5a",
        width: CERTIFICATE_WIDTH,
        height: CERTIFICATE_HEIGHT,
        windowWidth: CERTIFICATE_WIDTH,
        windowHeight: CERTIFICATE_HEIGHT,
      });

      const image = canvas.toDataURL("image/png", 1);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format,
        compress: true,
      });
      pdf.addImage(
        image,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
        undefined,
        "FAST"
      );
      pdf.save(certificateFileName(data.studentName));
      toast.success(`PDF ${format.toUpperCase()} généré`);
      setFormatOpen(false);
    } catch (error) {
      console.error("[certificate] PDF export failed:", error);
      toast.error("Impossible de générer le PDF");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Générateur d'Attestations">
        <Button onClick={() => setFormatOpen(true)}>
          <FileDown className="h-4 w-4" />
          Générer en PDF
        </Button>
      </AdminPageHeader>
      <p className="mb-6 max-w-3xl text-sm text-text-muted">
        Remplissez les champs : l&apos;attestation se met à jour instantanément. Choisissez ensuite
        le format A4 ou A3 pour un export PDF prêt à imprimer.
      </p>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <aside className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-primary-900">
            <Award className="h-5 w-5 text-accent-600" />
            <h3 className="font-semibold">Variables de l&apos;attestation</h3>
          </div>
          <div className="space-y-4">
            <Input
              label="Prénom NOM"
              value={data.studentName}
              onChange={(e) => update("studentName", e.target.value)}
              placeholder="Prénom NOM"
            />
            <Input
              label="Intitulé de la formation / accompagnement"
              value={data.trainingTitle}
              onChange={(e) => update("trainingTitle", e.target.value)}
              placeholder="ISO 15189 — Laboratoire"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label="Date de début"
                value={data.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
              <Input
                type="date"
                label="Date de fin"
                value={data.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
            <Input
              type="number"
              min={1}
              label="Nombre d'heures"
              value={data.hours}
              onChange={(e) => update("hours", e.target.value)}
            />
            <Input
              label="Responsable pédagogique"
              value={data.trainerName}
              onChange={(e) => update("trainerName", e.target.value)}
              placeholder="Nom du formateur"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Lieu de délivrance"
                value={data.issuePlace}
                onChange={(e) => update("issuePlace", e.target.value)}
                placeholder="Casablanca"
              />
              <Input
                type="date"
                label="Date de délivrance"
                value={data.issueDate}
                onChange={(e) => update("issueDate", e.target.value)}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0 rounded-2xl border border-primary-100 bg-surface-muted p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
            Aperçu live
          </p>
          <div ref={frameRef} className="w-full overflow-hidden rounded-lg shadow-xl">
            <div
              style={{
                height: CERTIFICATE_HEIGHT * scale,
                width: "100%",
              }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <CertificatePreview data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed left-[-200vw] top-0"
      >
        <CertificatePreview ref={exportRef} data={data} />
      </div>

      <Modal
        isOpen={formatOpen}
        onClose={() => !exporting && setFormatOpen(false)}
        title="Format d'impression"
        size="md"
      >
        <p className="mb-4 text-sm text-text-muted">
          Choisissez le format du PDF. L&apos;attestation est en paysage, alignée sur toute la page.
        </p>
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(["a4", "a3"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={`rounded-2xl border px-4 py-5 text-left transition ${
                format === option
                  ? "border-accent-400 bg-accent-50 ring-2 ring-accent-300"
                  : "border-primary-100 bg-white hover:border-accent-200"
              }`}
            >
              <p className="text-lg font-bold text-primary-900">{option.toUpperCase()}</p>
              <p className="mt-1 text-xs text-text-muted">
                {option === "a4" ? "297 × 210 mm — paysage" : "420 × 297 mm — paysage"}
              </p>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" disabled={exporting} onClick={() => setFormatOpen(false)}>
            Annuler
          </Button>
          <Button loading={exporting} onClick={() => void generatePdf()}>
            <FileDown className="h-4 w-4" />
            Générer en PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
}
