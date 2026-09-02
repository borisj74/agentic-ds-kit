import type { ChartDatum, ChartSeries } from "../shared/chartMath";

export type LineChartVariant = "line" | "area";

export interface LineChartProps {
  data?: ChartDatum[];
  labels?: string[];
  series?: ChartSeries[];
  title?: string;
  description?: string;
  variant?: LineChartVariant;
  height?: number;
  showGrid?: boolean;
  showTable?: boolean;
  includeZero?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  className?: string;
}
