"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/Modal";
import { FormCard } from "@/components/ui/PageSection";

interface FormationRegistrationFormProps {
  formations: string[];
}

export function FormationRegistrationForm({ formations }: FormationRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);

    const formData = new FormData(form);

    try {
      const res = await fetch("/api/forms/formation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      if (!res.ok) throw new Error("Erreur");
      setSuccessOpen(true);
      form.reset();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FormCard onSubmit={handleSubmit}>
        <Select
          name="trainingType"
          label="Formation souhaitée"
          required
          options={formations.map((t) => ({ value: t, label: t }))}
        />
        <Select
          name="audienceType"
          label="Profil"
          required
          options={[
            { value: "etudiant", label: "Étudiant" },
            { value: "professionnel", label: "Professionnel de santé / Corporate" },
          ]}
        />
        <Input name="contactName" label="Nom complet" required />
        <Input name="contactEmail" label="Email" type="email" required />
        <Input name="contactPhone" label="Téléphone" type="tel" required />
        <Textarea name="message" label="Message / Besoins spécifiques" />
        <Button type="submit" loading={loading} className="w-full" disabled={formations.length === 0}>
          Demande de confirmation
        </Button>
      </FormCard>
      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
