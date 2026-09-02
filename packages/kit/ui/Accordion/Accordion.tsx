"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AccordionProps } from "./Accordion.types";
import styles from "./Accordion.module.css";

export type { AccordionProps, AccordionItem } from "./Accordion.types";

export function Accordion({ items, defaultOpen }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className={styles.root}>
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `accordion-panel-${item.id}`;
        const buttonId = `accordion-button-${item.id}`;
        return (
          <div key={item.id} className={styles.item}>
            <button
              type="button"
              id={buttonId}
              className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
            >
              <span className={styles.title}>{item.title}</span>
              <ChevronDown
                className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                size={16}
                strokeWidth={2}
                aria-hidden
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={styles.panel}
              hidden={!open}
            >
              <p className={styles.body}>{item.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
