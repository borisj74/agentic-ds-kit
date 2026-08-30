import { BarChart } from "@/ui/BarChart";
import { Button } from "@/ui/Button";
import { LineChart } from "@/ui/LineChart";
import { PageHeader } from "@/ui/PageHeader";
import { PieChart } from "@/ui/PieChart";
import { Scoreboard } from "@/ui/Scoreboard";
import { Section } from "@/ui/Section";
import { Table } from "@/ui/Table";
import type { ChartDatum } from "@/ui/shared/chartMath";
import type { ScorecardProps } from "@/ui/Scorecard";
import type { TableColumn } from "@/ui/Table";
import styles from "./patterns.module.css";

export interface DashboardPatternProps {
  metrics: ScorecardProps[];
  table: {
    columns: TableColumn[];
    rows: Record<string, string>[];
    caption?: string;
  };
  pie?: ChartDatum[];
  bar?: ChartDatum[];
  line?: ChartDatum[];
}

export function DashboardPattern({ metrics, table, pie, bar, line }: DashboardPatternProps) {
  return (
    <div className={styles.pattern}>
      <PageHeader
        title="Insights"
        subtitle="Product health for the current sprint"
        actions={
          <>
            <Button variant="secondary" size="md">
              Export
            </Button>
            <Button variant="primary" size="md">
              Create task
            </Button>
          </>
        }
      />
      <Scoreboard items={metrics} aria-label="Sprint health" />
      {pie ? (
        <PieChart title="Properties by status" data={pie} />
      ) : null}
      {bar ? <BarChart title="Revenue by region" data={bar} /> : null}
      {line ? (
        <LineChart title="Weekly active users" data={line} variant="area" />
      ) : null}
      <Section
        title="Open tasks"
        description="Items that need attention"
        actions={
          <Button variant="secondary" size="sm">
            View all
          </Button>
        }
      >
        <Table columns={table.columns} rows={table.rows} caption={table.caption} />
      </Section>
    </div>
  );
}
