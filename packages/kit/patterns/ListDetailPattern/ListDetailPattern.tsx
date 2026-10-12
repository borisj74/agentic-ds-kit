"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "../../ui/AppNav";
import { Badge } from "../../ui/Badge";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { Section } from "../../ui/Section";
import { Table } from "../../ui/Table";
import { PROJECTS, type ListDetailItem } from "./list-detail-data";
import styles from "./ListDetailPattern.module.css";

export interface ListDetailPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  selectedId?: string;
}

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

  // Follow a changed `selectedId` prop by adjusting state during render
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [prevSelectedId, setPrevSelectedId] = useState(selectedId);
  if (selectedId !== prevSelectedId) {
    setPrevSelectedId(selectedId);
    if (selectedId) setActiveId(projectById(selectedId).id);
  }

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
