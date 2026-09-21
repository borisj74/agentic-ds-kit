"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "../../AppNav";
import { Badge } from "../../Badge";
import type { BadgeTone } from "../../Badge";
import { PageHeader } from "../../PageHeader";
import type { PageHeaderProps } from "../../PageHeader";
import { Section } from "../../Section";
import { Table } from "../../Table";
import styles from "./ListDetailPattern.module.css";

export interface ListDetailItem {
  id: string;
  name: string;
  owner: string;
  status: string;
  statusTone: BadgeTone;
  updated: string;
  body: string;
}

export interface ListDetailPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  selectedId?: string;
}

const PROJECTS: ListDetailItem[] = [
  {
    id: "launch-brief",
    name: "Launch brief",
    owner: "Maya Chen",
    status: "In review",
    statusTone: "warning",
    updated: "2h ago",
    body: "Two notes on positioning. Close them before the freeze so copy can lock.",
  },
  {
    id: "qa-checklist",
    name: "QA checklist",
    owner: "Unassigned",
    status: "Blocked",
    statusTone: "danger",
    updated: "4h ago",
    body: "No owner for 2 days. Assign someone before Thursday's review.",
  },
  {
    id: "release-notes",
    name: "Release notes",
    owner: "Jordan Lee",
    status: "Ready",
    statusTone: "success",
    updated: "Yesterday",
    body: "Changelog is drafted. Confirm the known-issues list before we tag.",
  },
  {
    id: "support-macros",
    name: "Support macros",
    owner: "Alex Rivera",
    status: "In progress",
    statusTone: "info",
    updated: "5h ago",
    body: "Refund and delay macros are drafted. Escalation paths still need a pass.",
  },
];

const COLUMNS = [
  { key: "name", header: "Project", emphasis: true },
  { key: "owner", header: "Owner" },
  { key: "status", header: "Status" },
  { key: "updated", header: "Updated" },
];

function projectById(id: string | undefined): ListDetailItem {
  return PROJECTS.find((item) => item.id === id) ?? PROJECTS[0];
}

export function ListDetailPattern({ breadcrumbs, selectedId }: ListDetailPatternProps) {
  const [activeId, setActiveId] = useState(projectById(selectedId).id);

  useEffect(() => {
    if (selectedId) setActiveId(projectById(selectedId).id);
  }, [selectedId]);

  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (PROJECTS.some((item) => item.id === hash)) setActiveId(hash);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const selected = projectById(activeId);

  const navItems = useMemo(
    () =>
      PROJECTS.map((item) => ({
        href: `#${item.id}`,
        label: item.name,
        active: item.id === selected.id,
      })),
    [selected.id],
  );

  const rows = PROJECTS.map((item) => ({
    name: item.name,
    owner: item.owner,
    status: (
      <Badge tone={item.statusTone} size="sm">
        {item.status}
      </Badge>
    ),
    updated: item.updated,
  }));

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Projects"
          subtitle="Sprint 24 files and their current status."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <div className={styles.shell}>
          <AppNav title="Files" items={navItems} />
          <div className={styles.main}>
            <Section title="Projects" description="Select a file in the list to view details" size="sm">
              <Table columns={COLUMNS} rows={rows} caption="Sprint 24 projects" />
            </Section>
            <Section title={selected.name} description={`${selected.owner} · ${selected.updated}`} size="sm">
              <div className={styles.detail}>
                <Badge tone={selected.statusTone}>{selected.status}</Badge>
                <p className={styles.body}>{selected.body}</p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
