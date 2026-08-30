"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormationsManager } from "@/components/admin/FormationsManager";
import { PacksManager } from "@/components/admin/PacksManager";
import { PageBlockBuilder } from "@/components/admin/PageBlockBuilder";
import { TabExtraBlocksEditor } from "@/components/admin/TabExtraBlocksEditor";
import {
  pageBlocks,
  SectionBlocksEditor,
  sortAboutBlocks,
  type ContentBlock,
} from "@/components/admin/SectionBlocksEditor";
import { TabLabelEditor } from "@/components/admin/TabLabelEditor";
import { adminFetch } from "@/lib/admin-fetch";
import {
  ADMIN_CONTENT_TAB_IDS,
  DEFAULT_CONTENT_LABELS,
  PUBLIC_NAV_LABEL_IDS,
} from "@/lib/seed-data";
import {
  customPageIdFromTab,
  customPageTabId,
  EMPTY_PAGE_BLOCKS,
  isProtectedContentTab,
  normalizePageSlug,
  parsePageBlocks,
  type PageBlock,
} from "@/lib/page-blocks";

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

interface CustomPageItem {
  id: string;
  slug: string;
  title: string;
  showInNav: boolean;
  sortOrder: number;
  blocks: PageBlock[];
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
  const [about, setAbout] = useState<ContentBlock[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [careers, setCareers] = useState<CareersSettings>(DEFAULT_CAREERS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [pages, setPages] = useState<PageContentItem[]>([]);
  const [ged, setGed] = useState<GedService>(DEFAULT_GED);
  const [labels, setLabels] = useState<Record<string, string>>({
    ...DEFAULT_CONTENT_LABELS,
  });
  const [customPages, setCustomPages] = useState<CustomPageItem[]>([]);
  const [layouts, setLayouts] = useState<Record<string, PageBlock[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newShowInNav, setNewShowInNav] = useState(true);
  const [newSlugTouched, setNewSlugTouched] = useState(false);

  const loadContent = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    try {
      const result = await adminFetch<Record<string, unknown>>("/api/admin/content");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const data = result.data;

      setAbout(Array.isArray(data.about) ? data.about : []);
      setTeam(Array.isArray(data.team) ? data.team : []);
      setSectors(Array.isArray(data.sectors) ? data.sectors : []);
      setCareers((data.careers as CareersSettings) || DEFAULT_CAREERS);
      setSettings((data.settings as SiteSettings) || DEFAULT_SETTINGS);
      setPages(Array.isArray(data.pages) ? data.pages : []);
      setGed((data.ged as GedService) || DEFAULT_GED);
      setLabels({
        ...DEFAULT_CONTENT_LABELS,
        ...(data.labels && typeof data.labels === "object"
          ? (data.labels as Record<string, string>)
          : {}),
      });
      setCustomPages(
        Array.isArray(data.customPages)
          ? (data.customPages as CustomPageItem[]).map((page) => ({
              id: String(page.id),
              slug: String(page.slug || ""),
              title: String(page.title || ""),
              showInNav: Boolean(page.showInNav),
              sortOrder: Number(page.sortOrder) || 0,
              blocks: parsePageBlocks(page.blocks),
            }))
          : []
      );
      const nextLayouts: Record<string, PageBlock[]> = {};
      if (data.layouts && typeof data.layouts === "object") {
        for (const [key, value] of Object.entries(
          data.layouts as Record<string, unknown>
        )) {
          nextLayouts[key] = parsePageBlocks(value);
        }
      }
      setLayouts(nextLayouts);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  async function save(section: string, data: object): Promise<false | unknown> {
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
      try {
        const json = (await res.json()) as { data?: unknown };
        return json?.data ?? true;
      } catch {
        return true;
      }
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

  function tabLabel(id: string): string {
    return labels[id]?.trim() || DEFAULT_CONTENT_LABELS[id] || id;
  }

  async function saveLabel(id: string, label: string): Promise<boolean> {
    const next = label.trim() || DEFAULT_CONTENT_LABELS[id] || id;
    const ok = Boolean(await save("label", { id, label: next }));
    if (ok) {
      setLabels((prev) => ({ ...prev, [id]: next }));
    }
    return ok;
  }

  const tabs = [
    ...ADMIN_CONTENT_TAB_IDS.map((id) => ({
      id,
      label: tabLabel(id),
    })),
    ...customPages.map((page) => ({
      id: customPageTabId(page.id),
      label: page.title.trim() || page.slug || "Nouvelle page",
    })),
  ];

  const activeCustomId = customPageIdFromTab(activeTab);
  const activeCustom = customPages.find((page) => page.id === activeCustomId);

  async function createCustomPage() {
    const title = newTitle.trim();
    if (!title) {
      toast.error("Saisissez le nom de la page");
      return;
    }
    const created = await save("custom-page", {
      title,
      slug: normalizePageSlug(newSlug, title),
      showInNav: newShowInNav,
      blocks: [],
    });
    if (!created || typeof created !== "object" || !("id" in created)) return;
    setCreateOpen(false);
    setNewTitle("");
    setNewSlug("");
    setNewShowInNav(true);
    setNewSlugTouched(false);
    await loadContent();
    setActiveTab(customPageTabId(String((created as { id: string }).id)));
  }

  async function removeCustomPage(page: CustomPageItem) {
    if (isProtectedContentTab(page.id)) {
      toast.error("Cette page système ne peut pas être supprimée");
      return;
    }
    const label = page.title.trim() || page.slug || "cette page";
    if (!confirm(`Supprimer définitivement la page « ${label} » et tout son contenu ?`)) {
      return;
    }

    const previousPages = customPages;
    const previousTab = activeTab;
    setCustomPages((list) => list.filter((item) => item.id !== page.id));
    setActiveTab("about");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "custom-page-delete", data: { id: page.id } }),
      });
      if (!res.ok) {
        setCustomPages(previousPages);
        setActiveTab(previousTab);
        toast.error(await readErrorMessage(res));
        return;
      }
      toast.success("Page supprimée");
      await loadContent({ silent: true });
    } catch {
      setCustomPages(previousPages);
      setActiveTab(previousTab);
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-900">Contenu & Pages</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const customId = customPageIdFromTab(tab.id);
          const customPage = customId
            ? customPages.find((page) => page.id === customId)
            : undefined;
          const active = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              className={`inline-flex items-center rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-primary-900 text-white shadow-sm"
                  : "border border-primary-100 bg-white text-text-muted"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 ${active ? "" : "hover:bg-accent-50"} rounded-lg`}
              >
                {tab.label}
              </button>
              {customPage ? (
                <button
                  type="button"
                  disabled={saving}
                  title="Supprimer cette page"
                  aria-label={`Supprimer ${tab.label}`}
                  onClick={() => removeCustomPage(customPage)}
                  className={`mr-1 rounded-md p-1.5 transition ${
                    active
                      ? "text-white/80 hover:bg-white/15 hover:text-white"
                      : "text-text-muted hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setNewTitle("");
            setNewSlug("");
            setNewShowInNav(true);
            setNewSlugTouched(false);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-accent-400 bg-accent-50 px-4 py-2 text-sm font-medium text-primary-800 transition hover:bg-accent-100"
        >
          <Plus className="h-4 w-4" />
          Ajouter une nouvelle page
        </button>
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouvelle page"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nom de la page"
            value={newTitle}
            required
            placeholder="Ex: Notre méthode"
            onChange={(e) => {
              const next = e.target.value;
              setNewTitle(next);
              if (!newSlugTouched) setNewSlug(normalizePageSlug(next));
            }}
          />
          <Input
            label="Slug (URL)"
            value={newSlug}
            placeholder="notre-methode"
            onChange={(e) => {
              setNewSlugTouched(true);
              setNewSlug(normalizePageSlug(e.target.value));
            }}
          />
          <label className="flex items-center gap-2 text-sm text-primary-900">
            <input
              type="checkbox"
              checked={newShowInNav}
              onChange={(e) => setNewShowInNav(e.target.checked)}
              className="h-4 w-4 rounded border-primary-200"
            />
            Afficher dans le menu du site
          </label>
          <p className="text-xs text-text-muted">
            Adresse publique : /{normalizePageSlug(newSlug, newTitle) || "…"}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button loading={saving} onClick={createCustomPage}>
              Créer la page
            </Button>
          </div>
        </div>
      </Modal>

      {!activeCustom && (
        <>
          <TabLabelEditor
            tabId={activeTab}
            value={tabLabel(activeTab)}
            fallback={DEFAULT_CONTENT_LABELS[activeTab] || activeTab}
            saving={saving}
            onSave={(label) => saveLabel(activeTab, label)}
          />
          <p className="mb-6 rounded-xl border border-primary-100 bg-white px-4 py-3 text-xs text-text-muted">
            Page système protégée : cet onglet ne peut pas être supprimé, pour ne pas casser
            la navigation. Vous pouvez ajouter, modifier ou supprimer des blocs et sections
            ci-dessous.
          </p>
        </>
      )}

      {activeCustom && (
        <CustomPageEditor
          page={activeCustom}
          saving={saving}
          onSave={async (data) => {
            const result = await save("custom-page", data);
            if (result) await loadContent();
          }}
          onDelete={() => removeCustomPage(activeCustom)}
        />
      )}

      {activeTab === "about" && (
        <SectionBlocksEditor
          blocks={sortAboutBlocks(about)}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("about", data);
            if (ok) await loadContent();
          }}
          onAdd={async () => {
            const ok = await save("about", {
              key: `section-${crypto.randomUUID()}`,
              title: "Nouvelle section",
              content: "",
            });
            if (ok) await loadContent();
          }}
          onDelete={async (key) => {
            const ok = await save("about-delete", { key });
            if (ok) await loadContent();
          }}
        />
      )}

      {activeTab === "homepage" && (
        <SectionBlocksEditor
          blocks={pageBlocks(pages, "homepage_presentation", "homepage:")}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("page", data);
            if (ok) await loadContent();
          }}
          onAdd={async () => {
            const hasPrimary = pages.some((page) => page.key === "homepage_presentation");
            const ok = await save("page", {
              key: hasPrimary ? `homepage:${crypto.randomUUID()}` : "homepage_presentation",
              title: "Nouvelle section",
              content: "",
            });
            if (ok) await loadContent();
          }}
          onDelete={async (key) => {
            const ok = await save("page-delete", { key });
            if (ok) await loadContent();
          }}
        />
      )}

      {activeTab === "formation" && (
        <SectionBlocksEditor
          blocks={pageBlocks(pages, "formation_intro", "formation:")}
          saving={saving}
          onSave={async (data) => {
            const ok = await save("page", data);
            if (ok) await loadContent();
          }}
          onAdd={async () => {
            const hasPrimary = pages.some((page) => page.key === "formation_intro");
            const ok = await save("page", {
              key: hasPrimary ? `formation:${crypto.randomUUID()}` : "formation_intro",
              title: "Nouvelle section",
              content: "",
            });
            if (ok) await loadContent();
          }}
          onDelete={async (key) => {
            const ok = await save("page-delete", { key });
            if (ok) await loadContent();
          }}
        />
      )}

      {activeTab === "formations" && (
        <FormationsManager heading={tabLabel("formations")} />
      )}

      {activeTab === "packs" && <PacksManager heading={tabLabel("packs")} />}

      {activeTab === "ged" && (
        <div className="space-y-6">
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
          <SectionBlocksEditor
            blocks={pages.filter((page) => page.key.startsWith("ged:"))}
            saving={saving}
            addLabel="Ajouter une section"
            onSave={async (data) => {
              const ok = await save("page", data);
              if (ok) await loadContent();
            }}
            onAdd={async () => {
              const ok = await save("page", {
                key: `ged:${crypto.randomUUID()}`,
                title: "Nouvelle section",
                content: "",
              });
              if (ok) await loadContent();
            }}
            onDelete={async (key) => {
              const ok = await save("page-delete", { key });
              if (ok) await loadContent();
            }}
          />
        </div>
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
                onDelete={async () => {
                  if (!confirm("Supprimer ce secteur ?")) return;
                  const ok = await save("sector-delete", { id: sector.id });
                  if (ok) await loadContent();
                }}
                onUpload={uploadImage}
              />
            ))
          )}
          <Button
            variant="outline"
            loading={saving}
            onClick={async () => {
              const ok = await save("sector", {
                name: "Nouveau secteur",
                description: "",
                order: sectors.length,
              });
              if (ok) await loadContent();
            }}
          >
            Ajouter une section
          </Button>
        </div>
      )}

      {activeTab === "careers" && (
        <div className="space-y-6">
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
          <SectionBlocksEditor
            blocks={pages.filter((page) => page.key.startsWith("careers:"))}
            saving={saving}
            addLabel="Ajouter une section"
            onSave={async (data) => {
              const ok = await save("page", data);
              if (ok) await loadContent();
            }}
            onAdd={async () => {
              const ok = await save("page", {
                key: `careers:${crypto.randomUUID()}`,
                title: "Nouvelle section",
                content: "",
              });
              if (ok) await loadContent();
            }}
            onDelete={async (key) => {
              const ok = await save("page-delete", { key });
              if (ok) await loadContent();
            }}
          />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
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
          <div className="rounded-2xl border border-primary-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-primary-900">
              Autres libellés du site
            </h3>
            <div className="space-y-4">
              {PUBLIC_NAV_LABEL_IDS.map((id) => (
                <TabLabelEditor
                  key={id}
                  tabId={id}
                  value={tabLabel(id)}
                  fallback={DEFAULT_CONTENT_LABELS[id] || id}
                  saving={saving}
                  onSave={(label) => saveLabel(id, label)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!activeCustom && (
        <TabExtraBlocksEditor
          tabId={activeTab}
          initialBlocks={layouts[activeTab] ?? EMPTY_PAGE_BLOCKS}
          saving={saving}
          onSave={async (blocks) => {
            const ok = await save("layout", { tabId: activeTab, blocks });
            if (ok) {
              setLayouts((prev) => ({ ...prev, [activeTab]: blocks }));
            }
          }}
        />
      )}
    </div>
  );
}

function CustomPageEditor({
  page,
  saving,
  onSave,
  onDelete,
}: {
  page: CustomPageItem;
  saving: boolean;
  onSave: (data: CustomPageItem) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [showInNav, setShowInNav] = useState(page.showInNav);
  const [blocks, setBlocks] = useState<PageBlock[]>(page.blocks);

  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setShowInNav(page.showInNav);
    setBlocks(page.blocks);
  }, [page.id, page.title, page.slug, page.showInNav, page.blocks]);

  const publicPath = `/${normalizePageSlug(slug, title) || page.slug}`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-primary-900">Paramètres de la page</h3>
          <Button type="button" variant="danger" size="sm" loading={saving} onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Supprimer cette page
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nom de la page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Slug (URL)"
            value={slug}
            onChange={(e) => setSlug(normalizePageSlug(e.target.value))}
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-primary-900">
          <input
            type="checkbox"
            checked={showInNav}
            onChange={(e) => setShowInNav(e.target.checked)}
            className="h-4 w-4 rounded border-primary-200"
          />
          Afficher dans le menu du site
        </label>
        <p className="mt-2 text-xs text-text-muted">
          Page publique :{" "}
          <a href={publicPath} className="text-accent-700 underline" target="_blank" rel="noreferrer">
            {publicPath}
          </a>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            loading={saving}
            onClick={() =>
              onSave({
                ...page,
                title: title.trim() || page.title,
                slug: normalizePageSlug(slug, title) || page.slug,
                showInNav,
                blocks,
              })
            }
          >
            Enregistrer la page
          </Button>
        </div>
      </div>

      <PageBlockBuilder blocks={blocks} saving={saving} onChange={setBlocks} />
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
  onDelete,
  onUpload,
}: {
  sector: Sector;
  saving: boolean;
  onSave: (data: Sector) => Promise<void>;
  onDelete: () => Promise<void>;
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
      <div className="mt-4 flex flex-wrap gap-2">
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
