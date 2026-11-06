import { COMPONENT_GROUPS, componentLabel } from "@/lib/playground-nav";

export interface GuidanceSegment {
  text: string;
  href?: string;
}

const SKIP_LABELS = new Set(["Bar", "Line", "Pie"]);

const COMPONENT_LINKS = [
  ...COMPONENT_GROUPS.flatMap((group) =>
    group.ids.map((id) => ({
      label: componentLabel(id),
      href: `/components/${id}`,
    })),
  ),
  { label: "BarChart", href: "/components/barchart" },
  { label: "LineChart", href: "/components/linechart" },
  { label: "PieChart", href: "/components/piechart" },
]
  .filter((entry) => !SKIP_LABELS.has(entry.label))
  .sort((a, b) => b.label.length - a.label.length);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turn "use Component" mentions in contract guidance into link segments.
 * Names are only linked in the clause that starts at "use".
 */
export function guidanceSegments(text: string): GuidanceSegment[] {
  const match = /\buse\b/i.exec(text);
  if (!match) return [{ text }];

  const segments: GuidanceSegment[] = [];
  if (match.index > 0) segments.push({ text: text.slice(0, match.index) });

  let rest = text.slice(match.index);
  while (rest.length > 0) {
    let found: { index: number; label: string; href: string } | null = null;
    for (const entry of COMPONENT_LINKS) {
      const hit = new RegExp(`\\b${escapeRegExp(entry.label)}\\b`).exec(rest);
      if (!hit) continue;
      if (
        !found ||
        hit.index < found.index ||
        (hit.index === found.index && entry.label.length > found.label.length)
      ) {
        found = { index: hit.index, label: entry.label, href: entry.href };
      }
    }
    if (!found) {
      segments.push({ text: rest });
      break;
    }
    if (found.index > 0) segments.push({ text: rest.slice(0, found.index) });
    segments.push({ text: found.label, href: found.href });
    rest = rest.slice(found.index + found.label.length);
  }

  return segments;
}
