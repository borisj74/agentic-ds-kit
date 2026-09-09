"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LucideByName } from "../Button/lucideName";
import type { DrawerProps } from "./Drawer.types";
import styles from "./Drawer.module.css";

export type { DrawerProps, DrawerSide, DrawerSize } from "./Drawer.types";

const FOCUSABLE = "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])";

const SIZE_CLASS = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

export function Drawer({
  open,
  title,
  description,
  side = "right",
  size = "md",
  showClose = true,
  onClose,
  children,
  footer,
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const root = panelRef.current;
    if (!root) return;

    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    const firstFocusable = getFocusable()[0];
    (firstFocusable ?? root).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && root.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, mounted]);

  if (!open) return null;
  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`${styles.panel} ${styles[side]} ${SIZE_CLASS[size]}`}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <div className={styles.copy}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          {showClose ? (
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <LucideByName name="X" size={16} />
            </button>
          ) : null}
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
