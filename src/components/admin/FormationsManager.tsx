"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/admin-fetch";

interface FormationType {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export function FormationsManager() {
  const [formations, setFormations] = useState<FormationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function loadFormations() {
    setLoading(true);
    try {
      const result = await adminFetch<FormationType[]>("/api/admin/formations");
      if (!result.ok) {
        setFormations([]);
        toast.error(result.error);
        return;
      }
      setFormations(Array.isArray(result.data) ? result.data : []);
    } catch {
      setFormations([]);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFormations();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Nom de formation requis");
      return;
    }

    const res = await fetch("/api/admin/formations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (res.ok) {
      toast.success("Formation ajoutée");
      setNewName("");
      loadFormations();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;

    const res = await fetch("/api/admin/formations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim() }),
    });

    if (res.ok) {
      toast.success("Formation mise à jour");
      setEditingId(null);
      loadFormations();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(typeof data?.error === "string" ? data.error : "Erreur");
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const res = await fetch("/api/admin/formations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });

    if (res.ok) {
      toast.success(active ? "Formation désactivée" : "Formation activée");
      setFormations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, active: !active } : item
        )
      );
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(typeof data?.error === "string" ? data.error : "Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette formation ?")) return;

    const res = await fetch("/api/admin/formations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      toast.success("Formation supprimée");
      loadFormations();
    } else {
      toast.error("Erreur");
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-white p-6">
        <h3 className="mb-4 font-semibold text-primary-900">Ajouter une formation</h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
          <Input
            label="Nom de la formation"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: ISO 9001, SMETA..."
            className="flex-1"
          />
          <Button type="submit" className="sm:self-end">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-primary-100 bg-white p-6">
        <h3 className="mb-4 font-semibold text-primary-900">
          Formations disponibles ({formations.length})
        </h3>

        {formations.length === 0 ? (
          <p className="text-sm text-text-muted">Aucune formation configurée.</p>
        ) : (
          <ul className="space-y-3">
            {formations.map((formation) => (
              <li
                key={formation.id}
                className="flex flex-col gap-3 rounded-xl border border-primary-100 bg-accent-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {editingId === formation.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <div>
                      <p className="font-medium text-primary-900">{formation.name}</p>
                      {!formation.active && (
                        <span className="text-xs text-amber-600">Désactivée</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {editingId === formation.id ? (
                    <>
                      <Button size="sm" onClick={() => handleUpdate(formation.id)}>
                        Enregistrer
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(formation.id);
                          setEditName(formation.name);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(formation.id, formation.active)}
                      >
                        {formation.active ? "Désactiver" : "Activer"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(formation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
