export type TimelineStatus = "now" | "next" | "later";

export interface TimelineItem {
  id?: string;
  title?: string;
  body?: string;
  phase?: string;
  status?: TimelineStatus;
}

export interface TimelineProps {
  items?: TimelineItem[];
  label?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}
