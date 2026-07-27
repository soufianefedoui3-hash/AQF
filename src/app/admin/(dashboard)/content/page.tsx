"use client";

import { useEffect, useState } from "react";
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

export default function ContentPage() {
  const [about, setAbout] = useState<AboutSection[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [careers, setCareers] = useState<CareersSettings | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pages, setPages] = useState<PageContentItem[]>([]);
  const [ged, setGed] = useState<GedService | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((data) => {
        setAbout(data.about || []);
        setTeam(data.team || []);
        setSectors(data.sectors || []);
        setCareers(data.careers);
        setSettings(data.settings);
        setPages(data.pages || []);
        setGed(data.ged);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(section: string, data: object) {
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, data }),
    });

    if (res.ok) toast.success("Enregistré");
    else toast.error("Erreur");
  }

  async function uploadImage(file: File, prefix: string): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
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
                onSave={(data) => save("about", data)}
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
          onSave={(data) => save("page", data)}
        />
      )}

      {activeTab === "formation" && (
        <PageEditor
          pageKey="formation_intro"
          label="Introduction Formation Qualité"
          pages={pages}
          onSave={(data) => save("page", data)}
        />
      )}

      {activeTab === "formations" && <FormationsManager />}

      {activeTab === "packs" && <PacksManager />}

      {activeTab === "ged" && ged && (
        <GedEditor
          ged={ged}
          onSave={(data) => save("ged", data)}
          onUpload={uploadImage}
        />
      )}

      {activeTab === "team" && (
        <div className="space-y-4">
          {team.map((member) => (
            <TeamEditor
              key={member.id}
              member={member}
              onSave={(data) => save("team", data)}
              onDelete={() => save("team-delete", { id: member.id }).then(() => window.location.reload())}
            />
          ))}
          <Button
            onClick={() =>
              save("team", {
                name: "Nouveau membre",
                role: "Rôle",
                skills: "Compétences",
                order: team.length,
              }).then(() => window.location.reload())
            }
          >
            Ajouter un membre
          </Button>
        </div>
      )}

      {activeTab === "sectors" && (
        <div className="space-y-4">
          {sectors.map((sector) => (
            <SectorEditor
              key={sector.id}
              sector={sector}
              onSave={async (data) => {
                await save("sector", data);
              }}
              onUpload={uploadImage}
            />
          ))}
        </div>
      )}

      {activeTab === "careers" && careers && (
        <CareersEditor
          settings={careers}
          onSave={(data) => save("careers", data)}
        />
      )}

      {activeTab === "settings" && settings && (
        <SettingsEditor
          settings={settings}
          onSave={(data) => save("settings", data)}
        />
      )}
    </div>
  );
}

function PageEditor({
  pageKey,
  label,
  pages,
  onSave,
}: {
  pageKey: string;
  label: string;
  pages: PageContentItem[];
  onSave: (data: PageContentItem) => void;
}) {
  const existing = pages.find((p) => p.key === pageKey);
  const [title, setTitle] = useState(existing?.title || label);
  const [content, setContent] = useState(existing?.content || "");

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input label="Titre" value={title || ""} onChange={(e) => setTitle(e.target.value)} />
      <div className="mt-4">
        <Textarea label="Contenu" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <Button className="mt-4" onClick={() => onSave({ key: pageKey, title, content })}>
        Enregistrer
      </Button>
    </div>
  );
}

function GedEditor({
  ged,
  onSave,
  onUpload,
}: {
  ged: GedService;
  onSave: (data: GedService) => void;
  onUpload: (file: File, prefix: string) => Promise<string | null>;
}) {
  const [form, setForm] = useState(ged);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUpload(file, "ged");
    if (url) {
      setForm({ ...form, imageUrl: url });
      toast.success("Image uploadée");
    }
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <div className="mt-4">
        <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Image de prévisualisation</label>
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
        {form.imageUrl && <p className="mt-1 text-xs text-text-muted">{form.imageUrl}</p>}
      </div>
      <Button className="mt-4" onClick={() => onSave(form)}>Enregistrer</Button>
    </div>
  );
}

function AboutEditor({
  section,
  onSave,
}: {
  section: AboutSection;
  onSave: (data: AboutSection) => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="mt-4">
        <Textarea label="Contenu" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <Button className="mt-4" onClick={() => onSave({ key: section.key, title, content })}>
        Enregistrer
      </Button>
    </div>
  );
}

function TeamEditor({
  member,
  onSave,
  onDelete,
}: {
  member: TeamMember;
  onSave: (data: TeamMember) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(member);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Rôle" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
      </div>
      <div className="mt-4">
        <Input label="Compétences" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onSave(form)}>Enregistrer</Button>
        <Button variant="danger" onClick={onDelete}>Supprimer</Button>
      </div>
    </div>
  );
}

function SectorEditor({
  sector,
  onSave,
  onUpload,
}: {
  sector: Sector;
  onSave: (data: Sector) => Promise<void>;
  onUpload: (file: File, prefix: string) => Promise<string | null>;
}) {
  const [form, setForm] = useState(sector);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUpload(file, "sector");
    if (url) {
      setForm({ ...form, imageUrl: url });
      toast.success("Image uploadée");
    }
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <h3 className="mb-4 font-semibold">{sector.name}</h3>
      <Input label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <div className="mt-4">
        <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Image</label>
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
        {form.imageUrl && <p className="mt-1 text-xs text-text-muted">{form.imageUrl}</p>}
      </div>
      <Button className="mt-4" onClick={() => onSave(form)}>Enregistrer</Button>
    </div>
  );
}

function CareersEditor({
  settings,
  onSave,
}: {
  settings: CareersSettings;
  onSave: (data: CareersSettings) => void;
}) {
  const [form, setForm] = useState(settings);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <div className="mt-4">
        <Textarea label="Contenu" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <Button className="mt-4" onClick={() => onSave(form)}>Enregistrer</Button>
    </div>
  );
}

function SettingsEditor({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (data: SiteSettings) => void;
}) {
  const [form, setForm] = useState(settings);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="WhatsApp" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
        <Input label="Email contact" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        <Input label="Téléphone contact" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
        <Input label="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <Button className="mt-4" onClick={() => onSave(form)}>Enregistrer</Button>
    </div>
  );
}
