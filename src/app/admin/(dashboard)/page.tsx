"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ClipboardList,
  GraduationCap,
  Search,
  Globe,
  Inbox,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalLeads: number;
  consultations: number;
  accompagnements: number;
  formations: number;
  audits: number;
  webServices: number;
  applications: number;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecent(data.recent || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total Leads", value: stats.totalLeads, icon: Inbox, color: "bg-primary-100 text-primary-800" },
        { label: "Consultations", value: stats.consultations, icon: Users, color: "bg-secondary-100 text-secondary-800" },
        { label: "Accompagnements", value: stats.accompagnements, icon: ClipboardList, color: "bg-accent-100 text-accent-800" },
        { label: "Formations", value: stats.formations, icon: GraduationCap, color: "bg-secondary-200 text-secondary-900" },
        { label: "Audits", value: stats.audits, icon: Search, color: "bg-primary-200 text-primary-900" },
        { label: "Services Web", value: stats.webServices, icon: Globe, color: "bg-accent-200 text-accent-900" },
        { label: "Candidatures", value: stats.applications, icon: Users, color: "bg-secondary-100 text-secondary-700" },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-900">Tableau de bord</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold text-primary-900">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-primary-100 bg-white shadow-sm">
        <div className="border-b border-primary-100 px-6 py-4">
          <h3 className="font-semibold text-primary-900">Dernières consultations</h3>
        </div>
        <div className="divide-y divide-primary-100">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">Aucune demande récente.</p>
          ) : (
            recent.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-primary-900">{lead.name}</p>
                  <p className="text-sm text-text-muted">{lead.email}</p>
                </div>
                <p className="text-sm text-text-muted">{formatDate(lead.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
