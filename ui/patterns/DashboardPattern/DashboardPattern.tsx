"use client";

import { Button } from "@/ui/Button";
import { DataTable } from "@/ui/DataTable";
import type { DataTableColumn, DataTableRow } from "@/ui/DataTable";
import { LineChart } from "@/ui/LineChart";
import { PageHeader } from "@/ui/PageHeader";
import { Scoreboard } from "@/ui/Scoreboard";
import { Section } from "@/ui/Section";
import type { ChartDatum } from "@/ui/shared/chartMath";

const SPRINT_METRICS = [
  { label: "Weekly users", value: "1.44k", delta: "+6.2%", trend: "up" as const, hint: "vs last week", size: "lg" as const, badge: "Live", badgeTone: "success" as const },
  { label: "Open tasks", value: "4", delta: "+1", trend: "up" as const, hint: "this sprint", size: "lg" as const, badge: "Sprint", badgeTone: "info" as const },
  { label: "Blocked", value: "1", delta: "0", trend: "flat" as const, hint: "need owner", size: "lg" as const, badge: "At risk", badgeTone: "danger" as const },
  { label: "Ready", value: "1", delta: "+1", trend: "up" as const, hint: "to ship", size: "lg" as const, badge: "Ship", badgeTone: "brand" as const },
];

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
  { key: "task", header: "Task", sortable: true },
  { key: "owner", header: "Owner", sortable: true },
  { key: "status", header: "Status", sortable: true },
];

const TASK_ROWS: DataTableRow[] = [
  {
    id: "launch-brief",
    task: { type: "file", label: "Launch brief" },
    owner: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: "/faces/maya-chen.jpg" },
    status: { type: "badge", label: "In review", tone: "warning" },
  },
  {
    id: "qa-checklist",
    task: { type: "file", label: "QA checklist" },
    owner: { type: "avatar", label: "Unassigned", name: "Unassigned" },
    status: { type: "badge", label: "Blocked", tone: "danger" },
  },
  {
    id: "release-notes",
    task: { type: "file", label: "Release notes" },
    owner: { type: "avatar", label: "Jordan Lee", name: "Jordan Lee", src: "/faces/jordan-lee.jpg" },
    status: { type: "badge", label: "Ready", tone: "success" },
  },
  {
    id: "support-macros",
    task: { type: "file", label: "Support macros" },
    owner: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera", src: "/faces/alex-rivera.jpg" },
    status: { type: "badge", label: "In progress", tone: "info" },
  },
];

export function DashboardPattern() {
  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Overview"
          subtitle="Product health for the current sprint."
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Workspace", href: "#" },
            { label: "Overview" },
          ]}
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
      </div>
      <div className="layout-content">
        <Section title="Sprint metrics">
          <Scoreboard
            className="layout-metrics layout-metrics--fixed-4"
            aria-label="Sprint metrics"
            items={SPRINT_METRICS}
          />
        </Section>
        <Section title="Weekly users">
          <LineChart data={WEEKLY_USERS} variant="line" showTable={false} />
        </Section>
        <Section title="Open tasks" description="4 items need attention">
          <DataTable
            caption="Sprint backlog"
            selectable
            toolbar
            cellSize="sm"
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
    </div>
  );
}
