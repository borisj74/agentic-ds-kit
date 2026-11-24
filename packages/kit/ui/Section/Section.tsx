"use client";

import { useId, useState } from "react";
import { LucideByName } from "../Button/lucideName";
import { Count } from "../Count";
import type { SectionProps } from "./Section.types";
import { cx } from "../shared/cx";
import styles from "./Section.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { SectionProps, SectionSize, SectionHeadingLevel } from "./Section.types";

export function Section({
  title,
  description,
  eyebrow,
  count,
  headingLevel = 2,
  divider = false,
  sticky = false,
  size = "md",
  actions,
  children,
  collapsible = false,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  ref,
  ...rest
}: SectionProps) {
  const headingId = useId();
  const panelId = useId();
  const canCollapse = Boolean(collapsible && title);
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = canCollapse ? (isControlled ? openProp : uncontrolledOpen) : true;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const showHeader = Boolean(title || description || actions || eyebrow);

  return (
    <section
      {...rest} {...nisthaAttr("section", rest)}
      ref={ref}
      className={cx(
        styles.section,
        styles[size],
        canCollapse && styles.collapsible,
        divider && styles.divider,
        sticky && styles.sticky,
        className,
      )}
      aria-labelledby={title ? headingId : undefined}
    >
      {showHeader ? (
        <header className={styles.header}>
          <div className={styles.heading}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {title ? (
              <div className={styles.titleRow}>
                <Heading id={headingId} className={styles.title}>
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
                        size={16}
                        className={styles.chevron}
                      />
                      {title}
                    </button>
                  ) : (
                    title
                  )}
                </Heading>
                {typeof count === "number" ? <Count count={count} intent="neutral" subtle /> : null}
              </div>
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
