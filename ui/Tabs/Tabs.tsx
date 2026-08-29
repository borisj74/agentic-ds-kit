"use client";

import { useState } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
  content: string;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
}

export function Tabs({ items, defaultTab }: TabsProps) {
  const initial = defaultTab ?? items[0]?.id;
  const [active, setActive] = useState(initial);
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label="Tabs" className={styles.list}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            className={`${styles.tab} ${active === item.id ? styles.active : ""}`}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${activeItem.id}`}
        aria-labelledby={`tab-${activeItem.id}`}
        className={styles.panel}
      >
        {activeItem.content}
      </div>
    </div>
  );
}
