"use client";

import { Card } from "../../ui/Card";
import { DataTable } from "../../ui/DataTable";
import type { DataTableColumn } from "../../ui/DataTable";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { Scoreboard } from "../../ui/Scoreboard";
import { Section } from "../../ui/Section";
import { Timeline } from "../../ui/Timeline";
import { DELIVERY_METRICS, DELIVERY_STEPS, MEMBER_ROWS } from "./delivery-data";

export interface DeliveryPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

const MEMBER_COLUMNS: DataTableColumn[] = [
  { key: "member", header: "Member" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
];

export function DeliveryPattern({ breadcrumbs }: DeliveryPatternProps) {
  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Delivery"
          subtitle="Stat cards, a members table, and a now/next/later timeline — kit pieces only."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Section title="Cycle health" size="sm">
          <Scoreboard aria-label="Cycle health" items={DELIVERY_METRICS} />
        </Section>
        <Section title="Now / next / later" size="sm">
          <Timeline label="Delivery sequence" items={DELIVERY_STEPS} />
        </Section>
        <Section title="Crew" size="sm">
          <Card flush>
            <DataTable ariaLabel="Delivery crew" columns={MEMBER_COLUMNS} rows={MEMBER_ROWS} cellSize="md" />
          </Card>
        </Section>
      </div>
    </div>
  );
}
