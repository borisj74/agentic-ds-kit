"use client";

import { Tabs } from "agentic-ds-kit";
import styles from "./ColorFoundations.module.css";

export type FoundationTab = "primitives" | "semantics";

export function FoundationTabList({
  value,
  onChange,
  ariaLabel,
}: {
  value: FoundationTab;
  onChange: (id: FoundationTab) => void;
  ariaLabel: string;
}) {
  return (
    <div className={styles.tabList}>
      <Tabs
        size="sm"
        variant="segmented"
        value={value}
        onChange={(id) => onChange(id as FoundationTab)}
        ariaLabel={ariaLabel}
        items={[
          { id: "primitives", label: "Primitives" },
          { id: "semantics", label: "Semantics" },
        ]}
      />
    </div>
  );
}
