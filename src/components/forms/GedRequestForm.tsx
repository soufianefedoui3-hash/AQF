"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/Modal";
import { FormCard, AppointmentPanel } from "@/components/ui/PageSection";
import { APPOINTMENT_TIMES } from "@/lib/constants";

export function GedRequestForm() {
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/forms/web-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      if (!res.ok) throw new Error("Erreur");
      setSuccessOpen(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
      <FormCard onSubmit={handleSubmit}>
        <Input name="responsableName" label="Nom de responsable" required />
        <Input name="companyName" label="Nom d'entreprise" required />
        <Input name="phone" label="Numéro de téléphone" type="tel" required />
        <Textarea
          name="requestInfo"
          label="Demande d'informations"
          placeholder="Décrivez vos besoins GED..."
        />

        <AppointmentPanel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="appointmentDate" label="Date" type="date" min={minDate} />
            <Select
              name="appointmentTime"
              label="Heure"
              options={APPOINTMENT_TIMES.map((t) => ({ value: t, label: t }))}
            />
          </div>
        </AppointmentPanel>

        <Button type="submit" loading={loading} className="w-full">
          Demande de confirmation
        </Button>
      </FormCard>
      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
