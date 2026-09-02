export type InsightCardTone = "opportunity" | "warning" | "danger" | "info" | "neutral";
export type InsightCardSize = "sm" | "md" | "lg";

export interface InsightCardAction {
  label: string;
  onClick?: () => void;
}

export interface InsightCardProps {
  title: string;
  description?: string;
  eyebrow?: string;
  tone?: InsightCardTone;
  size?: InsightCardSize;
  confidence?: string;
  source?: string;
  primaryAction?: InsightCardAction;
  secondaryAction?: InsightCardAction;
  onDismiss?: () => void;
}
