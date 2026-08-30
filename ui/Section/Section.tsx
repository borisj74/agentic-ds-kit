"use client";

import { useId, useState } from "react";
import { LucideByName } from "@/ui/Button/lucideName";
import type { SectionProps } from "./Section.types";
import styles from "./Section.module.css";

export type { SectionProps, SectionSize } from "./Section.types";

export function Section({
  title,
  description,
  size = "md",
  actions,
  children,
  collapsible = true,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
}: SectionProps) {
  const headingId = useId();
  const panelId = useId();
  const canCollapse = Boolean(collapsible && title);
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = canCollapse ? (isControlled ? openProp : uncontrolledOpen) : true;

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const showHeader = Boolean(title || description || actions);

  return (
    <section
      className={`${styles.section} ${styles[size]}${canCollapse ? ` ${styles.collapsible}` : ""}`}
      aria-labelledby={title ? headingId : undefined}
    >
      {showHeader ? (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title ? (
              <h2 id={headingId} className={styles.title}>
                {canCollapse ? (
                  <button
                    type="button"
                    className={styles.trigger}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpen(!open)}
                  >
                    <LucideByName
                      name={open ? "ChevronDown" : "ChevronRight"}
                      size={18}
                      className={styles.chevron}
                    />
                    {title}
                  </button>
                ) : (
                  title
                )}
              </h2>
            ) : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      <div id={canCollapse ? panelId : undefined} className={styles.body} hidden={canCollapse ? !open : undefined}>
        {children}
      </div>
    </section>
  );
}
