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
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications");
      const data = await res.json();

      if (!res.ok) {
        setApplications([]);
        toast.error(
          typeof data?.error === "string"
            ? data.error
            : "Impossible de charger les candidatures"
        );
        return;
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Statut mis à jour");
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
      } else {
        toast.error(typeof data?.error === "string" ? data.error : "Erreur");
        await loadApplications();
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette candidature ?")) return;

    setBusyId(id);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Candidature supprimée");
        setApplications((prev) => prev.filter((app) => app.id !== id));
      } else {
        toast.error(typeof data?.error === "string" ? data.error : "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setBusyId(null);
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
                    disabled={busyId === app.id}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
                  >
                    <option value="new">Nouveau</option>
                    <option value="reviewed">Examiné</option>
                    <option value="interview">Entretien</option>
                    <option value="accepted">Accepté</option>
                    <option value="rejected">Refusé</option>
                  </select>

                  <a
                    href={app.cvPath}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-accent-400 px-4 py-2 text-sm font-medium text-primary-800 transition hover:bg-accent-50"
                  >
                    <Download className="h-4 w-4" />
                    CV
                  </a>
                  <a
                    href={app.letterPath}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-accent-400 px-4 py-2 text-sm font-medium text-primary-800 transition hover:bg-accent-50"
                  >
                    <Download className="h-4 w-4" />
                    Lettre
                  </a>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={busyId === app.id}
                    onClick={() => handleDelete(app.id)}
                  >
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
