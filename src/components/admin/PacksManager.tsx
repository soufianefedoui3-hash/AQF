"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/admin-fetch";

interface ProductPack {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
}

export function PacksManager({ heading }: { heading?: string }) {
  const [packs, setPacks] = useState<ProductPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function loadPacks() {
    setLoading(true);
    try {
      const result = await adminFetch<ProductPack[]>("/api/admin/packs");
      if (!result.ok) {
        setPacks([]);
        toast.error(result.error);
        return;
      }
      setPacks(Array.isArray(result.data) ? result.data : []);
    } catch {
      setPacks([]);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPacks();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim()) {
      toast.error("Nom et description requis");
      return;
    }

    const res = await fetch("/api/admin/packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        description: newDescription.trim(),
      }),
    });

    if (res.ok) {
      toast.success("Pack ajouté");
      setNewName("");
      setNewDescription("");
      loadPacks();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim() || !editDescription.trim()) return;

    const res = await fetch("/api/admin/packs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: editName.trim(),
        description: editDescription.trim(),
      }),
    });

    if (res.ok) {
      toast.success("Pack mis à jour");
      setEditingId(null);
      loadPacks();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(typeof data?.error === "string" ? data.error : "Erreur");
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const res = await fetch("/api/admin/packs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });

    if (res.ok) {
      toast.success(active ? "Pack désactivé" : "Pack activé");
      setPacks((prev) =>
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
    if (!confirm("Supprimer ce pack ?")) return;

    const res = await fetch("/api/admin/packs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      toast.success("Pack supprimé");
      loadPacks();
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
        <h3 className="mb-4 font-semibold text-primary-900">Ajouter un pack</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Nom du pack"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: ISO 9001, GBEA..."
          />
          <Textarea
            label="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description courte affichée sous le pack..."
          />
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-primary-100 bg-white p-6">
        <h3 className="mb-4 font-semibold text-primary-900">
          {heading || "Packs produits"} ({packs.length})
        </h3>

        {packs.length === 0 ? (
          <p className="text-sm text-text-muted">Aucun pack configuré.</p>
        ) : (
          <ul className="space-y-3">
            {packs.map((pack) => (
              <li
                key={pack.id}
                className="flex flex-col gap-3 rounded-xl border border-primary-100 bg-accent-50/40 p-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {editingId === pack.id ? (
                    <div className="flex-1 space-y-3">
                      <Input
                        label="Nom"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <Textarea
                        label="Description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-primary-900">{pack.name}</p>
                      <p className="mt-1 text-sm text-text-muted">{pack.description}</p>
                      {!pack.active && (
                        <span className="mt-1 inline-block text-xs text-amber-600">
                          Désactivé
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {editingId === pack.id ? (
                    <>
                      <Button size="sm" onClick={() => handleUpdate(pack.id)}>
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
                          setEditingId(pack.id);
                          setEditName(pack.name);
                          setEditDescription(pack.description);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(pack.id, pack.active)}
                      >
                        {pack.active ? "Désactiver" : "Activer"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(pack.id)}>
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
