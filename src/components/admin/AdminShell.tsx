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
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads & Demandes", icon: Inbox },
  { href: "/admin/content", label: "Contenu & Pages", icon: FileText },
  { href: "/admin/news", label: "Actualités", icon: Newspaper },
  { href: "/admin/applications", label: "Recrutement & CVs", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE", credentials: "include", cache: "no-store" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-surface-muted">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col transform bg-brand-gradient text-white transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-primary-700/40 px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo variant="admin" href="/admin" />
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-accent-200">لوحة التحكم الخاصة</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-secondary-400/90 text-primary-900 shadow-md"
                    : "text-primary-100 hover:bg-primary-800/60 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-primary-700/40 p-4">
          <Link
            href="/"
            target="_blank"
            className="mb-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-primary-100 hover:bg-primary-800/60"
          >
            <ExternalLink className="h-4 w-4" />
            Voir le site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-red-300 hover:bg-primary-800/60"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-primary-100 bg-white px-4 lg:px-8">
          <button className="shrink-0 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-primary-800" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-primary-900">
            Administration AQF
          </h1>
          <div className="hidden shrink-0 sm:block">
            <Logo variant="navbar" href={null} className="opacity-90" />
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
