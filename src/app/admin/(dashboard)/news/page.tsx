"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Trash2, Edit, Plus, Newspaper } from "lucide-react";
import { Input, Textarea, FileInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader, AdminEmptyState, AdminCard } from "@/components/ui/PageSection";
import {
  getArticleExcerpt,
  isNewsArticleArray,
  normalizeImageUrl,
  type NewsArticleDTO,
} from "@/lib/news";

export default function NewsAdminPage() {
  const [articles, setArticles] = useState<NewsArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticleDTO | null>(null);

  async function loadArticles() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/news");
      const data: unknown = await res.json();

      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: string }).error)
            : "Impossible de charger les articles";
        throw new Error(message);
      }

      if (!isNewsArticleArray(data)) {
        throw new Error("Format de données invalide");
      }

      setArticles(data);
    } catch (err) {
      setArticles([]);
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet article ?")) return;

    const res = await fetch("/api/admin/news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      toast.success("Article supprimé");
      loadArticles();
    } else {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <div>
      <AdminPageHeader title="Actualités">
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Button>
      </AdminPageHeader>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-400 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-red-700">{error}</p>
          <Button className="mt-4" variant="outline" onClick={loadArticles}>
            Réessayer
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <AdminEmptyState>Aucun article. Créez-en un !</AdminEmptyState>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              onEdit={() => {
                setEditing(article);
                setModalOpen(true);
              }}
              onDelete={() => handleDelete(article.id)}
            />
          ))}
        </div>
      )}

      <ArticleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        article={editing}
        onSaved={() => {
          setModalOpen(false);
          loadArticles();
        }}
      />
    </div>
  );
}

function ArticleRow({
  article,
  onEdit,
  onDelete,
}: {
  article: NewsArticleDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const imageUrl = normalizeImageUrl(article.imageUrl);
  const title = article.title?.trim() || "Sans titre";
  const excerpt = getArticleExcerpt(article, 120);

  return (
    <AdminCard className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 sm:h-20 sm:w-28">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="112px"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Newspaper className="h-8 w-8 text-primary-300" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-primary-900">{title}</h3>
          {!article.published && (
            <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs text-secondary-800">
              Brouillon
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{excerpt}</p>
        <p className="mt-2 text-xs text-text-muted">{formatDate(article.createdAt)}</p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </AdminCard>
  );
}

function ArticleModal({
  isOpen,
  onClose,
  article,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticleDTO | null;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const imageUrl = normalizeImageUrl(article?.imageUrl);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (article) formData.set("id", article.id);

    const publishedInput = form.querySelector<HTMLInputElement>('input[name="published"]');
    formData.set("published", publishedInput?.checked ? "true" : "false");

    const res = await fetch("/api/admin/news", {
      method: article ? "PUT" : "POST",
      body: formData,
    });

    const data: unknown = await res.json();

    if (res.ok) {
      toast.success(article ? "Article mis à jour" : "Article créé");
      onSaved();
    } else {
      const message =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: string }).error)
          : "Erreur lors de l'enregistrement";
      toast.error(message);
    }

    setLoading(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={article ? "Modifier l'article" : "Nouvel article"}
      size="xl"
    >
      <form key={article?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Titre"
          defaultValue={article?.title ?? ""}
          required
        />
        <Input
          name="excerpt"
          label="Description / Extrait"
          defaultValue={article?.excerpt ?? ""}
          placeholder="Court résumé affiché dans la liste des actualités"
        />
        <Textarea
          name="content"
          label="Contenu"
          defaultValue={article?.content ?? ""}
          required
        />
        <FileInput name="image" label="Image" accept="image/*" />
        {imageUrl && (
          <div className="relative h-32 overflow-hidden rounded-xl border border-primary-100">
            <Image src={imageUrl} alt="Aperçu actuel" fill className="object-cover" sizes="400px" />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={article?.published ?? true}
          />
          Publier immédiatement
        </label>
        <Button type="submit" loading={loading} className="w-full">
          Enregistrer
        </Button>
      </form>
    </Modal>
  );
}
