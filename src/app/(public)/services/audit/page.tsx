"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection, FormCard } from "@/components/ui/PageSection";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/Modal";
import { STANDARD_NORMS, AUDIT_NATURES } from "@/lib/constants";

export default function AuditPage() {
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedNorms, setSelectedNorms] = useState<string[]>([]);
  const [customNorm, setCustomNorm] = useState("");
  const [auditNature, setAuditNature] = useState("");
  const [customAuditNature, setCustomAuditNature] = useState("");

  function toggleNorm(norm: string) {
    setSelectedNorms((prev) =>
      prev.includes(norm) ? prev.filter((n) => n !== norm) : [...prev, norm]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nature = auditNature === "Autre" ? customAuditNature : auditNature;
    if (!nature) {
      toast.error("Veuillez sélectionner la nature de l'audit.");
      return;
    }
    if (selectedNorms.length === 0 && !customNorm.trim()) {
      toast.error("Veuillez sélectionner ou saisir au moins une norme.");
      return;
    }

    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/forms/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          norms: selectedNorms,
          customNorm: customNorm.trim() || null,
          auditNature: nature,
          customAuditNature: auditNature === "Autre" ? customAuditNature : null,
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      setSuccessOpen(true);
      setSelectedNorms([]);
      setCustomNorm("");
      setAuditNature("");
      setCustomAuditNature("");
      form.reset();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero
        title="Demande d'Audit"
        subtitle="Audits internes, blancs et de certification selon vos normes applicables."
        backHref="/services"
        backLabel="Retour aux services"
      />

      <PageSection container="2xl">
        <FormCard onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-primary-900">
              Normes à auditer
            </label>
            <div className="flex flex-wrap gap-2">
              {STANDARD_NORMS.map((norm) => (
                <button
                  key={norm}
                  type="button"
                  onClick={() => toggleNorm(norm)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition",
                    selectedNorms.includes(norm)
                      ? "border-accent-400 bg-accent-50 text-primary-900 ring-1 ring-accent-200"
                      : "border-primary-100 text-text-muted hover:border-accent-300 hover:bg-accent-50/50"
                  )}
                >
                  {norm}
                </button>
              ))}
            </div>
          </div>

          <Input
            label='Autre norme ("Autre")'
            value={customNorm}
            onChange={(e) => setCustomNorm(e.target.value)}
            placeholder="Saisir une norme non listée..."
          />

          <Select
            label="Nature de l'audit"
            required
            value={auditNature}
            onChange={(e) => setAuditNature(e.target.value)}
            options={AUDIT_NATURES.map((n) => ({ value: n, label: n }))}
          />

          {auditNature === "Autre" && (
            <Input
              label="Précisez la nature de l'audit"
              value={customAuditNature}
              onChange={(e) => setCustomAuditNature(e.target.value)}
              required
            />
          )}

          <Input name="companyName" label="Nom de l'entreprise" required />
          <Input name="companyActivity" label="Activité de l'entreprise" required />
          <Input name="contactName" label="Nom du contact" required />
          <Input name="contactEmail" label="Email" type="email" required />
          <Input name="contactPhone" label="Numéro de téléphone" type="tel" required />

          <Button type="submit" loading={loading} className="w-full">
            Demande de confirmation
          </Button>
        </FormCard>
      </PageSection>

      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
