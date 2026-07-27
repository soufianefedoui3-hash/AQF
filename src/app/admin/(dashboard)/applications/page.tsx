"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader, AdminEmptyState, AdminCard } from "@/components/ui/PageSection";

interface Application {
  id: string;
  positionName: string;
  applicantName: string;
  email: string;
  phone: string | null;
  cvPath: string;
  letterPath: string;
  status: string;
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  function loadApplications() {
    fetch("/api/admin/applications")
      .then((r) => r.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success("Statut mis à jour");
      loadApplications();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette candidature ?")) return;
    const res = await fetch("/api/admin/applications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Candidature supprimée");
      loadApplications();
    }
  }

  return (
    <div>
      <AdminPageHeader title="Recrutement & CVs" />

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        <AdminEmptyState>Aucune candidature reçue.</AdminEmptyState>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <AdminCard key={app.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary-900">{app.applicantName}</h3>
                  <p className="text-sm text-accent-600">{app.positionName}</p>
                  <p className="text-sm text-text-muted">{app.email}</p>
                  {app.phone && <p className="text-sm text-text-muted">{app.phone}</p>}
                  <p className="mt-1 text-xs text-text-muted">{formatDate(app.createdAt)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
                  >
                    <option value="new">Nouveau</option>
                    <option value="reviewed">Examiné</option>
                    <option value="interview">Entretien</option>
                    <option value="accepted">Accepté</option>
                    <option value="rejected">Refusé</option>
                  </select>

                  <a href={app.cvPath} download target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      CV
                    </Button>
                  </a>
                  <a href={app.letterPath} download target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      Lettre
                    </Button>
                  </a>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(app.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
