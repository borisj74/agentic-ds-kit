export type ScorecardTrend = "up" | "down" | "neutral";

export interface ScorecardProps {
  title: string;
  metric: string;
  trend?: ScorecardTrend;
  trendLabel?: string;
}
