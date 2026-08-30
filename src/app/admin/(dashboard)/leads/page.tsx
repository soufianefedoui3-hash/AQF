"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-fetch";
import { AdminEmptyState, AdminPageHeader } from "@/components/ui/PageSection";
import { LeadCard, type LeadRecord } from "@/components/admin/LeadCard";

const STATUS_OPTIONS = [
  { value: "new", label: "Nouveau" },
  { value: "in_progress", label: "En cours" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadLeads(type: string) {
    setLoading(true);
    try {
      const result = await adminFetch<LeadRecord[]>(`/api/admin/leads?type=${type}`);
      if (!result.ok) {
        setLeads([]);
        toast.error(result.error);
        return;
      }
      setLeads(Array.isArray(result.data) ? result.data : []);
    } catch {
      setLeads([]);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads(filter);
  }, [filter]);

  async function updateStatus(id: string, type: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, status }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Statut mis à jour");
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === id && lead.type === type ? { ...lead, status } : lead
          )
        );
      } else {
        toast.error(typeof data?.error === "string" ? data.error : "Erreur");
        await loadLeads(filter);
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Leads & Demandes" />

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all", label: "Tous" },
          { value: "consultation", label: "Consultations" },
          { value: "accompagnement", label: "Accompagnements" },
          { value: "formation", label: "Formations" },
          { value: "audit", label: "Audits" },
          { value: "web-service", label: "Services Web" },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === f.value
                ? "bg-primary-900 text-white shadow-sm"
                : "border border-primary-100 bg-white text-text-muted hover:bg-accent-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
        </div>
      ) : leads.length === 0 ? (
        <AdminEmptyState>Aucune demande trouvée.</AdminEmptyState>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadCard
              key={`${lead.type}-${lead.id}`}
              lead={lead}
              createdLabel={formatDate(lead.createdAt)}
              statusControl={
                <select
                  value={lead.status}
                  disabled={updatingId === lead.id}
                  onChange={(e) => updateStatus(lead.id, lead.type, e.target.value)}
                  className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
                  aria-label="Statut de la demande"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
