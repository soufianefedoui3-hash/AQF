"use client";

import { useId, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toLocalImageUrl } from "@/lib/placeholder-images";

export async function uploadAdminImage(
  file: File,
  prefix = "card"
): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prefix", prefix);
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      toast.error("Impossible d'envoyer l'image");
      return null;
    }
    const data = (await res.json()) as { url?: string };
    if (typeof data.url !== "string" || !data.url.trim()) {
      toast.error("Réponse upload invalide");
      return null;
    }
    return data.url;
  } catch {
    toast.error("Échec de l'upload");
    return null;
  }
}

export function ImageField({
  label = "Image",
  value,
  prefix = "card",
  onChange,
}: {
  label?: string;
  value: string;
  prefix?: string;
  onChange: (url: string) => void;
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);
  const preview = toLocalImageUrl(value) || value.trim();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const url = await uploadAdminImage(file, prefix);
    setUploading(false);
    if (!url) return;
    setBroken(false);
    onChange(url);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-primary-900">{label}</p>
      {preview && !broken ? (
        <div className="relative h-36 overflow-hidden rounded-xl border border-primary-100 bg-primary-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-primary-200 bg-primary-50/60 text-primary-300">
          <ImagePlus className="h-8 w-8" />
        </div>
      )}
      <Input
        label="URL de l'image"
        placeholder="/uploads/… ou https://…"
        value={value}
        onChange={(event) => {
          setBroken(false);
          onChange(event.target.value);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm font-medium text-primary-800 hover:bg-accent-50"
        >
          {uploading ? "Envoi…" : "Choisir un fichier"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {value.trim() ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setBroken(false);
              onChange("");
            }}
          >
            <Trash2 className="h-4 w-4" />
            Retirer
          </Button>
        ) : null}
      </div>
    </div>
  );
}
