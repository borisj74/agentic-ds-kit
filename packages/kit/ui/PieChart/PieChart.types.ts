import type { ChartDatum } from "../shared/chartMath";

export type PieChartVariant = "donut" | "pie";
export type PieChartLayout = "split" | "stack";

export interface PieChartProps {
  data?: ChartDatum[];
  title?: string;
  description?: string;
  variant?: PieChartVariant;
  layout?: PieChartLayout;
  size?: number;
  maxSegments?: number;
  sort?: boolean;
  otherLabel?: string;
  centerLabel?: string;
  showCenterTotal?: boolean;
  showTable?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  className?: string;
}
