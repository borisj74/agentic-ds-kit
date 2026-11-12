import contract from "../../packages/kit/contracts/kpiboard.json";
import type { BlockDoc } from "./types";

export const kpiBoardDoc: BlockDoc = {
  slug: "kpi-board",
  label: "KPI board",
  name: "KpiBoard",
  contract,
  lead:
    "The top of a dashboard. Three or four KPIs sit in one row and double as the picker: the chart and the table of top rows follow the one you pick. One range control changes all of them.",
  usage: `import { KpiBoard } from "agentic-ds-kit";

export function Dashboard({ metrics, series, rows }) {
  return (
    <main className="layout-content">
      <KpiBoard
        metrics={metrics}        // { id, label, values: { [range]: { value, delta? } }, columns }[]
        series={series}          // series[metricId][range]: { label, value }[]
        rows={rows}              // rows[metricId][range]: DataTable rows, each with an id
        ranges={[
          { value: "7d", label: "7 days" },
          { value: "30d", label: "30 days" },
          { value: "90d", label: "90 days" },
        ]}
        defaultRange="30d"       // or range + onRangeChange
        defaultSelectedMetric="revenue" // or selectedMetric + onSelectedMetricChange
      />
    </main>
  );
}`,
};
