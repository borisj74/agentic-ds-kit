import { AppNav } from "@/ui/AppNav";
import { Section } from "@/ui/Section";
import { Table } from "@/ui/Table";
import { Badge } from "@/ui/Badge";
import type { BadgeTone } from "@/ui/Badge";
import type { AppNavItem } from "@/ui/AppNav";
import type { TableColumn } from "@/ui/Table";
import styles from "./ListDetailPattern.module.css";

export interface ListDetailPatternProps {
  nav: {
    title: string;
    items: AppNavItem[];
  };
  table: {
    columns: TableColumn[];
    rows: Record<string, string>[];
    caption?: string;
  };
  detail: {
    title: string;
    description: string;
    status: string;
    statusTone: BadgeTone;
    body: string;
  };
}

export function ListDetailPattern({ nav, table, detail }: ListDetailPatternProps) {
  return (
    <div className={styles.layout}>
      <AppNav title={nav.title} items={nav.items} />
      <div className={styles.main}>
        <Section title="Projects" description="Select a row to view details">
          <Table columns={table.columns} rows={table.rows} caption={table.caption} />
        </Section>
        <Section title={detail.title} description={detail.description}>
          <div className={styles.detail}>
            <Badge tone={detail.statusTone}>{detail.status}</Badge>
            <p className={styles.body}>{detail.body}</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
