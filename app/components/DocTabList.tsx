"use client";

import { Tabs } from "@/ui/Tabs";
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
        variant="segmented"
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
