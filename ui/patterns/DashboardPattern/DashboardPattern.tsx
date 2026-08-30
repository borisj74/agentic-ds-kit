import { Button } from "@/ui/Button";
import { DataTable } from "@/ui/DataTable";
import type { DataTableColumn, DataTableRow } from "@/ui/DataTable";
import { LineChart } from "@/ui/LineChart";
import { PageHeader } from "@/ui/PageHeader";
import { Section } from "@/ui/Section";
import type { ChartDatum } from "@/ui/shared/chartMath";
import styles from "./patterns.module.css";

const WEEKLY_USERS: ChartDatum[] = [
  { label: "Mon", value: 1280 },
  { label: "Tue", value: 1410 },
  { label: "Wed", value: 1320 },
  { label: "Thu", value: 1480 },
  { label: "Fri", value: 1360 },
  { label: "Sat", value: 1440 },
  { label: "Sun", value: 1390 },
];

const TASK_COLUMNS: DataTableColumn[] = [
  { key: "task", header: "Task" },
  { key: "owner", header: "Owner" },
  { key: "status", header: "Status" },
];

const TASK_ROWS: DataTableRow[] = [
  {
    id: "launch-brief",
    task: "Launch brief",
    owner: "Maya Chen",
    status: { type: "badge", label: "In review", tone: "warning" },
  },
  {
    id: "qa-checklist",
    task: "QA checklist",
    owner: "Unassigned",
    status: { type: "badge", label: "Blocked", tone: "danger" },
  },
  {
    id: "release-notes",
    task: "Release notes",
    owner: "Jordan Lee",
    status: { type: "badge", label: "Ready", tone: "success" },
  },
  {
    id: "support-macros",
    task: "Support macros",
    owner: "Alex Rivera",
    status: { type: "badge", label: "In progress", tone: "info" },
  },
];

export function DashboardPattern() {
  return (
    <div className={styles.pattern}>
      <PageHeader
        title="Overview"
        subtitle="Product health for the current sprint."
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
      <LineChart data={WEEKLY_USERS} variant="line" showTable={false} />
      <Section title="Open tasks" description="4 items need attention" collapsible={false}>
        <DataTable
          caption="Sprint backlog"
          selectable
          toolbar
          searchPlaceholder="Search tasks..."
          filters={[
            { key: "status", label: "Status" },
            { key: "owner", label: "Owner" },
          ]}
          columnSettings
          columns={TASK_COLUMNS}
          rows={TASK_ROWS}
        />
      </Section>
    </div>
  );
}
