export const CLONE_PAGE_KEYS = {
  services: "clone:services",
  explore: "clone:explore",
  stats: "clone:stats",
} as const;

export type ClonedCard = {
  id: string;
  afterId: string;
  title: string;
  description: string;
  href?: string;
  value?: string;
  label?: string;
  imageUrl?: string;
};

export function parseClonedCards(raw: unknown): ClonedCard[] {
  let parsed = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  const cards: ClonedCard[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const id = typeof rec.id === "string" ? rec.id.trim() : "";
    if (!id) continue;
    const card: ClonedCard = {
      id,
      afterId: typeof rec.afterId === "string" ? rec.afterId : "",
      title: asText(rec.title),
      description: asText(rec.description),
    };
    if (typeof rec.href === "string") card.href = rec.href;
    if (typeof rec.value === "string") card.value = rec.value;
    if (typeof rec.label === "string") card.label = rec.label;
    if (typeof rec.imageUrl === "string") card.imageUrl = rec.imageUrl;
    cards.push(card);
  }
  return cards;
}

export function serializeClonedCards(cards: ClonedCard[]): string {
  return JSON.stringify(parseClonedCards(cards));
}

export function weaveClonedCards<T extends { id: string }>(
  base: T[],
  clones: ClonedCard[],
  toItem: (clone: ClonedCard) => T
): T[] {
  const result = [...base];
  const pending = [...clones];
  let guard = 0;
  while (pending.length && guard < clones.length + 2) {
    guard += 1;
    const index = pending.findIndex((clone) =>
      result.some((item) => item.id === clone.afterId)
    );
    if (index < 0) {
      result.push(...pending.map(toItem));
      break;
    }
    const [clone] = pending.splice(index, 1);
    const at = result.findIndex((item) => item.id === clone.afterId);
    result.splice(at + 1, 0, toItem(clone));
  }
  return result;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}
