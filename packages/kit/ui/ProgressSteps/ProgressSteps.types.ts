export type ProgressStepsOrientation = "horizontal" | "vertical";
export type ProgressStepsSize = "sm" | "md";
export type ProgressStepsStatus = "complete" | "current" | "upcoming" | "error";

export interface ProgressStepsItem {
  id: string;
  label: string;
  description?: string;
  status?: ProgressStepsStatus;
}

export interface ProgressStepsProps {
  steps: ProgressStepsItem[];
  current?: number;
  orientation?: ProgressStepsOrientation;
  size?: ProgressStepsSize;
  ariaLabel?: string;
  className?: string;
}
