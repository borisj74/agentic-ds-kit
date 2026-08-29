import type { ChartDatum } from "../shared/chartMath";

export type PieChartVariant = "donut" | "pie";

export interface PieChartProps {
  data?: ChartDatum[];
  title?: string;
  description?: string;
  variant?: PieChartVariant;
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
