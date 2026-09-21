"use client";

import { Tabs } from "agentic-ds-kit";
import styles from "./ComponentDoc.module.css";

export function DocTabList({
  value,
  onChange,
  ariaLabel = "Master views",
}: {
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className={styles.tabListHost}>
      <Tabs
        size="md"
        variant="line"
        value={value}
        onChange={onChange}
        ariaLabel={ariaLabel}
        items={[
          { id: "preview", label: "Preview" },
          { id: "variants", label: "Variants" },
        ]}
      />
    </div>
  );
}
