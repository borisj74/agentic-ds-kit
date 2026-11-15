"use client";

import { useState } from "react";
import { FailureClusters, type FailureCluster, type FailureFilters } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { FAILURE_CLUSTERS } from "@/lib/blocks/failure-clusters.sample";

/**
 * FailureClusters with 6 causes across 5 agents. Mark known, Mute 24h and Open issue change the
 * sample live; the filters narrow the list (time is a label in the demo).
 */
export function FailureClustersDemo() {
  const [clusters, setClusters] = useState<FailureCluster[]>(FAILURE_CLUSTERS);
  const [filters, setFilters] = useState<FailureFilters>({ time: "Last 24 hours" });
  const [note, setNote] = useState("");

  function update(id: string, change: Partial<FailureCluster>, message: string) {
    setClusters((list) => list.map((c) => (c.id === id ? { ...c, ...change } : c)));
    setNote(message);
  }

  return (
    <>
      <FailureClusters
        clusters={clusters}
        filters={filters}
        onFiltersChange={setFilters}
        onMarkKnown={(id) => update(id, { status: "known" }, "Marked known")}
        onMute={(id) => update(id, { mutedUntil: "until 21:00 tomorrow" }, "Muted for 24 hours")}
        onOpenIssue={(id) => setNote(`Issue opened for ${clusters.find((c) => c.id === id)?.title ?? id}`)}
      />
      <p role="status" className={styles.srOnly}>
        {note}
      </p>
    </>
  );
}
