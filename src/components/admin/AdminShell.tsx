"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Newspaper,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronsLeft,
  ChevronsRight,
  Award,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads & Demandes", icon: Inbox },
  { href: "/admin/content", label: "Contenu & Pages", icon: FileText },
  { href: "/admin/attestations", label: "Générateur d'Attestations", icon: Award },
  { href: "/admin/news", label: "Actualités", icon: Newspaper },
  { href: "/admin/applications", label: "Recrutement & CVs", icon: Users },
];

const SIDEBAR_STORAGE_KEY = "aqf-admin-sidebar-collapsed";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE", credentials: "include", cache: "no-store" });
    router.push("/admin/login");
    router.refresh();
  }

  const isContentEditor = pathname.startsWith("/admin/content");

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-surface-muted">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh flex-col overflow-hidden bg-brand-gradient text-white transition-[width,transform] duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          collapsed ? "w-64 lg:w-20" : "w-64"
        )}
        style={desktop && collapsed ? { width: "5rem" } : undefined}
      >
        <div className={cn("border-b border-primary-700/40 py-4", collapsed ? "px-2 lg:px-2" : "px-4")}>
          <div className={cn("flex items-center", collapsed ? "justify-center lg:justify-center" : "justify-between")}>
            <Logo
              variant={collapsed ? "icon" : "admin"}
              href="/admin"
              tone="light"
              className={collapsed ? "lg:mx-auto" : undefined}
            />
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <p
            className={cn(
              "mt-2 text-xs text-accent-200",
              collapsed && "lg:hidden"
            )}
          >
            لوحة التحكم الخاصة
          </p>
        </div>

        <nav className={cn("flex-1 space-y-1 overflow-y-auto overflow-x-hidden", collapsed ? "p-2" : "p-4")}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition",
                  collapsed ? "justify-center px-2 py-3 lg:px-2" : "gap-3 px-4 py-3",
                  active
                    ? "bg-secondary-400/90 text-primary-900 shadow-md"
                    : "text-primary-100 hover:bg-primary-800/60 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={cn("mt-auto border-t border-primary-700/40", collapsed ? "p-2" : "p-4")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Développer le menu" : "Réduire le menu"}
            aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
            aria-expanded={!collapsed}
            className={cn(
              "mb-2 hidden w-full items-center rounded-xl py-2 text-sm text-primary-100 hover:bg-primary-800/60 lg:flex",
              collapsed ? "justify-center px-2" : "gap-2 px-4"
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" />
                Réduire
              </>
            )}
          </button>
          <Link
            href="/"
            target="_blank"
            title="Voir le site"
            className={cn(
              "mb-2 flex items-center rounded-xl py-2 text-sm text-primary-100 hover:bg-primary-800/60",
              collapsed ? "justify-center px-2 lg:px-2" : "gap-2 px-4"
            )}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Voir le site</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className={cn(
              "flex w-full items-center rounded-xl py-2 text-sm text-red-300 hover:bg-primary-800/60",
              collapsed ? "justify-center px-2 lg:px-2" : "gap-2 px-4"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-primary-100 bg-white px-4 lg:px-8">
          <button className="shrink-0 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-primary-800" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Développer le menu" : "Réduire le menu"}
            aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
            className="hidden shrink-0 rounded-lg p-2 text-primary-800 hover:bg-primary-50 lg:inline-flex"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-primary-900">
            Administration AQF
          </h1>
          <div className="hidden shrink-0 sm:block">
            <Logo variant="navbar" href={null} className="opacity-90" />
          </div>
        </header>
        <div
          className={cn(
            "min-h-0 flex-1 overscroll-contain",
            isContentEditor ? "overflow-hidden p-0 [&>*]:h-full" : "overflow-y-auto p-4 lg:p-8"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
