"use client";

import { useId, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
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
  const titleId = `${uid}-title`;
  const buttonId = `${uid}-trigger`;
  const panelId = `${uid}-panel`;

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <p id={titleId} className={styles.title}>
          {trigger}
        </p>
        <button
          type="button"
          id={buttonId}
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`Toggle ${trigger}`}
          onClick={() => setOpen(!open)}
        >
          <ChevronsUpDown size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={titleId}
        className={styles.panel}
        hidden={!open}
      >
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
