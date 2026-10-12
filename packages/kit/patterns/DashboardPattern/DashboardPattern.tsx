"use client";

import { useState } from "react";
import { DataTable } from "../../ui/DataTable";
import type { DataTableColumn } from "../../ui/DataTable";
import { LineChart } from "../../ui/LineChart";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { Scoreboard } from "../../ui/Scoreboard";
import { Section } from "../../ui/Section";
import { SPRINT_METRICS, TASK_ROWS, WEEKLY_USERS } from "./dashboard-data";

const TASK_COLUMNS: DataTableColumn[] = [
  { key: "task", header: "Task", sortable: true },
  { key: "owner", header: "Owner", sortable: true },
  { key: "status", header: "Status", sortable: true },
];

export function DashboardPattern({ breadcrumbs }: { breadcrumbs?: PageHeaderProps["breadcrumbs"] }) {
  const [taskRows, setTaskRows] = useState(TASK_ROWS);

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Overview"
          subtitle="Workspace overview for the current team."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Section title="Sprint metrics" size="sm">
          <Scoreboard aria-label="Sprint metrics" items={SPRINT_METRICS} />
        </Section>
        <Section title="Weekly users" size="sm">
          <LineChart data={WEEKLY_USERS} variant="line" showTable={false} />
        </Section>
        <Section title="Open tasks" description="4 items need attention" size="sm">
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
            bulkActions={[
              {
                id: "export",
                label: "Export",
                variant: "secondary",
                iconStart: "Download",
                onClick: () => undefined,
              },
              {
                id: "delete",
                label: "Delete",
                variant: "danger",
                iconStart: "Trash2",
                onClick: (ids) => {
                  setTaskRows((current) => current.filter((row) => !ids.includes(String(row.id))));
                },
              },
            ]}
            columns={TASK_COLUMNS}
            rows={taskRows}
          />
        </Section>
      </div>
    </div>
  );
}
