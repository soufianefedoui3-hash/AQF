"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, SuccessModal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/forms/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!res.ok) throw new Error("Erreur");

      onClose();
      setSuccessOpen(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Demander une consultation">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" label="Nom complet" required />
          <Input name="email" label="Email" type="email" required />
          <Input name="phone" label="Téléphone" type="tel" required />
          <Input name="company" label="Entreprise / Organisation" />
          <Textarea name="message" label="Votre message" placeholder="Décrivez votre besoin..." />
          <Button type="submit" loading={loading} className="w-full">
            Demande de confirmation
          </Button>
        </form>
      </Modal>
      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
