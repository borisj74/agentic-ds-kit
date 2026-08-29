"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CollapsibleProps } from "./Collapsible.types";
import styles from "./Collapsible.module.css";

export type { CollapsibleProps } from "./Collapsible.types";

export function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: CollapsibleProps) {
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolledOpen;
  const uid = useId();
  const buttonId = `${uid}-trigger`;
  const panelId = `${uid}-panel`;

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        id={buttonId}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.title}>{trigger}</span>
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
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
