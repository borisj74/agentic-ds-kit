"use client";

import { KpiBoard } from "agentic-ds-kit";
import { KPI_METRICS, KPI_RANGES, KPI_ROWS, KPI_SERIES } from "@/lib/blocks/kpi-board.sample";

/**
 * KpiBoard with sample SaaS analytics: pick a KPI to chart it and list its top rows, switch the
 * range to change every part. Uncontrolled, so the block keeps its own range and selection.
 */
export function KpiBoardDemo() {
  return (
    <KpiBoard
      description="Acme Analytics · all regions · example data"
      metrics={KPI_METRICS}
      series={KPI_SERIES}
      rows={KPI_ROWS}
      ranges={KPI_RANGES}
      defaultRange="30d"
    />
  );
}
