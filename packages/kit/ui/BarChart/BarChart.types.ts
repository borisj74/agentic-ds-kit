import type { ChartDatum, ChartSeries } from "../shared/chartMath";

export type BarChartOrientation = "vertical" | "horizontal";

export interface BarChartProps {
  data?: ChartDatum[];
  categories?: string[];
  series?: ChartSeries[];
  title?: string;
  description?: string;
  orientation?: BarChartOrientation;
  height?: number;
  showGrid?: boolean;
  showTable?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  className?: string;
}
