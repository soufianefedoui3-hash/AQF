"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppWidgetProps {
  phone?: string;
  embedded?: boolean;
}

export function WhatsAppWidget({
  phone = "+212600000000",
  embedded = false,
}: WhatsAppWidgetProps) {
  const cleanPhone = phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Bonjour AQF, je souhaite obtenir plus d'informations sur vos services."
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={
        embedded
          ? "animate-float absolute right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition hover:scale-110 hover:shadow-xl"
          : "animate-float fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition hover:scale-110 hover:shadow-xl"
      }
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
