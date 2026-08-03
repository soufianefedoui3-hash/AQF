"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PageHero } from "@/components/ui/PageHero";
import {
  PageSection,
  FormCard,
  AppointmentPanel,
} from "@/components/ui/PageSection";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/Modal";
import { APPOINTMENT_TIMES } from "@/lib/constants";
import { DEFAULT_SECTORS } from "@/lib/seed-data";
import { getFetchErrorMessage } from "@/lib/form-feedback";

const DEFAULT_SECTOR_OPTIONS = DEFAULT_SECTORS.map((sector) => ({
  slug: sector.slug,
  name: sector.name,
}));

export default function AccompagnementPage() {
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [sectors, setSectors] = useState<{ slug: string; name: string }[]>(
    DEFAULT_SECTOR_OPTIONS
  );

  useEffect(() => {
    fetch("/api/content/sectors")
      .then(async (res) => {
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          setSectors(DEFAULT_SECTOR_OPTIONS);
          return;
        }

        const options = data
          .filter(
            (item: { slug?: string; name?: string }) =>
              typeof item?.slug === "string" &&
              item.slug.trim() &&
              typeof item?.name === "string" &&
              item.name.trim()
          )
          .map((item: { slug: string; name: string }) => ({
            slug: item.slug.trim(),
            name: item.name.trim(),
          }));

        setSectors(options.length > 0 ? options : DEFAULT_SECTOR_OPTIONS);
      })
      .catch(() => {
        setSectors(DEFAULT_SECTOR_OPTIONS);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/forms/accompagnement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(await getFetchErrorMessage(res));
      }
      setSuccessOpen(true);
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
      <PageHero
        title="Accompagnement des entreprises et laboratoires"
        subtitle="Un accompagnement personnalisé adapté à votre secteur et vos besoins normatifs."
        backHref="/services"
        backLabel="Retour aux services"
      />

      <PageSection container="2xl">
        <FormCard onSubmit={handleSubmit}>
          <Select
            name="sector"
            label="Secteur d'activité"
            required
            options={sectors.map((s) => ({ value: s.slug, label: s.name }))}
          />
          <Input name="entityName" label="Nom de l'entité" required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input name="responsableName" label="Nom du responsable" required />
            <Input name="phone" label="Numéro de téléphone" type="tel" required />
            <Input name="email" label="Email" type="email" required />
          </div>
          <Textarea
            name="entityDetails"
            label="Détails de l'entité"
            placeholder="Taille, activités, contexte, objectifs..."
            required
          />
          <Input
            name="requestType"
            label="Type de demande"
            placeholder="Ex: ISO 9001, ISO 15189, ONSSA, GBEA..."
            required
          />

          <AppointmentPanel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="appointmentDate" label="Date souhaitée" type="date" min={minDate} />
              <Select
                name="appointmentTime"
                label="Heure souhaitée"
                options={APPOINTMENT_TIMES.map((t) => ({ value: t, label: t }))}
              />
            </div>
          </AppointmentPanel>

          <Button type="submit" loading={loading} className="w-full">
            Demande de confirmation
          </Button>
        </FormCard>
      </PageSection>

      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
