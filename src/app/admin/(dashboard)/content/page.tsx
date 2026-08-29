"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormationsManager } from "@/components/admin/FormationsManager";
import { PacksManager } from "@/components/admin/PacksManager";

interface AboutSection {
  key: string;
  title: string;
  content: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string;
  imageUrl: string | null;
  order: number;
}

interface Sector {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  order: number;
}

interface CareersSettings {
  title: string;
  content: string;
  email: string;
  phone: string;
}

interface SiteSettings {
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

interface PageContentItem {
  key: string;
  title: string | null;
  content: string;
}

interface GedService {
  title: string;
  description: string;
  imageUrl: string | null;
}

const DEFAULT_CAREERS: CareersSettings = {
  title: "Rejoignez une équipe passionnée par la qualité",
  content: "",
  email: "recrutement@aqf.ma",
  phone: "+212 600 000 000",
};

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: "+212600000000",
  contactEmail: "contact@aqf.ma",
  contactPhone: "+212 600 000 000",
  address: "Maroc",
};

const DEFAULT_GED: GedService = {
  title: "GED — Gestion Électronique des Documents",
  description: "",
  imageUrl: null,
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    /* ignore */
  }
  return "Erreur lors de l'enregistrement";
}

export default function ContentPage() {
  const [about, setAbout] = useState<AboutSection[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [careers, setCareers] = useState<CareersSettings>(DEFAULT_CAREERS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [pages, setPages] = useState<PageContentItem[]>([]);
  const [ged, setGed] = useState<GedService>(DEFAULT_GED);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [saving, setSaving] = useState(false);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();

      if (!res.ok) {
        toast.error(
          typeof data?.error === "string" ? data.error : "Impossible de charger le contenu"
        );
        return;
      }

      setAbout(Array.isArray(data.about) ? data.about : []);
      setTeam(Array.isArray(data.team) ? data.team : []);
      setSectors(Array.isArray(data.sectors) ? data.sectors : []);
      setCareers(data.careers || DEFAULT_CAREERS);
      setSettings(data.settings || DEFAULT_SETTINGS);
      setPages(Array.isArray(data.pages) ? data.pages : []);
      setGed(data.ged || DEFAULT_GED);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  async function save(section: string, data: object): Promise<boolean> {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });

      if (!res.ok) {
        toast.error(await readErrorMessage(res));
        return false;
      }

      toast.success("Enregistré");
      return true;
    } catch {
      toast.error("Erreur de connexion");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File, prefix: string): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", prefix);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });

      if (!res.ok) {
        toast.error(await readErrorMessage(res));
        return null;
      }

      const data = await res.json();
      if (typeof data?.url !== "string") {
        toast.error("Réponse upload invalide");
        return null;
      }

      return data.url;
    } catch {
      toast.error("Échec de l'upload");
      return null;
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const tabs = [
    { id: "about", label: "À propos" },
    { id: "homepage", label: "Accueil" },
    { id: "formation", label: "Formation (texte)" },
    { id: "formations", label: "Formations disponibles" },
    { id: "packs", label: "Packs produits" },
    { id: "ged", label: "GED" },
    { id: "team", label: "Équipe" },
    { id: "sectors", label: "Secteurs" },
    { id: "careers", label: "Carrières" },
    { id: "settings", label: "Paramètres" },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-900">Contenu & Pages</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-primary-900 text-white shadow-sm"
                : "border border-primary-100 bg-white text-text-muted hover:bg-accent-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "about" && (
        <div className="space-y-6">
          {(["presentation", "steps"] as const).map((key) => {
            const section = about.find((s) => s.key === key) || {
              key,
              title: key === "presentation" ? "Présentation du site" : "Étapes à suivre",
              content: "",
            };
            return (
              <AboutEditor
                key={key}
                section={section}
                saving={saving}
                onSave={async (data) => {
                  const ok = await save("about", data);
                  if (ok) await loadContent();
                }}
              />
            );
          })}
        </div>
      )}

      {activeTab === "homepage" && (
        <PageEditor
          pageKey="homepage_presentation"
          label="Présentation de l'accueil"
          pages={pages}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("page", data);
            if (ok) await loadContent();
          }}
        />
      )}

      {activeTab === "formation" && (
        <PageEditor
          pageKey="formation_intro"
          label="Introduction Formation Qualité"
          pages={pages}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("page", data);
            if (ok) await loadContent();
          }}
        />
      )}

      {activeTab === "formations" && <FormationsManager />}

      {activeTab === "packs" && <PacksManager />}

      {activeTab === "ged" && (
        <GedEditor
          ged={ged}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("ged", data);
            if (ok) {
              setGed(data);
              await loadContent();
            }
          }}
          onUpload={uploadImage}
        />
      )}

      {activeTab === "team" && (
        <div className="space-y-4">
          {team.map((member) => (
            <TeamEditor
              key={member.id}
              member={member}
              saving={saving}
              onSave={async (data) => {
                const ok = await save("team", data);
                if (ok) await loadContent();
              }}
              onDelete={async () => {
                if (!confirm("Supprimer ce membre ?")) return;
                const ok = await save("team-delete", { id: member.id });
                if (ok) await loadContent();
              }}
              onUpload={uploadImage}
            />
          ))}
          <Button
            loading={saving}
            onClick={async () => {
              const ok = await save("team", {
                name: "Nouveau membre",
                role: "Rôle",
                skills: "Compétences",
                order: team.length,
              });
              if (ok) await loadContent();
            }}
          >
            Ajouter un membre
          </Button>
        </div>
      )}

      {activeTab === "sectors" && (
        <div className="space-y-4">
          {sectors.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-text-muted">
              Aucun secteur disponible.
            </p>
          ) : (
            sectors.map((sector) => (
              <SectorEditor
                key={sector.id}
                sector={sector}
                saving={saving}
                onSave={async (data) => {
                  const ok = await save("sector", data);
                  if (ok) await loadContent();
                }}
                onUpload={uploadImage}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "careers" && (
        <CareersEditor
          settings={careers}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("careers", data);
            if (ok) {
              setCareers(data);
              await loadContent();
            }
          }}
        />
      )}

      {activeTab === "settings" && (
        <SettingsEditor
          settings={settings}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("settings", data);
            if (ok) {
              setSettings(data);
              await loadContent();
            }
          }}
        />
      )}
    </div>
  );
}

function PageEditor({
  pageKey,
  label,
  pages,
  saving,
  onSave,
}: {
  pageKey: string;
  label: string;
  pages: PageContentItem[];
  saving: boolean;
  onSave: (data: PageContentItem) => Promise<void>;
}) {
  const existing = pages.find((p) => p.key === pageKey);
  const [title, setTitle] = useState(existing?.title || label);
  const [content, setContent] = useState(existing?.content || "");

  useEffect(() => {
    setTitle(existing?.title || label);
    setContent(existing?.content || "");
  }, [existing?.title, existing?.content, label]);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input label="Titre" value={title || ""} onChange={(e) => setTitle(e.target.value)} />
      <div className="mt-4">
        <Textarea label="Contenu" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <Button
        className="mt-4"
        loading={saving}
        onClick={() => onSave({ key: pageKey, title, content })}
      >
        Enregistrer
      </Button>
    </div>
  );
}

function GedEditor({
  ged,
  saving,
  onSave,
  onUpload,
}: {
  ged: GedService;
  saving: boolean;
  onSave: (data: GedService) => Promise<void>;
  onUpload: (file: File, prefix: string) => Promise<string | null>;
}) {
  const [form, setForm] = useState(ged);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(ged);
  }, [ged]);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await onUpload(file, "ged");
    setUploading(false);
    if (url) {
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast.success("Image prête — cliquez Enregistrer pour la sauvegarder");
    }
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input
        label="Titre"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <div className="mt-4">
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Image de prévisualisation</label>
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" disabled={uploading} />
        {form.imageUrl && <p className="mt-1 text-xs text-text-muted">{form.imageUrl}</p>}
      </div>
      <Button className="mt-4" loading={saving || uploading} onClick={() => onSave(form)}>
        Enregistrer
      </Button>
    </div>
  );
}

function AboutEditor({
  section,
  saving,
  onSave,
}: {
  section: AboutSection;
  saving: boolean;
  onSave: (data: AboutSection) => Promise<void>;
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  useEffect(() => {
    setTitle(section.title);
    setContent(section.content);
  }, [section.title, section.content]);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="mt-4">
        <Textarea label="Contenu" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <Button
        className="mt-4"
        loading={saving}
        onClick={() => onSave({ key: section.key, title, content })}
      >
        Enregistrer
      </Button>
    </div>
  );
}

function TeamEditor({
  member,
  saving,
  onSave,
  onDelete,
  onUpload,
}: {
  member: TeamMember;
  saving: boolean;
  onSave: (data: TeamMember) => Promise<void>;
  onDelete: () => Promise<void>;
  onUpload: (file: File, prefix: string) => Promise<string | null>;
}) {
  const [form, setForm] = useState(member);
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const previewUrl = form.imageUrl?.trim() || null;

  useEffect(() => {
    setForm(member);
    setPreviewError(false);
  }, [member]);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await onUpload(file, "team");
    setUploading(false);
    if (!url) return;

    const next = { ...form, imageUrl: url };
    setForm(next);
    setPreviewError(false);
    await onSave(next);
    toast.success("Photo enregistrée");
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Rôle"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
      </div>
      <div className="mt-4">
        <Input
          label="Compétences"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Photo</label>
        {previewUrl && !previewError ? (
          <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full bg-primary-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={form.name || "Aperçu"}
              className="h-full w-full object-cover"
              onError={() => setPreviewError(true)}
            />
          </div>
        ) : null}
        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="text-sm"
          disabled={uploading}
        />
        {previewUrl && <p className="mt-1 text-xs text-text-muted">{previewUrl}</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <Button loading={saving || uploading} onClick={() => onSave(form)}>
          Enregistrer
        </Button>
        <Button variant="danger" loading={saving} onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}

function SectorEditor({
  sector,
  saving,
  onSave,
  onUpload,
}: {
  sector: Sector;
  saving: boolean;
  onSave: (data: Sector) => Promise<void>;
  onUpload: (file: File, prefix: string) => Promise<string | null>;
}) {
  const [form, setForm] = useState(sector);
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const previewUrl = form.imageUrl?.trim() || null;

  useEffect(() => {
    setForm(sector);
    setPreviewError(false);
  }, [sector]);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await onUpload(file, "sector");
    setUploading(false);
    if (!url) return;

    const next = { ...form, imageUrl: url };
    setForm(next);
    setPreviewError(false);
    // Persist immediately so the public secteurs pages get the new image.
    await onSave(next);
    toast.success("Image enregistrée");
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <h3 className="mb-4 font-semibold">{sector.name}</h3>
      <Input
        label="Nom"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <div className="mt-4">
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Image</label>
        {previewUrl && !previewError ? (
          <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-primary-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={form.name || "Aperçu secteur"}
              className="h-full w-full object-cover"
              onError={() => setPreviewError(true)}
            />
          </div>
        ) : null}
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" disabled={uploading} />
        {previewUrl && <p className="mt-1 text-xs text-text-muted">{previewUrl}</p>}
      </div>
      <Button
        className="mt-4"
        loading={saving || uploading}
        onClick={() => onSave(form)}
      >
        Enregistrer
      </Button>
    </div>
  );
}

function CareersEditor({
  settings,
  saving,
  onSave,
}: {
  settings: CareersSettings;
  saving: boolean;
  onSave: (data: CareersSettings) => Promise<void>;
}) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input
        label="Titre"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <div className="mt-4">
        <Textarea
          label="Contenu"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Téléphone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <Button className="mt-4" loading={saving} onClick={() => onSave(form)}>
        Enregistrer
      </Button>
    </div>
  );
}

function SettingsEditor({
  settings,
  saving,
  onSave,
}: {
  settings: SiteSettings;
  saving: boolean;
  onSave: (data: SiteSettings) => Promise<void>;
}) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="WhatsApp"
          value={form.whatsappNumber}
          onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
        />
        <Input
          label="Email contact"
          value={form.contactEmail}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
        />
        <Input
          label="Téléphone contact"
          value={form.contactPhone}
          onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
        />
        <Input
          label="Adresse"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <Button className="mt-4" loading={saving} onClick={() => onSave(form)}>
        Enregistrer
      </Button>
    </div>
  );
}
