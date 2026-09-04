"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter, type FooterServiceLink } from "@/components/layout/SiteFooter";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { HomepageHero } from "@/components/content/HomepageHero";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import { EditableRegion } from "@/components/admin/EditableRegion";
import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";

export type PreviewNavLink = { id?: string; href: string; label: string };

export function VisualPageFrame({
  title,
  href,
  subtitle,
  hero = "page",
  backHref,
  backLabel,
  navLinks,
  activeHref,
  showInNav,
  saving,
  footer,
  footerCopy,
  heroTagline,
  whatsappNumber,
  onRename,
  onToggleNav,
  onDelete,
  onSelectNav,
  onSaveSubtitle,
  onSaveHeroTagline,
  onSaveFooterCopy,
  chrome = "framed",
  children,
}: {
  title: string;
  href?: string;
  subtitle?: string;
  hero?: "page" | "homepage";
  backHref?: string;
  backLabel?: string;
  navLinks: PreviewNavLink[];
  activeHref?: string;
  showInNav?: boolean;
  saving: boolean;
  footer: {
    email: string;
    phone: string;
    address: string;
    serviceLinks: FooterServiceLink[];
  };
  footerCopy?: {
    tagline: string;
    navTitle: string;
    servicesTitle: string;
    contactTitle: string;
    copyright: string;
  };
  heroTagline?: string;
  whatsappNumber?: string;
  onRename?: (title: string) => Promise<void> | void;
  onToggleNav?: (show: boolean) => Promise<void> | void;
  onDelete?: () => void;
  onSelectNav?: (link: PreviewNavLink) => void;
  onSaveSubtitle?: (subtitle: string) => Promise<unknown> | void;
  onSaveHeroTagline?: (tagline: string) => Promise<unknown> | void;
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
  chrome?: "framed" | "canvas";
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState(title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [liveHero, setLiveHero] = useState(heroTagline || "");
  const [liveSubtitle, setLiveSubtitle] = useState(subtitle || "");
  const [liveFooter, setLiveFooter] = useState({
    tagline: footerCopy?.tagline || SITE_COPY_DEFAULTS.footer_tagline,
    navTitle: footerCopy?.navTitle || SITE_COPY_DEFAULTS.footer_nav,
    servicesTitle: footerCopy?.servicesTitle || SITE_COPY_DEFAULTS.footer_services,
    contactTitle: footerCopy?.contactTitle || SITE_COPY_DEFAULTS.footer_contact,
    copyright: footerCopy?.copyright || SITE_COPY_DEFAULTS.footer_copyright,
    email: footer.email,
    phone: footer.phone,
    address: footer.address,
  });

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useEffect(() => {
    setLiveHero(heroTagline || "");
  }, [heroTagline]);

  useEffect(() => {
    setLiveSubtitle(subtitle || "");
  }, [subtitle]);

  useEffect(() => {
    setLiveFooter({
      tagline: footerCopy?.tagline || SITE_COPY_DEFAULTS.footer_tagline,
      navTitle: footerCopy?.navTitle || SITE_COPY_DEFAULTS.footer_nav,
      servicesTitle: footerCopy?.servicesTitle || SITE_COPY_DEFAULTS.footer_services,
      contactTitle: footerCopy?.contactTitle || SITE_COPY_DEFAULTS.footer_contact,
      copyright: footerCopy?.copyright || SITE_COPY_DEFAULTS.footer_copyright,
      email: footer.email,
      phone: footer.phone,
      address: footer.address,
    });
  }, [
    footer.email,
    footer.phone,
    footer.address,
    footerCopy?.tagline,
    footerCopy?.navTitle,
    footerCopy?.servicesTitle,
    footerCopy?.contactTitle,
    footerCopy?.copyright,
  ]);

  async function commitTitle() {
    const next = draft.trim() || title;
    setDraft(next);
    setEditingTitle(false);
    if (next !== title) await onRename?.(next);
  }

  const titleNode =
    onRename && hero === "page" ? (
      editingTitle ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commitTitle()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void commitTitle();
            if (e.key === "Escape") {
              setDraft(title);
              setEditingTitle(false);
            }
          }}
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-white outline-none ring-2 ring-white/40 sm:text-4xl lg:text-5xl"
        />
      ) : (
        <button
          type="button"
          disabled={saving}
          onClick={() => setEditingTitle(true)}
          className="text-left text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          title="Cliquer pour renommer"
        >
          {title}
        </button>
      )
    ) : undefined;

  const canvas = chrome === "canvas";

  return (
    <div
      className={
        canvas
          ? "min-h-full bg-white"
          : "overflow-hidden bg-white shadow-sm lg:rounded-t-3xl lg:border lg:border-b-0 lg:border-primary-100"
      }
    >
      {canvas ? null : (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-50 bg-accent-50/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
            Aperçu live — miroir 1:1
          </p>
          <p className="text-sm text-text-muted">
            Mêmes composants, classes et ordre que le site public. Survolez un bloc pour le modifier.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {typeof showInNav === "boolean" && onToggleNav ? (
            <label className="flex items-center gap-2 text-xs text-primary-900">
              <input
                type="checkbox"
                checked={showInNav}
                disabled={saving}
                onChange={(e) => onToggleNav(e.target.checked)}
                className="h-4 w-4 rounded border-primary-200"
              />
              Menu du site
            </label>
          ) : null}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voir la page
            </a>
          ) : null}
          {onDelete ? (
            <Button type="button" variant="danger" size="sm" loading={saving} onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Supprimer cette page
            </Button>
          ) : null}
        </div>
      </div>
      )}

      <div className="relative isolate flex min-h-screen flex-col bg-white">
        <Navbar
          embedded
          links={navLinks}
          activeHref={activeHref}
          onSelectLink={(nextHref) => {
            const link = navLinks.find((item) => item.href === nextHref);
            if (link) onSelectNav?.(link);
          }}
        />
        <main className="flex-1">
          {hero === "homepage" ? (
            onSaveHeroTagline ? (
              <EditableRegion
                label="Hero"
                disabled={saving}
                fields={[{ key: "tagline", label: "Accroche", type: "textarea", rows: 3 }]}
                values={{ tagline: liveHero }}
                onChange={(next) => setLiveHero(next.tagline)}
                onSave={(next) => onSaveHeroTagline(next.tagline)}
                onDelete={() => onSaveHeroTagline("")}
              >
                <HomepageHero tagline={liveHero} />
              </EditableRegion>
            ) : (
              <HomepageHero tagline={heroTagline} />
            )
          ) : onSaveSubtitle ? (
            <EditableRegion
              label="En-tête de page"
              disabled={saving}
              fields={[
                { key: "subtitle", label: "Sous-titre", type: "textarea", rows: 3 },
              ]}
              values={{ subtitle: liveSubtitle }}
              onChange={(next) => setLiveSubtitle(next.subtitle)}
              onSave={(next) => onSaveSubtitle(next.subtitle)}
              onDelete={() => onSaveSubtitle("")}
            >
              <PageHero
                title={title}
                subtitle={liveSubtitle}
                backHref={backHref}
                backLabel={backLabel}
                titleNode={titleNode}
              />
            </EditableRegion>
          ) : (
            <PageHero
              title={title}
              subtitle={subtitle}
              backHref={backHref}
              backLabel={backLabel}
              titleNode={titleNode}
            />
          )}
          {children}
        </main>
        {onSaveFooterCopy ? (
          <EditableRegion
            label="Pied de page"
            disabled={saving}
            fields={[
              { key: "tagline", label: "Accroche", type: "textarea", rows: 3 },
              { key: "navTitle", label: "Titre navigation" },
              { key: "servicesTitle", label: "Titre services" },
              { key: "contactTitle", label: "Titre contact" },
              { key: "copyright", label: "Copyright" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Téléphone" },
              { key: "address", label: "Adresse" },
            ]}
            values={liveFooter}
            onChange={(next) =>
              setLiveFooter({
                tagline: next.tagline,
                navTitle: next.navTitle,
                servicesTitle: next.servicesTitle,
                contactTitle: next.contactTitle,
                copyright: next.copyright,
                email: next.email,
                phone: next.phone,
                address: next.address,
              })
            }
            onSave={(next) =>
              onSaveFooterCopy({
                tagline: next.tagline,
                navTitle: next.navTitle,
                servicesTitle: next.servicesTitle,
                contactTitle: next.contactTitle,
                copyright: next.copyright,
                email: next.email,
                phone: next.phone,
                address: next.address,
              })
            }
          >
            <SiteFooter
              navLinks={navLinks}
              serviceLinks={footer.serviceLinks}
              email={liveFooter.email}
              phone={liveFooter.phone}
              address={liveFooter.address}
              tagline={liveFooter.tagline}
              navTitle={liveFooter.navTitle}
              servicesTitle={liveFooter.servicesTitle}
              contactTitle={liveFooter.contactTitle}
              copyright={liveFooter.copyright}
            />
          </EditableRegion>
        ) : (
          <SiteFooter
            navLinks={navLinks}
            serviceLinks={footer.serviceLinks}
            email={footer.email}
            phone={footer.phone}
            address={footer.address}
            tagline={footerCopy?.tagline}
            navTitle={footerCopy?.navTitle}
            servicesTitle={footerCopy?.servicesTitle}
            contactTitle={footerCopy?.contactTitle}
            copyright={footerCopy?.copyright}
          />
        )}
        <WhatsAppWidget embedded phone={whatsappNumber} />
      </div>
    </div>
  );
}
