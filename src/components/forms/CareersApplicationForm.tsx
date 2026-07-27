"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Briefcase, Upload } from "lucide-react";
import { Input, FileInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/Modal";
import { ContentCard } from "@/components/ui/PageSection";

export function CareersApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/forms/careers", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      setSuccessOpen(true);
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ContentCard>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <Briefcase className="h-5 w-5 text-primary-700" />
          </div>
          <h2 className="text-lg font-semibold text-primary-900">Postuler maintenant</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="positionName" label="Nom du poste" required />
          <Input name="applicantName" label="Nom complet" required />
          <Input name="email" label="Email" type="email" required />
          <Input name="phone" label="Téléphone" type="tel" />
          <FileInput name="cv" label="CV (PDF)" accept=".pdf,application/pdf" required />
          <FileInput
            name="letter"
            label="Lettre de motivation (PDF)"
            accept=".pdf,application/pdf"
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            <Upload className="h-4 w-4" />
            Envoyer ma candidature
          </Button>
        </form>
      </ContentCard>

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Votre candidature a été envoyée avec succès. Notre équipe RH vous contactera prochainement."
      />
    </>
  );
}
