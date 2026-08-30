"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DIVIDER_SPACINGS,
  PAGE_BLOCK_LABELS,
  PAGE_BLOCK_TYPES,
  createEmptyBlock,
  type AlertTone,
  type DividerSpacing,
  type PageBlock,
  type PageBlockType,
} from "@/lib/page-blocks";

function updateBlock(blocks: PageBlock[], id: string, next: PageBlock): PageBlock[] {
  return blocks.map((block) => (block.id === id ? next : block));
}

function moveBlock(blocks: PageBlock[], id: string, direction: -1 | 1): PageBlock[] {
  const index = blocks.findIndex((block) => block.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function BlockFields({
  block,
  onChange,
}: {
  block: PageBlock;
  onChange: (next: PageBlock) => void;
}) {
  if (block.type === "cta") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Texte du bouton"
          value={block.label}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
        />
        <Input
          label="Lien"
          value={block.href}
          placeholder="/services ou https://…"
          onChange={(e) => onChange({ ...block, href: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "paragraph") {
    return (
      <Textarea
        label="Paragraphe"
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
      />
    );
  }

  if (block.type === "list") {
    return (
      <div className="space-y-4">
        <Input
          label="Titre"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
        <Textarea
          label="Points clés (un par ligne)"
          value={block.items.join("\n")}
          onChange={(e) =>
            onChange({
              ...block,
              items: e.target.value.split("\n"),
            })
          }
        />
      </div>
    );
  }

  if (block.type === "alert") {
    return (
      <div className="space-y-4">
        <Select
          label="Type d'alerte"
          value={block.tone}
          onChange={(e) =>
            onChange({ ...block, tone: (e.target.value as AlertTone) || "info" })
          }
          options={[
            { value: "info", label: "Information" },
            { value: "warning", label: "Avertissement" },
            { value: "success", label: "Succès" },
          ]}
        />
        <Input
          label="Titre"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
        <Textarea
          label="Message"
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <div className="space-y-4">
        <Textarea
          label="Citation / témoignage"
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
        />
        <Input
          label="Auteur"
          value={block.author}
          onChange={(e) => onChange({ ...block, author: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "grid") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Titre de la grille"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
          />
          <Select
            label="Nombre de colonnes"
            value={String(block.columns)}
            onChange={(e) =>
              onChange({ ...block, columns: e.target.value === "2" ? 2 : 3 })
            }
            options={[
              { value: "2", label: "2 colonnes" },
              { value: "3", label: "3 colonnes" },
            ]}
          />
        </div>
        {block.items.map((item, index) => (
          <div key={index} className="rounded-xl border border-primary-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-text-muted">Carte {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...block,
                    items: block.items.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
                Retirer
              </Button>
            </div>
            <Input
              label="Titre"
              value={item.title}
              onChange={(e) => {
                const items = [...block.items];
                items[index] = { ...item, title: e.target.value };
                onChange({ ...block, items });
              }}
            />
            <div className="mt-3">
              <Textarea
                label="Texte"
                value={item.content}
                onChange={(e) => {
                  const items = [...block.items];
                  items[index] = { ...item, content: e.target.value };
                  onChange({ ...block, items });
                }}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...block,
              items: [...block.items, { title: "Nouvelle carte", content: "" }],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Ajouter une carte
        </Button>
      </div>
    );
  }

  if (block.type === "faq") {
    return (
      <div className="space-y-4">
        <Input
          label="Titre"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
        {block.items.map((item, index) => (
          <div key={index} className="rounded-xl border border-primary-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-text-muted">Question {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...block,
                    items: block.items.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
                Retirer
              </Button>
            </div>
            <Input
              label="Question"
              value={item.question}
              onChange={(e) => {
                const items = [...block.items];
                items[index] = { ...item, question: e.target.value };
                onChange({ ...block, items });
              }}
            />
            <div className="mt-3">
              <Textarea
                label="Réponse"
                value={item.answer}
                onChange={(e) => {
                  const items = [...block.items];
                  items[index] = { ...item, answer: e.target.value };
                  onChange({ ...block, items });
                }}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...block,
              items: [...block.items, { question: "Nouvelle question ?", answer: "" }],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Ajouter une question
        </Button>
      </div>
    );
  }

  if (block.type === "divider") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Libellé optionnel"
          value={block.label}
          placeholder="Ex: Suite"
          onChange={(e) => onChange({ ...block, label: e.target.value })}
        />
        <Select
          label="Espacement"
          value={block.spacing}
          onChange={(e) =>
            onChange({
              ...block,
              spacing: (DIVIDER_SPACINGS.includes(e.target.value as DividerSpacing)
                ? e.target.value
                : "md") as DividerSpacing,
            })
          }
          options={[
            { value: "sm", label: "Compact" },
            { value: "md", label: "Moyen" },
            { value: "lg", label: "Large" },
          ]}
        />
      </div>
    );
  }

  if (block.type === "video") {
    return (
      <div className="space-y-4">
        <Input
          label="Titre optionnel"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
        <Input
          label="Lien YouTube ou Vimeo"
          value={block.url}
          placeholder="https://www.youtube.com/watch?v=…"
          onChange={(e) => onChange({ ...block, url: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "stats") {
    return (
      <div className="space-y-4">
        <Input
          label="Titre"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
        {block.items.map((item, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <Input
              label="Chiffre"
              value={item.value}
              onChange={(e) => {
                const items = [...block.items];
                items[index] = { ...item, value: e.target.value };
                onChange({ ...block, items });
              }}
            />
            <Input
              label="Libellé"
              value={item.label}
              onChange={(e) => {
                const items = [...block.items];
                items[index] = { ...item, label: e.target.value };
                onChange({ ...block, items });
              }}
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...block,
                    items: block.items.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...block,
              items: [...block.items, { value: "0", label: "Indicateur" }],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Ajouter un chiffre
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        label="Titre"
        value={block.title}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
      />
      <Textarea
        label="Texte"
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
      />
    </div>
  );
}

export function PageBlockBuilder({
  blocks,
  saving,
  onChange,
  onAdd,
}: {
  blocks: PageBlock[];
  saving: boolean;
  onChange: (blocks: PageBlock[]) => void;
  onAdd?: (type: PageBlockType) => void;
}) {
  function add(type: PageBlockType) {
    const next = createEmptyBlock(type);
    onChange([...blocks, next]);
    onAdd?.(type);
  }

  const addBar = (
    <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-4 sm:p-5">
      <p className="mb-3 text-sm font-semibold text-primary-900">Ajouter un bloc</p>
      <div className="flex flex-wrap gap-2">
        {PAGE_BLOCK_TYPES.map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => add(type)}
          >
            <Plus className="h-4 w-4" />
            {PAGE_BLOCK_LABELS[type]}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-primary-100 bg-white p-8 text-center text-text-muted">
          Aucun bloc pour l&apos;instant. Utilisez « Ajouter un bloc » ci-dessous.
        </p>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-2xl border border-primary-100 bg-white p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-primary-800">
                {index + 1}. {PAGE_BLOCK_LABELS[block.type]}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving || index === 0}
                  onClick={() => onChange(moveBlock(blocks, block.id, -1))}
                >
                  <ArrowUp className="h-4 w-4" />
                  Monter
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving || index === blocks.length - 1}
                  onClick={() => onChange(moveBlock(blocks, block.id, 1))}
                >
                  <ArrowDown className="h-4 w-4" />
                  Descendre
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    if (!confirm("Supprimer ce bloc ?")) return;
                    onChange(blocks.filter((item) => item.id !== block.id));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
            <BlockFields
              block={block}
              onChange={(next) => onChange(updateBlock(blocks, block.id, next))}
            />
          </div>
        ))
      )}
      {addBar}
    </div>
  );
}
