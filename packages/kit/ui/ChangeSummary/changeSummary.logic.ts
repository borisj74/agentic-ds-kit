import type { ChangeItem, ChangeSentiment } from "./ChangeSummary.types";

const GROUPS: { sentiment: ChangeSentiment; label: string }[] = [
  { sentiment: "good", label: "Better" },
  { sentiment: "bad", label: "Worse" },
  { sentiment: "neutral", label: "Steady" },
];

/** Splits rows into Better, Worse and Steady, in that order, keeping item order inside each; empty groups are dropped. */
export function groupBySentiment(items: ChangeItem[]) {
  return GROUPS.map((group) => ({ ...group, items: items.filter((item) => (item.sentiment ?? "neutral") === group.sentiment) })).filter(
    (group) => group.items.length > 0,
  );
}
