import { Button } from "@/ui/Button";
import { PageHeader } from "@/ui/PageHeader";
import { Scoreboard } from "@/ui/Scoreboard";
import { Section } from "@/ui/Section";
import { Table } from "@/ui/Table";
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
}

export function DashboardPattern({ metrics, table }: DashboardPatternProps) {
  return (
    <div className={styles.pattern}>
      <PageHeader
        title="Studio dashboard"
        subtitle="A tiny Florence-style playground — contracts in JSON, components in ui/."
        eyebrow="Personal kit sandbox"
        actions={
          <>
            <Button variant="primary" size="md">
              Export report
            </Button>
            <Button variant="secondary" size="md">
              View details
            </Button>
          </>
        }
      />
      <Section title="Key metrics" description="Overview for the current period">
        <Scoreboard items={metrics} aria-label="Studio key metrics" />
      </Section>
      <Section title="Recent activity" description="Latest project updates">
        <Table columns={table.columns} rows={table.rows} caption={table.caption} />
      </Section>
    </div>
  );
}
