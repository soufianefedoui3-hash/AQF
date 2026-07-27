"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface Lead {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

const TYPE_LABELS: Record<string, string> = {
  consultation: "Consultation",
  accompagnement: "Accompagnement",
  formation: "Formation",
  audit: "Audit",
  "web-service": "Service Web",
};

const STATUS_OPTIONS = ["new", "in_progress", "completed", "cancelled"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function loadLeads(type: string) {
    setLoading(true);
    fetch(`/api/admin/leads?type=${type}`)
      .then((r) => r.json())
      .then(setLeads)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLeads(filter);
  }, [filter]);

  async function updateStatus(id: string, type: string, status: string) {
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type, status }),
    });

    if (res.ok) {
      toast.success("Statut mis à jour");
      loadLeads(filter);
    } else {
      toast.error("Erreur");
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-900">Leads & Demandes</h2>

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
        <p className="rounded-2xl bg-white p-8 text-center text-text-muted">
          Aucune demande trouvée.
        </p>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={`${lead.type}-${lead.id}`} className="rounded-2xl border border-primary-100 bg-white shadow-sm">
              <div
                className="flex cursor-pointer items-center justify-between px-6 py-4"
                onClick={() =>
                  setExpanded(expanded === lead.id ? null : lead.id)
                }
              >
                <div>
                  <span className="mr-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {TYPE_LABELS[lead.type] || lead.type}
                  </span>
                  <span className="font-medium text-primary-900">
                    {(lead.contactName as string) ||
                      (lead.name as string) ||
                      (lead.responsableName as string) ||
                      "—"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={lead.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateStatus(lead.id, lead.type, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg border border-primary-100 px-3 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-text-muted">
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>

              {expanded === lead.id && (
                <div className="border-t border-primary-100 px-6 py-4">
                  <pre className="overflow-x-auto rounded-lg bg-accent-50/50 p-4 text-xs text-primary-800">
                    {JSON.stringify(lead, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
