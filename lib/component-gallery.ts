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

const PRIORITY = [
  "chat",
  "thinkinganimation",
  "shimmertext",
  "loadinganimation",
  "numbertransition",
  "button",
  "input",
  "datagrid",
  "datatable",
  "sidenav",
  "switch",
  "radiogroup",
  "checkbox",
  "select",
  "tabs",
  "textarea",
  "modal",
  "modalcard",
  "scorecard",
  "insightcard",
  "piechart",
  "barchart",
  "linechart",
  "calendar",
  "timeline",
  "badge",
  "tooltip",
  "toast",
];

export const GALLERY_ITEMS: GalleryItem[] = [...COMPONENT_ITEMS, ...EXTRA_IDS]
  .map(toItem)
  .sort((a, b) => {
    const aRank = PRIORITY.indexOf(a.id);
    const bRank = PRIORITY.indexOf(b.id);
    if (aRank === -1 && bRank === -1) return a.label.localeCompare(b.label);
    if (aRank === -1) return 1;
    if (bRank === -1) return -1;
    return aRank - bRank;
  });

export function filterGalleryItems(filter: GalleryFilter): GalleryItem[] {
  if (filter === "all") return GALLERY_ITEMS;
  return GALLERY_ITEMS.filter((item) => item.filters.includes(filter));
}
