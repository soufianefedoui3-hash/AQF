"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormationsManager } from "@/components/admin/FormationsManager";
import { PacksManager } from "@/components/admin/PacksManager";
import { TabExtraBlocksEditor } from "@/components/admin/TabExtraBlocksEditor";
import { VisualBlockCanvas } from "@/components/admin/VisualBlockCanvas";
import { VisualPageFrame } from "@/components/admin/VisualPageFrame";
import {
  pageBlocks,
  SectionBlocksEditor,
  sortAboutBlocks,
  type ContentBlock,
} from "@/components/admin/SectionBlocksEditor";
import { TabLabelEditor } from "@/components/admin/TabLabelEditor";
import { CareersPageBody } from "@/components/content/CareersPageBody";
import { FormationPageBody } from "@/components/content/FormationPageBody";
import { HomepageExplore } from "@/components/content/HomepageExplore";
import { HomepageStats } from "@/components/content/HomepageStats";
import { ProductsPageBody } from "@/components/content/ProductsPageBody";
import { SectorsPageBody } from "@/components/content/SectorsPageBody";
import { ServicesPageBody } from "@/components/content/ServicesPageBody";
import { adminFetch } from "@/lib/admin-fetch";
import { EditableRegion } from "@/components/admin/EditableRegion";
import { BuilderProvider } from "@/components/admin/builder/BuilderContext";
import { CanvasGuard } from "@/components/admin/builder/CanvasGuard";
import { ContentBuilderShell } from "@/components/admin/builder/ContentBuilderShell";
import { SERVICE_LINKS } from "@/lib/constants";
import { livePageHref } from "@/lib/preview-pages";
import {
  exploreDescKey,
  formationBenefitsFromLabels,
  resolveCopy,
  serviceDescKey,
  serviceImageKey,
  SITE_COPY_DEFAULTS,
  STAT_INDEXES,
  subtitleKey,
} from "@/lib/site-copy";
import {
  DEFAULT_CONTENT_LABELS,
  PUBLIC_NAV_LABEL_IDS,
} from "@/lib/seed-data";
import {
  customPageIdFromTab,
  customPageTabId,
  EMPTY_PAGE_BLOCKS,
  normalizePageSlug,
  parsePageBlocks,
  type PageBlock,
} from "@/lib/page-blocks";
import {
  CLONE_PAGE_KEYS,
  parseClonedCards,
  serializeClonedCards,
  weaveClonedCards,
  type ClonedCard,
} from "@/lib/cloned-cards";

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

interface SitePageItem {
  id: string;
  label: string;
  href: string;
  showInNav: boolean;
  sortOrder: number;
  kind: "system" | "custom";
  adminTab: boolean;
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
  const [sitePages, setSitePages] = useState<SitePageItem[]>([]);
  const [layouts, setLayouts] = useState<Record<string, PageBlock[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newShowInNav, setNewShowInNav] = useState(true);
  const [newSlugTouched, setNewSlugTouched] = useState(false);
  const [formationTypes, setFormationTypes] = useState<string[]>([]);
  const [productPacks, setProductPacks] = useState<
    { id: string; name: string; description: string; active?: boolean }[]
  >([]);

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
      const nextSitePages: SitePageItem[] = Array.isArray(data.sitePages)
        ? (data.sitePages as SitePageItem[])
            .filter((page) => page && page.id && page.adminTab !== false)
            .map((page) => ({
              id: String(page.id),
              label: String(page.label || ""),
              href: String(page.href || ""),
              showInNav: Boolean(page.showInNav),
              sortOrder: Number(page.sortOrder) || 0,
              kind: page.kind === "custom" ? "custom" : "system",
              adminTab: true,
            }))
        : [];
      setSitePages(nextSitePages);
      setActiveTab((prev) =>
        nextSitePages.some((page) => page.id === prev)
          ? prev
          : nextSitePages[0]?.id || prev
      );
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    let cancelled = false;
    async function loadExtras() {
      try {
        const [formationsRes, packsRes] = await Promise.all([
          fetch("/api/content/formations", { cache: "no-store" }),
          fetch("/api/admin/packs", { credentials: "include", cache: "no-store" }),
        ]);
        if (formationsRes.ok) {
          const data = await formationsRes.json();
          if (!cancelled && Array.isArray(data)) {
            setFormationTypes(data.map((item: unknown) => String(item)));
          }
        }
        if (packsRes.ok) {
          const data = await packsRes.json();
          if (!cancelled && Array.isArray(data)) {
            setProductPacks(
              data
                .filter((pack: { active?: boolean }) => pack.active !== false)
                .map((pack: { id: string; name: string; description: string }) => ({
                  id: String(pack.id),
                  name: String(pack.name || ""),
                  description: String(pack.description || ""),
                }))
            );
          }
        }
      } catch {
        /* preview extras stay empty */
      }
    }
    void loadExtras();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(
    section: string,
    data: object,
    options?: { silent?: boolean }
  ): Promise<false | unknown> {
    if (!options?.silent) setSaving(true);
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

      if (!options?.silent) toast.success("Enregistré");
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
      if (!options?.silent) setSaving(false);
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
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  function tabLabel(id: string): string {
    return labels[id]?.trim() || DEFAULT_CONTENT_LABELS[id] || id;
  }

  function applyLabels(updates: Record<string, string>) {
    setLabels((prev) => ({ ...prev, ...updates }));
  }

  function applyPageFields(key: string, next: { title?: string; content?: string }) {
    setPages((prev) =>
      prev.map((page) =>
        page.key === key
          ? {
              ...page,
              title: next.title !== undefined ? next.title : page.title,
              content: next.content !== undefined ? next.content : page.content,
            }
          : page
      )
    );
  }

  function cardsFromPage(key: string): ClonedCard[] {
    return parseClonedCards(pages.find((page) => page.key === key)?.content);
  }

  function writeClonePage(
    prev: PageContentItem[],
    key: string,
    items: ClonedCard[]
  ): PageContentItem[] {
    const content = serializeClonedCards(items);
    if (prev.some((page) => page.key === key)) {
      return prev.map((page) => (page.key === key ? { ...page, content } : page));
    }
    return [...prev, { key, title: "Cartes dupliquées", content }];
  }

  function applyCloneFields(key: string, id: string, patch: Partial<ClonedCard>) {
    setPages((prev) => {
      const current = parseClonedCards(prev.find((page) => page.key === key)?.content);
      return writeClonePage(
        prev,
        key,
        current.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    });
  }

  async function persistClones(key: string, items: ClonedCard[], message?: string) {
    setPages((prev) => writeClonePage(prev, key, items));
    const ok = await save(
      "page",
      { key, title: "Cartes dupliquées", content: serializeClonedCards(items) },
      { silent: true }
    );
    if (ok && message) toast.success(message);
    if (!ok) await loadContent({ silent: true });
    return Boolean(ok);
  }

  async function addClone(key: string, clone: ClonedCard, message: string) {
    let next: ClonedCard[] = [];
    setPages((prev) => {
      const current = parseClonedCards(prev.find((page) => page.key === key)?.content);
      next = [...current, clone];
      return writeClonePage(prev, key, next);
    });
    const ok = await save(
      "page",
      { key, title: "Cartes dupliquées", content: serializeClonedCards(next) },
      { silent: true }
    );
    if (ok) toast.success(message);
    else await loadContent({ silent: true });
    return Boolean(ok);
  }

  function valuesToCopy(values: Record<string, string>): { title: string; content: string } {
    const title = (values.title || values.name || values.label || "").trim();
    const content = (
      values.content ||
      values.description ||
      values.subtitle ||
      values.tagline ||
      values.cta ||
      Object.entries(values)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    ).trim();
    return { title: title || "Bloc dupliqué", content };
  }

  async function duplicateLooseBlock(payload: { label: string; values: Record<string, string> }) {
    const copy = valuesToCopy(payload.values);
    if (activeTab === "about" || activeTab === "team") {
      const section = {
        key: `section-${crypto.randomUUID()}`,
        title: copy.title,
        content: copy.content,
      };
      setAbout((prev) => [...prev, section]);
      const ok = await save("about", section, { silent: true });
      if (ok) toast.success("Bloc dupliqué");
      else await loadContent({ silent: true });
      return;
    }

    const prefix =
      activeTab === "homepage"
        ? "homepage:"
        : activeTab === "formation" || activeTab === "formations"
          ? "formation:"
          : activeTab === "packs" || activeTab === "ged"
            ? "ged:"
            : activeTab === "careers"
              ? "careers:"
              : activeTab === "news"
                ? "news:"
                : null;

    if (prefix) {
      await duplicatePageSection(
        { key: `${prefix}loose`, title: copy.title, content: copy.content },
        prefix
      );
      return;
    }

    const tabId = activeTab;
    const card = {
      id: crypto.randomUUID(),
      type: "card" as const,
      title: copy.title,
      content: copy.content,
    };
    const next = [...(layouts[tabId] ?? []), card];
    setLayouts((prev) => ({ ...prev, [tabId]: next }));
    const ok = await save("layout", { tabId, blocks: next }, { silent: true });
    if (ok) toast.success("Bloc dupliqué");
    else await loadContent({ silent: true });
  }

  async function duplicatePageSection(
    source: { key: string; title: string | null; content: string },
    prefix: string
  ) {
    const copy = {
      key: `${prefix}${crypto.randomUUID()}`,
      title: source.title || "",
      content: source.content || "",
    };
    setPages((prev) => {
      const next = [...prev];
      const index = next.findIndex((page) => page.key === source.key);
      next.splice(index < 0 ? next.length : index + 1, 0, copy);
      return next;
    });
    const ok = await save("page", copy, { silent: true });
    if (ok) toast.success("Section dupliquée");
    else await loadContent({ silent: true });
  }

  async function deletePageSection(key: string) {
    setPages((prev) => prev.filter((item) => item.key !== key));
    const ok = await save("page-delete", { key }, { silent: true });
    if (ok) toast.success("Section supprimée");
    else await loadContent({ silent: true });
  }

  async function saveLabels(updates: Record<string, string>): Promise<boolean> {
    applyLabels(updates);
    const items = Object.entries(updates).map(([id, label]) => ({ id, label }));
    return Boolean(await save("labels", { items }, { silent: true }));
  }

  async function saveLabel(id: string, label: string): Promise<boolean> {
    const next = label.trim() || DEFAULT_CONTENT_LABELS[id] || id;
    applyLabels({ [id]: next });
    setSitePages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, label: next } : page))
    );
    return Boolean(await save("label", { id, label: next }, { silent: true }));
  }

  const tabs = sitePages.map((page) => ({
    id: page.id,
    label: page.label.trim() || tabLabel(page.id),
    showInNav: page.showInNav,
  }));

  const previewNavLinks = sitePages
    .filter((page) => page.showInNav && page.href)
    .map((page) => ({
      id: page.id,
      href: page.href,
      label: page.label.trim() || tabLabel(page.id),
    }));

  const serviceLinks = SERVICE_LINKS.map((link) => ({
    href: link.href,
    title:
      link.href === "/services/accompagnement"
        ? tabLabel("accompagnement") || link.title
        : link.href === "/services/audit"
          ? tabLabel("audit") || link.title
          : link.href === "/services/produits"
            ? tabLabel("products") || link.title
            : tabLabel("formation") || link.title,
    description: resolveCopy(labels, serviceDescKey(link.href), link.description),
    imageUrl: labels[serviceImageKey(link.href)]?.trim() || "",
  }));
  const serviceClones = cardsFromPage(CLONE_PAGE_KEYS.services);
  const serviceCards = weaveClonedCards(
    serviceLinks.map((link) => ({ ...link, id: link.href })),
    serviceClones,
    (clone) => ({
      id: clone.id,
      href: clone.href || "/",
      title: clone.title,
      description: clone.description,
      imageUrl: clone.imageUrl || "",
    })
  );
  const exploreClones = cardsFromPage(CLONE_PAGE_KEYS.explore);
  const exploreCards = weaveClonedCards(
    previewNavLinks
      .filter((link) => link.href !== "/")
      .map((link) => ({
        id: link.href,
        href: link.href,
        label: link.label,
        description: resolveCopy(labels, exploreDescKey(link.href)),
      })),
    exploreClones,
    (clone) => ({
      id: clone.id,
      href: clone.href || "/",
      label: clone.title,
      description: clone.description,
    })
  );
  const statClones = cardsFromPage(CLONE_PAGE_KEYS.stats);
  const statCards = weaveClonedCards(
    STAT_INDEXES.map((slot) => ({
      id: `stat-${slot}`,
      slot,
      value: resolveCopy(labels, `stat_${slot}_value`),
      label: resolveCopy(labels, `stat_${slot}_label`),
    })),
    statClones,
    (clone) => ({
      id: clone.id,
      value: clone.value || "",
      label: clone.label || clone.title,
    })
  );

  const previewFooter = {
    email: settings.contactEmail || "contact@aqf.ma",
    phone: settings.contactPhone || "+212 600 000 000",
    address: settings.address || "Maroc",
    serviceLinks,
  };

  const activeCustomId = customPageIdFromTab(activeTab);
  const activeCustom = customPages.find((page) => page.id === activeCustomId);
  const activeSitePage = sitePages.find((page) => page.id === activeTab);
  const previewHref = livePageHref(activeTab, activeSitePage?.href);
  const previewTitle =
    activeTab === "careers"
      ? careers.title.trim() || tabLabel("careers")
      : activeTab === "formation" || activeTab === "formations"
        ? pageBlocks(pages, "formation_intro", "formation:")[0]?.title?.trim() ||
          tabLabel("formation")
        : activeTab === "packs" || activeTab === "ged"
          ? tabLabel("products")
          : activeTab === "team"
            ? tabLabel("about")
            : tabLabel(activeTab);
  const previewSubtitle = resolveCopy(labels, subtitleKey(activeTab));
  const previewHero = activeTab === "homepage" ? "homepage" : "page";
  const previewBack =
    activeTab === "formation" ||
    activeTab === "formations" ||
    activeTab === "packs" ||
    activeTab === "ged"
      ? {
          backHref: "/services",
          backLabel: resolveCopy(labels, "back_to_services"),
        }
      : {};
  const footerCopy = {
    tagline: resolveCopy(labels, "footer_tagline"),
    navTitle: resolveCopy(labels, "footer_nav"),
    servicesTitle: resolveCopy(labels, "footer_services"),
    contactTitle: resolveCopy(labels, "footer_contact"),
    copyright: resolveCopy(labels, "footer_copyright"),
  };

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

  async function removeTab(tabId: string) {
    const page = sitePages.find((item) => item.id === tabId);
    const customId = customPageIdFromTab(tabId);
    const custom = customId
      ? customPages.find((item) => item.id === customId)
      : undefined;
    const label =
      page?.label.trim() ||
      custom?.title.trim() ||
      tabLabel(tabId) ||
      "cette page";
    if (!confirm(`Supprimer définitivement « ${label} » du menu et de l'administration ?`)) {
      return;
    }

    const previousSite = sitePages;
    const previousCustom = customPages;
    const previousTab = activeTab;
    const remaining = sitePages.filter((item) => item.id !== tabId);
    setSitePages(remaining);
    if (customId) {
      setCustomPages((list) => list.filter((item) => item.id !== customId));
    }
    setActiveTab(remaining[0]?.id || "");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "site-page-delete", data: { id: tabId } }),
      });
      if (!res.ok) {
        setSitePages(previousSite);
        setCustomPages(previousCustom);
        setActiveTab(previousTab);
        toast.error(await readErrorMessage(res));
        return;
      }
      toast.success("Page supprimée");
      await loadContent({ silent: true });
    } catch {
      setSitePages(previousSite);
      setCustomPages(previousCustom);
      setActiveTab(previousTab);
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BuilderProvider onDuplicateRegion={duplicateLooseBlock}>
    <ContentBuilderShell
      pages={tabs}
      activeId={activeTab}
      saving={saving}
      pageHref={previewHref}
      showInNav={Boolean(activeSitePage?.showInNav)}
      onSelectPage={setActiveTab}
      onCreatePage={() => {
        setNewTitle("");
        setNewSlug("");
        setNewShowInNav(true);
        setNewSlugTouched(false);
        setCreateOpen(true);
      }}
      onDeletePage={activeTab ? () => removeTab(activeTab) : undefined}
      onToggleNav={
        activeSitePage
          ? async (showInNav) => {
              const ok = await save("site-page", { id: activeTab, showInNav }, { silent: true });
              if (ok) {
                setSitePages((prev) =>
                  prev.map((page) => (page.id === activeTab ? { ...page, showInNav } : page))
                );
              }
            }
          : undefined
      }
    >
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

      {activeCustom && (
        <CanvasGuard>
        <CustomPageEditor
          page={activeCustom}
          saving={saving}
          navLinks={previewNavLinks}
          footer={previewFooter}
          footerCopy={footerCopy}
          whatsappNumber={settings.whatsappNumber}
          onSaveFooterCopy={async (values) => {
            const ok = await saveLabels({
              footer_tagline: values.tagline,
              footer_nav: values.navTitle,
              footer_services: values.servicesTitle,
              footer_contact: values.contactTitle,
              footer_copyright: values.copyright,
            });
            if (!ok) return;
            const next = {
              ...settings,
              contactEmail: values.email,
              contactPhone: values.phone,
              address: values.address,
            };
            const saved = await save("settings", next);
            if (saved) setSettings(next);
          }}
          onSave={async (data) => {
            setCustomPages((prev) =>
              prev.map((page) => (page.id === data.id ? { ...page, ...data } : page))
            );
            const result = await save("custom-page", data, { silent: true });
            if (!result) await loadContent({ silent: true });
          }}
          onDelete={() => removeTab(customPageTabId(activeCustom.id))}
          onSelectNav={(link) => {
            if (link.id) setActiveTab(link.id);
          }}
        />
        </CanvasGuard>
      )}

      {!activeCustom && activeTab && activeTab !== "settings" ? (
      <CanvasGuard>
      <VisualPageFrame
        chrome="canvas"
        title={previewTitle}
        href={previewHref}
        subtitle={previewSubtitle}
        hero={previewHero}
        backHref={previewBack.backHref}
        backLabel={previewBack.backLabel}
        navLinks={previewNavLinks}
        activeHref={previewHref}
        showInNav={Boolean(activeSitePage?.showInNav)}
        saving={saving}
        footer={previewFooter}
        footerCopy={footerCopy}
        heroTagline={resolveCopy(labels, "hero_tagline")}
        whatsappNumber={settings.whatsappNumber}
        onSaveHeroTagline={(tagline) => saveLabels({ hero_tagline: tagline })}
        onSaveSubtitle={(subtitle) => saveLabels({ [subtitleKey(activeTab)]: subtitle })}
        onSaveFooterCopy={async (values) => {
          const ok = await saveLabels({
            footer_tagline: values.tagline,
            footer_nav: values.navTitle,
            footer_services: values.servicesTitle,
            footer_contact: values.contactTitle,
            footer_copyright: values.copyright,
          });
          if (!ok) return;
          const next = {
            ...settings,
            contactEmail: values.email,
            contactPhone: values.phone,
            address: values.address,
          };
          const saved = await save("settings", next);
          if (saved) setSettings(next);
        }}
        onRename={async (label) => {
          if (activeTab === "careers") {
            const next = { ...careers, title: label };
            const ok = await save("careers", next);
            if (ok) setCareers(next);
            return;
          }
          const labelId =
            activeTab === "team"
              ? "about"
              : activeTab === "formations"
                ? "formation"
                : activeTab === "ged"
                  ? "products"
                  : activeTab;
          await saveLabel(labelId, label);
        }}
        onToggleNav={async (showInNav) => {
          const ok = await save("site-page", { id: activeTab, showInNav });
          if (ok) {
            setSitePages((prev) =>
              prev.map((page) => (page.id === activeTab ? { ...page, showInNav } : page))
            );
          }
        }}
        onDelete={() => removeTab(activeTab)}
        onSelectNav={(link) => {
          if (link.id) setActiveTab(link.id);
        }}
      >
      {(activeTab === "about" || activeTab === "team") && (
        <SectionBlocksEditor
          variant="about"
          blocks={sortAboutBlocks(about)}
          team={team}
          teamTitle={tabLabel("team")}
          wrapTeamTitle={(node) => (
            <EditableRegion
              label="Titre équipe"
              disabled={saving}
              fields={[{ key: "title", label: "Titre" }]}
              values={{ title: tabLabel("team") }}
              onChange={(next) => applyLabels({ team: next.title })}
              onSave={(next) => saveLabel("team", next.title)}
            >
              {node}
            </EditableRegion>
          )}
          wrapMember={(member, node) => (
            <EditableRegion
              label={member.name}
              disabled={saving}
              fields={[
                { key: "name", label: "Nom" },
                { key: "role", label: "Rôle" },
                { key: "skills", label: "Compétences", type: "textarea", rows: 3 },
                { key: "imageUrl", label: "Photo", type: "image", prefix: "team" },
              ]}
              values={{
                name: member.name,
                role: member.role,
                skills: member.skills,
                imageUrl: member.imageUrl || "",
              }}
              onChange={(next) => {
                setTeam((prev) =>
                  prev.map((item) =>
                    item.id === member.id
                      ? { ...item, ...next, imageUrl: next.imageUrl || null }
                      : item
                  )
                );
              }}
              onSave={async (next) => {
                const ok = await save("team", {
                  ...member,
                  ...next,
                  imageUrl: next.imageUrl || null,
                });
                if (ok) await loadContent({ silent: true });
              }}
              onDelete={async () => {
                setTeam((prev) => prev.filter((item) => item.id !== member.id));
                const ok = await save("team-delete", { id: member.id }, { silent: true });
                if (ok) toast.success("Membre supprimé");
                else await loadContent({ silent: true });
              }}
              onDuplicate={async () => {
                const source = team.find((item) => item.id === member.id);
                const created = await save(
                  "team",
                  {
                    name: member.name,
                    role: member.role,
                    skills: member.skills,
                    imageUrl: member.imageUrl,
                    order: (source?.order ?? team.length) + 1,
                  },
                  { silent: true }
                );
                if (!created || typeof created !== "object") {
                  await loadContent({ silent: true });
                  return;
                }
                const copy = created as TeamMember;
                setTeam((prev) => {
                  const index = prev.findIndex((item) => item.id === member.id);
                  const next = [...prev];
                  next.splice(index < 0 ? next.length : index + 1, 0, copy);
                  return next;
                });
                toast.success("Membre dupliqué");
              }}
            >
              {node}
            </EditableRegion>
          )}
          saving={saving}
          onSave={async (data) => {
            setAbout((prev) =>
              prev.map((item) => (item.key === data.key ? { ...item, ...data } : item))
            );
            const ok = await save("about", data, { silent: true });
            if (!ok) await loadContent({ silent: true });
          }}
          onAdd={async () => {
            const section = {
              key: `section-${crypto.randomUUID()}`,
              title: "Nouvelle section",
              content: "",
            };
            setAbout((prev) => [...prev, section]);
            const ok = await save("about", section, { silent: true });
            if (ok) toast.success("Section ajoutée");
            else await loadContent({ silent: true });
          }}
          onDelete={async (key) => {
            setAbout((prev) => prev.filter((item) => item.key !== key));
            const ok = await save("about-delete", { key }, { silent: true });
            if (ok) toast.success("Section supprimée");
            else await loadContent({ silent: true });
          }}
          onDuplicate={async (block) => {
            const copy = {
              key: `section-${crypto.randomUUID()}`,
              title: block.title || "",
              content: block.content || "",
            };
            setAbout((prev) => {
              const index = prev.findIndex((item) => item.key === block.key);
              const next = [...prev];
              next.splice(index < 0 ? next.length : index + 1, 0, copy);
              return next;
            });
            const ok = await save("about", copy, { silent: true });
            if (ok) toast.success("Section dupliquée");
            else await loadContent({ silent: true });
          }}
        />
      )}

      {activeTab === "homepage" && (
        <>
          <SectionBlocksEditor
            variant="homepage"
            blocks={pageBlocks(pages, "homepage_presentation", "homepage:")}
            saving={saving}
            onSave={async (data) => {
              applyPageFields(data.key, { title: data.title || "", content: data.content });
              const ok = await save("page", data, { silent: true });
              if (!ok) await loadContent({ silent: true });
            }}
            onAdd={async () => {
              const hasPrimary = pages.some((page) => page.key === "homepage_presentation");
              const section = {
                key: hasPrimary ? `homepage:${crypto.randomUUID()}` : "homepage_presentation",
                title: "Nouvelle section",
                content: "",
              };
              setPages((prev) => [...prev, section]);
              const ok = await save("page", section, { silent: true });
              if (ok) toast.success("Section ajoutée");
              else await loadContent({ silent: true });
            }}
            onDelete={async (key) => {
              setPages((prev) => prev.filter((item) => item.key !== key));
              const ok = await save("page-delete", { key }, { silent: true });
              if (ok) toast.success("Section supprimée");
              else await loadContent({ silent: true });
            }}
            onDuplicate={async (block) => {
              await duplicatePageSection(block, "homepage:");
            }}
          />
          <HomepageStats
            stats={statCards}
            wrapStat={(stat, _index, node) => {
              const slot = stat.slot;
              const statId = stat.id || (slot ? `stat-${slot}` : "");
              return (
                <EditableRegion
                  label={slot ? `Statistique ${slot}` : "Statistique"}
                  disabled={saving}
                  fields={[
                    { key: "value", label: "Valeur" },
                    { key: "label", label: "Libellé" },
                  ]}
                  values={{ value: stat.value, label: stat.label }}
                  onChange={(next) => {
                    if (slot) {
                      applyLabels({
                        [`stat_${slot}_value`]: next.value,
                        [`stat_${slot}_label`]: next.label,
                      });
                      return;
                    }
                    applyCloneFields(CLONE_PAGE_KEYS.stats, statId, {
                      value: next.value,
                      label: next.label,
                    });
                  }}
                  onSave={(next) => {
                    if (slot) {
                      return saveLabels({
                        [`stat_${slot}_value`]: next.value,
                        [`stat_${slot}_label`]: next.label,
                      });
                    }
                    return persistClones(
                      CLONE_PAGE_KEYS.stats,
                      statClones.map((item) =>
                        item.id === statId
                          ? { ...item, value: next.value, label: next.label }
                          : item
                      )
                    );
                  }}
                  onDuplicate={async () => {
                    await addClone(
                      CLONE_PAGE_KEYS.stats,
                      {
                        id: crypto.randomUUID(),
                        afterId: statId,
                        title: stat.label,
                        description: "",
                        value: stat.value,
                        label: stat.label,
                      },
                      "Compteur dupliqué"
                    );
                  }}
                  onDelete={() => {
                    if (slot) {
                      return saveLabels({
                        [`stat_${slot}_value`]: "",
                        [`stat_${slot}_label`]: "",
                      });
                    }
                    return persistClones(
                      CLONE_PAGE_KEYS.stats,
                      statClones.filter((item) => item.id !== statId),
                      "Compteur supprimé"
                    );
                  }}
                >
                  {node}
                </EditableRegion>
              );
            }}
          />
          <HomepageExplore
            navLinks={exploreCards}
            title={resolveCopy(labels, "explore_title")}
            ctaLabel={resolveCopy(labels, "explore_cta")}
            wrapHeader={(node) => (
              <EditableRegion
                label="Titre explorer"
                disabled={saving}
                fields={[{ key: "title", label: "Titre" }]}
                values={{ title: resolveCopy(labels, "explore_title") }}
                onChange={(next) => applyLabels({ explore_title: next.title })}
                onSave={(next) => saveLabels({ explore_title: next.title })}
                onDelete={() => saveLabels({ explore_title: "" })}
              >
                {node}
              </EditableRegion>
            )}
            wrapCard={(link, node) => {
              const cardId = link.id || link.href;
              const isClone = exploreClones.some((item) => item.id === cardId);
              const description =
                link.description ?? resolveCopy(labels, exploreDescKey(link.href));
              return (
              <EditableRegion
                label={link.label}
                disabled={saving}
                fields={[{ key: "description", label: "Description", type: "textarea", rows: 3 }]}
                values={{ description }}
                onChange={(next) => {
                  if (isClone) {
                    applyCloneFields(CLONE_PAGE_KEYS.explore, cardId, {
                      description: next.description,
                    });
                    return;
                  }
                  applyLabels({ [exploreDescKey(link.href)]: next.description });
                }}
                onSave={(next) => {
                  if (isClone) {
                    return persistClones(
                      CLONE_PAGE_KEYS.explore,
                      exploreClones.map((item) =>
                        item.id === cardId
                          ? { ...item, description: next.description }
                          : item
                      )
                    );
                  }
                  return saveLabels({ [exploreDescKey(link.href)]: next.description });
                }}
                onDuplicate={async () => {
                  await addClone(
                    CLONE_PAGE_KEYS.explore,
                    {
                      id: crypto.randomUUID(),
                      afterId: cardId,
                      title: link.label,
                      description,
                      href: link.href,
                    },
                    "Carte dupliquée"
                  );
                }}
                onDelete={() => {
                  if (isClone) {
                    return persistClones(
                      CLONE_PAGE_KEYS.explore,
                      exploreClones.filter((item) => item.id !== cardId),
                      "Carte supprimée"
                    );
                  }
                  return saveLabels({ [exploreDescKey(link.href)]: "" });
                }}
              >
                {node}
              </EditableRegion>
              );
            }}
            wrapCta={(node) => (
              <EditableRegion
                label="Bouton explorer"
                disabled={saving}
                fields={[{ key: "cta", label: "Texte du bouton" }]}
                values={{ cta: resolveCopy(labels, "explore_cta") }}
                onChange={(next) => applyLabels({ explore_cta: next.cta })}
                onSave={(next) => saveLabels({ explore_cta: next.cta })}
                onDelete={() => saveLabels({ explore_cta: "" })}
              >
                {node}
              </EditableRegion>
            )}
          />
        </>
      )}

      {(activeTab === "formation" || activeTab === "formations") && (
        <FormationPageBody
          intro={pageBlocks(pages, "formation_intro", "formation:")[0]}
          extraSections={pageBlocks(pages, "formation_intro", "formation:").slice(1)}
          catalogTitle={tabLabel("formations")}
          formations={formationTypes}
          benefitsTitle={resolveCopy(labels, "formation_benefits_title")}
          benefits={formationBenefitsFromLabels(labels)}
          enrollTitle={resolveCopy(labels, "formation_enroll_title")}
          emptyLabel={resolveCopy(labels, "formation_empty")}
          wrapIntro={(node) => {
            const intro = pageBlocks(pages, "formation_intro", "formation:")[0];
            return (
              <EditableRegion
                label="Introduction"
                disabled={saving}
                fields={[
                  { key: "title", label: "Titre" },
                  { key: "content", label: "Texte", type: "textarea", rows: 6 },
                ]}
                values={{
                  title: intro?.title || "",
                  content: intro?.content || "",
                }}
                onChange={(next) => applyPageFields(intro?.key || "formation_intro", next)}
                onSave={async (next) => {
                  const ok = await save("page", {
                    key: intro?.key || "formation_intro",
                    title: next.title,
                    content: next.content,
                  });
                  if (ok) await loadContent({ silent: true });
                }}
                onAdd={async () => {
                  const ok = await save("page", {
                    key: `formation:${crypto.randomUUID()}`,
                    title: "Nouvelle section",
                    content: "",
                  });
                  if (ok) await loadContent({ silent: true });
                }}
                onDuplicate={async () => {
                  await duplicatePageSection(
                    {
                      key: intro?.key || "formation_intro",
                      title: intro?.title || "",
                      content: intro?.content || "",
                    },
                    "formation:"
                  );
                }}
                onDelete={async () => {
                  applyPageFields(intro?.key || "formation_intro", { title: "", content: "" });
                  await save(
                    "page",
                    { key: intro?.key || "formation_intro", title: "", content: "" },
                    { silent: true }
                  );
                }}
              >
                {node}
              </EditableRegion>
            );
          }}
          wrapExtra={(section, node) => (
            <EditableRegion
              label="Section"
              disabled={saving}
              fields={[
                { key: "title", label: "Titre" },
                { key: "content", label: "Texte", type: "textarea", rows: 5 },
              ]}
              values={{ title: section.title || "", content: section.content }}
              onChange={(next) => applyPageFields(section.key, next)}
              onSave={async (next) => {
                const ok = await save("page", {
                  key: section.key,
                  title: next.title,
                  content: next.content,
                });
                if (ok) await loadContent({ silent: true });
              }}
              onDelete={async () => {
                await deletePageSection(section.key);
              }}
              onDuplicate={async () => {
                await duplicatePageSection(section, "formation:");
              }}
            >
              {node}
            </EditableRegion>
          )}
          wrapCatalog={(node) => (
            <EditableRegion
              label="Catalogue formation"
              disabled={saving}
              fields={[
                { key: "benefitsTitle", label: "Titre des bénéfices" },
                { key: "benefits", label: "Bénéfices (un par ligne)", type: "textarea", rows: 8 },
                { key: "catalogTitle", label: "Titre du catalogue" },
                { key: "emptyLabel", label: "Message si vide" },
              ]}
              values={{
                benefitsTitle: resolveCopy(labels, "formation_benefits_title"),
                benefits: resolveCopy(labels, "formation_benefits"),
                catalogTitle: tabLabel("formations"),
                emptyLabel: resolveCopy(labels, "formation_empty"),
              }}
              onChange={(next) => {
                applyLabels({
                  formation_benefits_title: next.benefitsTitle,
                  formation_benefits: next.benefits,
                  formation_empty: next.emptyLabel,
                  formations: next.catalogTitle,
                });
              }}
              onSave={async (next) => {
                await saveLabels({
                  formation_benefits_title: next.benefitsTitle,
                  formation_benefits: next.benefits,
                  formation_empty: next.emptyLabel,
                });
                await saveLabel("formations", next.catalogTitle);
              }}
            >
              {node}
            </EditableRegion>
          )}
          wrapEnroll={(node) => (
            <EditableRegion
              label="Inscription"
              disabled={saving}
              fields={[{ key: "title", label: "Titre" }]}
              values={{ title: resolveCopy(labels, "formation_enroll_title") }}
              onChange={(next) => applyLabels({ formation_enroll_title: next.title })}
              onSave={(next) => saveLabels({ formation_enroll_title: next.title })}
              onDelete={() => saveLabels({ formation_enroll_title: "" })}
            >
              {node}
            </EditableRegion>
          )}
        />
      )}

      {activeTab === "formations" && (
        <div className="border-t border-primary-50 bg-surface-muted/30 px-6 py-6">
          <FormationsManager heading={tabLabel("formations")} />
        </div>
      )}

      {(activeTab === "packs" || activeTab === "ged") && (
        <ProductsPageBody
          packsTitle={tabLabel("packs")}
          gedTitle={tabLabel("ged")}
          packs={productPacks}
          ged={ged}
          extraSections={pages.filter((page) => page.key.startsWith("ged:"))}
          packsBadge={resolveCopy(labels, "products_packs_badge")}
          packsSubtitle={resolveCopy(labels, "products_packs_subtitle")}
          gedBadge={resolveCopy(labels, "products_ged_badge")}
          gedSubtitle={resolveCopy(labels, "products_ged_subtitle")}
          gedFallback={resolveCopy(labels, "products_ged_fallback")}
          emptyLabel={resolveCopy(labels, "products_empty")}
          wrapPacksHeader={(node) => (
            <EditableRegion
              label="En-tête packs"
              disabled={saving}
              fields={[
                { key: "badge", label: "Badge" },
                { key: "title", label: "Titre" },
                { key: "subtitle", label: "Sous-titre", type: "textarea", rows: 2 },
              ]}
              values={{
                badge: resolveCopy(labels, "products_packs_badge"),
                title: tabLabel("packs"),
                subtitle: resolveCopy(labels, "products_packs_subtitle"),
              }}
              onChange={(next) => {
                applyLabels({
                  products_packs_badge: next.badge,
                  packs: next.title,
                  products_packs_subtitle: next.subtitle,
                });
              }}
              onSave={async (next) => {
                await saveLabels({
                  products_packs_badge: next.badge,
                  products_packs_subtitle: next.subtitle,
                });
                await saveLabel("packs", next.title);
              }}
            >
              {node}
            </EditableRegion>
          )}
          wrapPack={(pack, node) => (
            <EditableRegion
              label={pack.name}
              disabled={saving}
              fields={[
                { key: "name", label: "Nom" },
                { key: "description", label: "Description", type: "textarea", rows: 4 },
              ]}
              values={{ name: pack.name, description: pack.description }}
              onChange={(next) => {
                setProductPacks((prev) =>
                  prev.map((item) =>
                    item.id === pack.id
                      ? { ...item, name: next.name, description: next.description }
                      : item
                  )
                );
              }}
              onSave={async (next) => {
                const res = await fetch("/api/admin/packs", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: pack.id,
                    name: next.name,
                    description: next.description,
                  }),
                });
                if (!res.ok) {
                  toast.error("Impossible d'enregistrer le pack");
                  return;
                }
                toast.success("Enregistré");
                setProductPacks((prev) =>
                  prev.map((item) =>
                    item.id === pack.id
                      ? { ...item, name: next.name, description: next.description }
                      : item
                  )
                );
              }}
              onDelete={async () => {
                const res = await fetch("/api/admin/packs", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: pack.id }),
                });
                if (!res.ok) {
                  toast.error("Impossible de supprimer le pack");
                  return;
                }
                toast.success("Pack supprimé");
                setProductPacks((prev) => prev.filter((item) => item.id !== pack.id));
              }}
              onDuplicate={async () => {
                const res = await fetch("/api/admin/packs", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: pack.name,
                    description: pack.description || " ",
                  }),
                });
                if (!res.ok) {
                  toast.error("Impossible de dupliquer le pack");
                  return;
                }
                const created = (await res.json()) as { id?: string };
                const copy = {
                  id: created.id || crypto.randomUUID(),
                  name: pack.name,
                  description: pack.description,
                };
                setProductPacks((prev) => {
                  const index = prev.findIndex((item) => item.id === pack.id);
                  const next = [...prev];
                  next.splice(index < 0 ? next.length : index + 1, 0, copy);
                  return next;
                });
                toast.success("Pack dupliqué");
              }}
            >
              {node}
            </EditableRegion>
          )}
          wrapGedHeader={(node) => (
            <EditableRegion
              label="En-tête GED"
              disabled={saving}
              fields={[
                { key: "badge", label: "Badge" },
                { key: "title", label: "Titre" },
                { key: "subtitle", label: "Sous-titre", type: "textarea", rows: 2 },
              ]}
              values={{
                badge: resolveCopy(labels, "products_ged_badge"),
                title: tabLabel("ged"),
                subtitle: resolveCopy(labels, "products_ged_subtitle"),
              }}
              onChange={(next) => {
                applyLabels({
                  products_ged_badge: next.badge,
                  ged: next.title,
                  products_ged_subtitle: next.subtitle,
                });
              }}
              onSave={async (next) => {
                await saveLabels({
                  products_ged_badge: next.badge,
                  products_ged_subtitle: next.subtitle,
                });
                await saveLabel("ged", next.title);
              }}
            >
              {node}
            </EditableRegion>
          )}
          wrapGed={(node) => (
            <EditableRegion
              label="GED"
              disabled={saving}
              fields={[
                { key: "title", label: "Titre" },
                { key: "description", label: "Description", type: "textarea", rows: 6 },
                { key: "fallback", label: "Texte de secours" },
                { key: "imageUrl", label: "Image", type: "image", prefix: "ged" },
              ]}
              values={{
                title: ged.title,
                description: ged.description,
                fallback: resolveCopy(labels, "products_ged_fallback"),
                imageUrl: ged.imageUrl || "",
              }}
              onChange={(next) => {
                setGed((prev) => ({
                  ...prev,
                  title: next.title,
                  description: next.description,
                  imageUrl: next.imageUrl || null,
                }));
                applyLabels({ products_ged_fallback: next.fallback });
              }}
              onSave={async (next) => {
                const payload = {
                  ...ged,
                  title: next.title,
                  description: next.description,
                  imageUrl: next.imageUrl || null,
                };
                const ok = await save("ged", payload);
                if (ok) setGed(payload);
                await saveLabels({ products_ged_fallback: next.fallback });
              }}
              onDuplicate={async () => {
                await duplicatePageSection(
                  { key: "ged", title: ged.title, content: ged.description },
                  "ged:"
                );
              }}
              onDelete={async () => {
                setGed((prev) => ({ ...prev, description: "" }));
                await save("ged", { ...ged, description: "" }, { silent: true });
              }}
            >
              {node}
            </EditableRegion>
          )}
          wrapExtra={(section, node) => (
            <EditableRegion
              label="Section GED"
              disabled={saving}
              fields={[
                { key: "title", label: "Titre" },
                { key: "content", label: "Texte", type: "textarea", rows: 5 },
              ]}
              values={{ title: section.title || "", content: section.content }}
              onChange={(next) => applyPageFields(section.key, next)}
              onSave={async (next) => {
                const ok = await save("page", {
                  key: section.key,
                  title: next.title,
                  content: next.content,
                });
                if (ok) await loadContent({ silent: true });
              }}
              onDelete={async () => {
                await deletePageSection(section.key);
              }}
              onDuplicate={async () => {
                await duplicatePageSection(section, "ged:");
              }}
            >
              {node}
            </EditableRegion>
          )}
        />
      )}

      {activeTab === "packs" && (
        <div className="border-t border-primary-50 bg-surface-muted/30 px-6 py-6">
          <PacksManager heading={tabLabel("packs")} />
        </div>
      )}

      {activeTab === "ged" && (
        <div className="border-t border-primary-50 bg-surface-muted/30 px-6 py-6">
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
        </div>
      )}

      {activeTab === "services" && (
        <ServicesPageBody
          services={serviceCards}
          ctaLabel={resolveCopy(labels, "service_cta")}
          wrapService={(service, node) => {
            const cardId = service.id || service.href;
            const isClone = serviceClones.some((item) => item.id === cardId);
            const titleId =
              service.href.includes("accompagnement")
                ? "accompagnement"
                : service.href.includes("audit")
                  ? "audit"
                  : service.href.includes("produits")
                    ? "products"
                    : "formation";
            return (
            <EditableRegion
              label={service.title}
              disabled={saving}
              fields={[
                { key: "title", label: "Titre" },
                { key: "description", label: "Description", type: "textarea", rows: 4 },
                { key: "cta", label: "Lien « Accéder »" },
                { key: "imageUrl", label: "Image / icône", type: "image", prefix: "service" },
              ]}
              values={{
                title: service.title,
                description: service.description,
                cta: resolveCopy(labels, "service_cta"),
                imageUrl: service.imageUrl || "",
              }}
              onChange={(next) => {
                if (isClone) {
                  applyCloneFields(CLONE_PAGE_KEYS.services, cardId, {
                    title: next.title,
                    description: next.description,
                    imageUrl: next.imageUrl,
                  });
                  applyLabels({ service_cta: next.cta });
                  return;
                }
                applyLabels({
                  [titleId]: next.title,
                  [serviceDescKey(service.href)]: next.description,
                  [serviceImageKey(service.href)]: next.imageUrl,
                  service_cta: next.cta,
                });
              }}
              onSave={async (next) => {
                if (isClone) {
                  await persistClones(
                    CLONE_PAGE_KEYS.services,
                    serviceClones.map((item) =>
                      item.id === cardId
                        ? {
                            ...item,
                            title: next.title,
                            description: next.description,
                            imageUrl: next.imageUrl,
                          }
                        : item
                    )
                  );
                  await saveLabels({ service_cta: next.cta });
                  return;
                }
                await saveLabels({
                  [titleId]: next.title,
                  [serviceDescKey(service.href)]: next.description,
                  [serviceImageKey(service.href)]: next.imageUrl,
                  service_cta: next.cta,
                });
              }}
              onDuplicate={async () => {
                await addClone(
                  CLONE_PAGE_KEYS.services,
                  {
                    id: crypto.randomUUID(),
                    afterId: cardId,
                    title: service.title,
                    description: service.description,
                    href: service.href,
                    imageUrl: service.imageUrl,
                  },
                  "Carte dupliquée"
                );
              }}
              onDelete={() => {
                if (isClone) {
                  return persistClones(
                    CLONE_PAGE_KEYS.services,
                    serviceClones.filter((item) => item.id !== cardId),
                    "Carte supprimée"
                  );
                }
                return saveLabels({ [serviceDescKey(service.href)]: "" });
              }}
            >
              {node}
            </EditableRegion>
            );
          }}
        />
      )}

      {activeTab === "team" && (
        <div className="border-t border-primary-50 bg-surface-muted/30 px-6 py-6">
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
            className="mt-4"
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
        <>
          <SectorsPageBody
            sectors={sectors}
            discoverLabel={resolveCopy(labels, "sectors_discover")}
            emptyDescription={resolveCopy(labels, "sectors_empty_desc")}
            wrapSector={(sector, node) => (
              <EditableRegion
                label={sector.name}
                disabled={saving}
                fields={[
                  { key: "name", label: "Nom" },
                  { key: "description", label: "Description", type: "textarea", rows: 5 },
                  { key: "discover", label: "Lien « Découvrir »" },
                  { key: "imageUrl", label: "Image", type: "image", prefix: "sector" },
                ]}
                values={{
                  name: sector.name,
                  description: sector.description,
                  discover: resolveCopy(labels, "sectors_discover"),
                  imageUrl: sector.imageUrl || "",
                }}
                onChange={(next) => {
                  setSectors((prev) =>
                    prev.map((item) =>
                      item.slug === sector.slug
                        ? {
                            ...item,
                            name: next.name,
                            description: next.description,
                            imageUrl: next.imageUrl || null,
                          }
                        : item
                    )
                  );
                  applyLabels({ sectors_discover: next.discover });
                }}
                onSave={async (next) => {
                  const match = sectors.find((item) => item.slug === sector.slug);
                  if (match) {
                    const ok = await save("sector", {
                      ...match,
                      name: next.name,
                      description: next.description,
                      imageUrl: next.imageUrl || null,
                    });
                    if (ok) await loadContent({ silent: true });
                  }
                  await saveLabels({ sectors_discover: next.discover });
                }}
                onDelete={async () => {
                  const match = sectors.find((item) => item.slug === sector.slug);
                  if (!match) return;
                  setSectors((prev) => prev.filter((item) => item.id !== match.id));
                  const ok = await save("sector-delete", { id: match.id }, { silent: true });
                  if (ok) toast.success("Secteur supprimé");
                  else await loadContent({ silent: true });
                }}
                onDuplicate={async () => {
                  const match = sectors.find((item) => item.slug === sector.slug);
                  const created = await save(
                    "sector",
                    {
                      name: sector.name,
                      description: sector.description,
                      imageUrl: match?.imageUrl ?? null,
                      order: (match?.order ?? sectors.length) + 1,
                    },
                    { silent: true }
                  );
                  if (!created || typeof created !== "object") {
                    await loadContent({ silent: true });
                    return;
                  }
                  const copy = created as Sector;
                  setSectors((prev) => {
                    const index = prev.findIndex((item) => item.slug === sector.slug);
                    const next = [...prev];
                    next.splice(index < 0 ? next.length : index + 1, 0, copy);
                    return next;
                  });
                  toast.success("Secteur dupliqué");
                }}
              >
                {node}
              </EditableRegion>
            )}
          />
          <div className="border-t border-primary-50 bg-surface-muted/30 px-6 py-6">
            {sectors.map((sector) => (
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
            ))}
            <Button
              variant="outline"
              className="mt-4"
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
        </>
      )}

      {activeTab === "careers" && (
        <CareersPageBody
          content={careers.content}
          email={careers.email}
          phone={careers.phone}
          extraSections={pages.filter((page) => page.key.startsWith("careers:"))}
          emailLabel={resolveCopy(labels, "careers_email_label")}
          phoneLabel={resolveCopy(labels, "careers_phone_label")}
          wrapIntro={(node) => (
            <EditableRegion
              label="Carrières"
              disabled={saving}
              fields={[
                { key: "content", label: "Texte", type: "textarea", rows: 6 },
                { key: "email", label: "Email" },
                { key: "phone", label: "Téléphone" },
                { key: "emailLabel", label: "Libellé email" },
                { key: "phoneLabel", label: "Libellé téléphone" },
              ]}
              values={{
                content: careers.content,
                email: careers.email,
                phone: careers.phone,
                emailLabel: resolveCopy(labels, "careers_email_label"),
                phoneLabel: resolveCopy(labels, "careers_phone_label"),
              }}
              onChange={(next) => {
                setCareers((prev) => ({
                  ...prev,
                  content: next.content,
                  email: next.email,
                  phone: next.phone,
                }));
                applyLabels({
                  careers_email_label: next.emailLabel,
                  careers_phone_label: next.phoneLabel,
                });
              }}
              onSave={async (next) => {
                const nextCareers = {
                  ...careers,
                  content: next.content,
                  email: next.email,
                  phone: next.phone,
                };
                const ok = await save("careers", nextCareers);
                if (ok) setCareers(nextCareers);
                await saveLabels({
                  careers_email_label: next.emailLabel,
                  careers_phone_label: next.phoneLabel,
                });
              }}
              onDuplicate={async () => {
                await duplicatePageSection(
                  {
                    key: "careers_intro",
                    title: "Carrières",
                    content: careers.content,
                  },
                  "careers:"
                );
              }}
              onDelete={async () => {
                const nextCareers = { ...careers, content: "" };
                setCareers(nextCareers);
                await save("careers", nextCareers, { silent: true });
              }}
            >
              {node}
            </EditableRegion>
          )}
          wrapExtra={(section, node) => (
            <EditableRegion
              label="Section carrières"
              disabled={saving}
              fields={[
                { key: "title", label: "Titre" },
                { key: "content", label: "Texte", type: "textarea", rows: 5 },
              ]}
              values={{ title: section.title || "", content: section.content }}
              onChange={(next) => applyPageFields(section.key, next)}
              onSave={async (next) => {
                const ok = await save("page", {
                  key: section.key,
                  title: next.title,
                  content: next.content,
                });
                if (ok) await loadContent({ silent: true });
              }}
              onDelete={async () => {
                await deletePageSection(section.key);
              }}
              onDuplicate={async () => {
                await duplicatePageSection(section, "careers:");
              }}
            >
              {node}
            </EditableRegion>
          )}
        />
      )}

      {activeTab === "careers" && (
        <div className="border-t border-primary-50 bg-surface-muted/30 px-6 py-6">
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
        </div>
      )}

      {(activeTab === "about" || activeTab === "team") && (
        <>
          <TabExtraBlocksEditor
            tabId="about"
            initialBlocks={layouts.about ?? EMPTY_PAGE_BLOCKS}
            saving={saving}
            onSave={async (blocks) => {
              const ok = await save("layout", { tabId: "about", blocks }, { silent: true });
              if (ok) setLayouts((prev) => ({ ...prev, about: blocks }));
            }}
          />
          <TabExtraBlocksEditor
            tabId="team"
            initialBlocks={layouts.team ?? EMPTY_PAGE_BLOCKS}
            saving={saving}
            onSave={async (blocks) => {
              const ok = await save("layout", { tabId: "team", blocks }, { silent: true });
              if (ok) setLayouts((prev) => ({ ...prev, team: blocks }));
            }}
          />
        </>
      )}

      {(activeTab === "formation" || activeTab === "formations") && (
        <>
          <TabExtraBlocksEditor
            tabId="formation"
            initialBlocks={layouts.formation ?? EMPTY_PAGE_BLOCKS}
            saving={saving}
            onSave={async (blocks) => {
              const ok = await save("layout", { tabId: "formation", blocks }, { silent: true });
              if (ok) setLayouts((prev) => ({ ...prev, formation: blocks }));
            }}
          />
          <TabExtraBlocksEditor
            tabId="formations"
            initialBlocks={layouts.formations ?? EMPTY_PAGE_BLOCKS}
            saving={saving}
            onSave={async (blocks) => {
              const ok = await save("layout", { tabId: "formations", blocks }, { silent: true });
              if (ok) setLayouts((prev) => ({ ...prev, formations: blocks }));
            }}
          />
        </>
      )}

      {(activeTab === "packs" || activeTab === "ged") && (
        <>
          <TabExtraBlocksEditor
            tabId="packs"
            initialBlocks={layouts.packs ?? EMPTY_PAGE_BLOCKS}
            saving={saving}
            onSave={async (blocks) => {
              const ok = await save("layout", { tabId: "packs", blocks }, { silent: true });
              if (ok) setLayouts((prev) => ({ ...prev, packs: blocks }));
            }}
          />
          <TabExtraBlocksEditor
            tabId="ged"
            initialBlocks={layouts.ged ?? EMPTY_PAGE_BLOCKS}
            saving={saving}
            onSave={async (blocks) => {
              const ok = await save("layout", { tabId: "ged", blocks }, { silent: true });
              if (ok) setLayouts((prev) => ({ ...prev, ged: blocks }));
            }}
          />
        </>
      )}

      {activeTab !== "about" &&
      activeTab !== "team" &&
      activeTab !== "formation" &&
      activeTab !== "formations" &&
      activeTab !== "packs" &&
      activeTab !== "ged" ? (
        <TabExtraBlocksEditor
          tabId={activeTab}
          initialBlocks={layouts[activeTab] ?? EMPTY_PAGE_BLOCKS}
          saving={saving}
          onSave={async (blocks) => {
            const ok = await save("layout", { tabId: activeTab, blocks }, { silent: true });
            if (ok) {
              setLayouts((prev) => ({ ...prev, [activeTab]: blocks }));
            }
          }}
        />
      ) : null}
      </VisualPageFrame>
      </CanvasGuard>
      ) : null}

      {activeTab === "settings" && (
        <div className="space-y-6 px-4 py-6 lg:px-8">
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
          <TabExtraBlocksEditor
            tabId={activeTab}
            initialBlocks={layouts[activeTab] ?? EMPTY_PAGE_BLOCKS}
            saving={saving}
            onSave={async (blocks) => {
              const ok = await save("layout", { tabId: activeTab, blocks }, { silent: true });
              if (ok) {
                setLayouts((prev) => ({ ...prev, [activeTab]: blocks }));
              }
            }}
          />
        </div>
      )}
    </ContentBuilderShell>
    </BuilderProvider>
  );
}

function CustomPageEditor({
  page,
  saving,
  navLinks,
  footer,
  footerCopy,
  whatsappNumber,
  onSave,
  onDelete,
  onSelectNav,
  onSaveFooterCopy,
}: {
  page: CustomPageItem;
  saving: boolean;
  navLinks: { id?: string; href: string; label: string }[];
  footer: {
    email: string;
    phone: string;
    address: string;
    serviceLinks: { href: string; title: string }[];
  };
  footerCopy?: {
    tagline: string;
    navTitle: string;
    servicesTitle: string;
    contactTitle: string;
    copyright: string;
  };
  whatsappNumber?: string;
  onSave: (data: CustomPageItem) => Promise<void>;
  onDelete: () => Promise<void>;
  onSelectNav?: (link: { id?: string; href: string; label: string }) => void;
  onSaveFooterCopy?: (values: {
    tagline: string;
    navTitle: string;
    servicesTitle: string;
    contactTitle: string;
    copyright: string;
    email: string;
    phone: string;
    address: string;
  }) => Promise<void> | void;
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

  function snapshot(next?: Partial<CustomPageItem>): CustomPageItem {
    return {
      ...page,
      title: title.trim() || page.title,
      slug: normalizePageSlug(slug, title) || page.slug,
      showInNav,
      blocks,
      ...next,
    };
  }

  return (
    <VisualPageFrame
      chrome="canvas"
      title={title}
      href={publicPath}
      navLinks={navLinks}
      activeHref={publicPath}
      showInNav={showInNav}
      saving={saving}
      footer={footer}
      footerCopy={footerCopy}
      whatsappNumber={whatsappNumber}
      onSaveFooterCopy={onSaveFooterCopy}
      onRename={async (nextTitle) => {
        setTitle(nextTitle);
        await onSave(snapshot({ title: nextTitle }));
      }}
      onToggleNav={async (next) => {
        setShowInNav(next);
        await onSave(snapshot({ showInNav: next }));
      }}
      onDelete={onDelete}
      onSelectNav={onSelectNav}
    >
      <div className="border-b border-accent-50 bg-accent-50/40 px-4 py-3 sm:px-6">
        <Input
          label="Slug (URL)"
          value={slug}
          onChange={(e) => setSlug(normalizePageSlug(e.target.value))}
          onBlur={() => void onSave(snapshot())}
        />
      </div>
      <VisualBlockCanvas
        blocks={blocks}
        saving={saving}
        onChange={setBlocks}
        onPersist={async (next) => {
          setBlocks(next);
          await onSave(snapshot({ blocks: next }));
        }}
      />
    </VisualPageFrame>
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
