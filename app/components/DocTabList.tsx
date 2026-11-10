"use client";

import { useLayoutEffect } from "react";
import { Tabs } from "agentic-ds-kit";
import { useDocView } from "./DocView";
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
  const view = useDocView();

  // Inside the stage's Variants tab: show the variants view, before paint, with no tab bar.
  useLayoutEffect(() => {
    if (view === "variants" && value !== "variants") onChange("variants");
  }, [view, value, onChange]);

  if (view === "variants") return null;

  return (
    <div className={styles.tabListHost}>
      <Tabs
        size="sm"
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
