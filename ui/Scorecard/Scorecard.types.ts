import type { BadgeTone } from "../Badge/Badge.types";

export type ScorecardTrend = "up" | "down" | "flat" | "neutral";

export type ScorecardSize = "sm" | "md" | "lg";

export interface ScorecardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: ScorecardTrend;
  hint?: string;
  size?: ScorecardSize;
  badge?: string;
  badgeTone?: BadgeTone;
  onClick?: () => void;
}
