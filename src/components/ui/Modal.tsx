"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "lg" }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-primary-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full rounded-2xl bg-white shadow-2xl",
          "max-h-[90vh] overflow-y-auto",
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-primary-100 bg-white px-6 py-4">
          <h2 id="modal-title" className="text-xl font-semibold text-primary-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition hover:bg-accent-50 hover:text-primary-900"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  message = "Votre demande a été envoyée avec succès. Notre équipe vous contactera dans moins de 24 heures.",
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Demande envoyée" size="md">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 ring-2 ring-secondary-300">
          <svg
            className="h-8 w-8 text-secondary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="mb-6 text-text-muted">{message}</p>
        <Button onClick={onClose} variant="secondary">
          Fermer
        </Button>
      </div>
    </Modal>
  );
}

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  return {
    isOpen,
    successOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    showSuccess: () => {
      setIsOpen(false);
      setSuccessOpen(true);
    },
    closeSuccess: () => setSuccessOpen(false),
  };
}
