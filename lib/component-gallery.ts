import contracts from "agentic-ds-kit/contracts/index.json";
import { COMPONENT_ITEMS, componentLabel } from "@/lib/playground-nav";

export type GalleryFilter = "all" | "agent" | "base" | "motion";

export interface GalleryItem {
  id: string;
  href: string;
  label: string;
  description: string;
  filters: Exclude<GalleryFilter, "all">[];
}

const AGENT_IDS = new Set([
  "chat",
  "insightcard",
  "loadinganimation",
  "numbertransition",
  "shimmertext",
  "thinkinganimation",
]);

const MOTION_IDS = new Set([
  "loadinganimation",
  "numbertransition",
  "shimmertext",
  "spinner",
  "thinkinganimation",
]);

const EXTRA_IDS = ["barchart", "linechart", "piechart"] as const;

const intents = new Map(contracts.map((entry) => [entry.id, entry.intent]));

function filtersFor(id: string): GalleryItem["filters"] {
  const filters: GalleryItem["filters"] = [];
  if (AGENT_IDS.has(id)) filters.push("agent");
  if (MOTION_IDS.has(id)) filters.push("motion");
  if (filters.length === 0) filters.push("base");
  return filters;
}

function toItem(id: string): GalleryItem {
  return {
    id,
    href: `/components#${id}`,
    label: componentLabel(id),
    description: intents.get(id) ?? "Kit component.",
    filters: filtersFor(id),
  };
}

export const GALLERY_ITEMS: GalleryItem[] = [...COMPONENT_ITEMS, ...EXTRA_IDS]
  .map(toItem)
  .sort(
    (a, b) =>
      a.label.localeCompare(b.label, "en", { sensitivity: "base", numeric: true }) ||
      a.id.localeCompare(b.id, "en"),
  );

function compact(value: string): string {
  return value.replace(/[^a-z0-9]/g, "");
}

function queryWords(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesName(item: GalleryItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const name = `${item.label} ${item.id}`.toLowerCase();
  const compactName = compact(name);
  const compactQuery = compact(normalized);
  if (name.includes(normalized) || (compactQuery.length > 0 && compactName.includes(compactQuery))) {
    return true;
  }

  const words = queryWords(query);
  return words.length > 1 && words.every((word) => name.includes(word) || compactName.includes(compact(word)));
}

function searchableDescription(description: string): string {
  return description.replace(/\bnot\b[^.]*(?:\.|$)/gi, " ");
}

function matchesDescription(item: GalleryItem, query: string): boolean {
  const words = queryWords(query);
  if (words.length === 0) return true;

  const tokens = searchableDescription(item.description)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return words.every((word) => tokens.some((token) => token === word || (word.length >= 3 && token.startsWith(word))));
}

export function filterGalleryItems(filter: GalleryFilter, query = ""): GalleryItem[] {
  const group = filter === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.filters.includes(filter));
  const normalized = query.trim();
  if (!normalized) return group;

  const named = GALLERY_ITEMS.filter((item) => matchesName(item, normalized));
  if (named.length > 0) {
    const ids = new Set(named.map((item) => item.id));
    return group.filter((item) => ids.has(item.id));
  }

  return group.filter((item) => matchesDescription(item, normalized));
}
