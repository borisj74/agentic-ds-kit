"use client";

import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { CollapsibleProps } from "./Collapsible.types";
import { cx } from "../shared/cx";
import styles from "./Collapsible.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CollapsibleProps } from "./Collapsible.types";

export function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
  ref,
  ...rest
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
    <div {...rest} {...nisthaAttr("collapsible", rest)} ref={ref} className={cx(styles.root, className)}>
      <button
        type="button"
        id={buttonId}
        className={styles.header}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <ChevronRight
          className={cx(styles.chevron, open && styles.chevronOpen)}
          size={16}
          strokeWidth={ICON_STROKE}
          aria-hidden
        />
        <span className={styles.title}>{trigger}</span>
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
