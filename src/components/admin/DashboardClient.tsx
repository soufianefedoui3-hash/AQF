"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  ClipboardList,
  GraduationCap,
  Search,
  Globe,
  Inbox,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/admin-fetch";

export interface DashboardStats {
  totalLeads: number;
  consultations: number;
  accompagnements: number;
  formations: number;
  audits: number;
  webServices: number;
  applications: number;
}

export interface RecentLead {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardPayload {
  stats: DashboardStats;
  recent: RecentLead[];
}

const EMPTY_STATS: DashboardStats = {
  totalLeads: 0,
  consultations: 0,
  accompagnements: 0,
  formations: 0,
  audits: 0,
  webServices: 0,
  applications: 0,
};

export function DashboardClient({
  initial,
  initialError,
}: {
  initial: DashboardPayload;
  initialError?: string | null;
}) {
  const [stats, setStats] = useState<DashboardStats>(initial.stats || EMPTY_STATS);
  const [recent, setRecent] = useState<RecentLead[]>(initial.recent || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function loadStats() {
    setLoading(true);
    setError(null);
    const result = await adminFetch<DashboardPayload>("/api/admin/stats");
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    setStats(result.data.stats || EMPTY_STATS);
    setRecent(Array.isArray(result.data.recent) ? result.data.recent : []);
  }

  const cards = [
    { label: "Total Leads", value: stats.totalLeads, icon: Inbox, color: "bg-primary-100 text-primary-800" },
    { label: "Consultations", value: stats.consultations, icon: Users, color: "bg-secondary-100 text-secondary-800" },
    { label: "Accompagnements", value: stats.accompagnements, icon: ClipboardList, color: "bg-accent-100 text-accent-800" },
    { label: "Formations", value: stats.formations, icon: GraduationCap, color: "bg-secondary-200 text-secondary-900" },
    { label: "Audits", value: stats.audits, icon: Search, color: "bg-primary-200 text-primary-900" },
    { label: "Services Web", value: stats.webServices, icon: Globe, color: "bg-accent-200 text-accent-900" },
    { label: "Candidatures", value: stats.applications, icon: Users, color: "bg-secondary-100 text-secondary-700" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
        <p className="text-sm text-text-muted">Chargement des statistiques…</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="text-red-700">{error}</p>
        <Button className="mt-4" variant="outline" onClick={loadStats}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-primary-900">Tableau de bord</h2>
        <Button variant="outline" onClick={loadStats}>
          Actualiser
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error} — affichage des dernières données disponibles.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-text-muted">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-primary-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-primary-900">Consultations récentes</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-text-muted">Aucune consultation pour le moment.</p>
        ) : (
          <ul className="divide-y divide-primary-50">
            {recent.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-primary-900">{lead.name}</p>
                  <p className="text-sm text-text-muted">{lead.email}</p>
                </div>
                <span className="text-xs text-text-muted">{formatDate(lead.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
