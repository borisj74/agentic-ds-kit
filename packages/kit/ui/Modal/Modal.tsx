"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ModalCard } from "../ModalCard";
import type { ModalProps } from "./Modal.types";
import { mergeRefs } from "../shared/mergeRefs";
import styles from "./Modal.module.css";
import { useIsClient } from "../shared/useIsClient";
import { useThemeScopeMarker } from "../shared/themeScope";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";
import { FOCUSABLE, firstBodyFocusable, lockPage, restoreFocus } from "../shared/overlayLock";

export type { ModalProps, ModalSize } from "./Modal.types";

export function Modal({
  open,
  title,
  description,
  eyebrow,
  tone,
  size = "md",
  showClose = true,
  onClose,
  children,
  footer,
  footerStart,
  contained = false,
  ref,
  ...rest
}: ModalProps) {
  const labels = useKitLabels();
  const cardRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const setCardRef = useMemo(() => mergeRefs(cardRef, ref), [ref]);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mounted = useIsClient();
  const scope = useThemeScopeMarker();

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const root = cardRef.current;
    if (!root) return;

    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    // The first field in the body, not Close; with no field the dialog itself takes focus.
    (firstBodyFocusable(root) ?? root).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A nested overlay (Select, DatePicker) already handled this Escape.
        if (event.defaultPrevented) return;
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
    // Contained (docs canvas) leaves the page alone; otherwise the page behind is inert and still.
    const unlock = contained ? () => {} : lockPage(rootRef.current);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlock();
      restoreFocus(previousFocusRef.current);
    };
  }, [open, contained, mounted]);

  if (!open) return null;
  if (!contained && !mounted) return null;

  const node = (
    <div
      ref={rootRef}
      data-size={size}
      className={`${styles.root} ${contained ? styles.contained : ""} ${scope.fontClassName ?? ""}`.trim()}
      data-theme-scope={scope.id}
      data-theme={scope.mode === "dark" ? "dark" : undefined}
    >
      <button type="button" className={styles.scrim} aria-label={labels.closeDialog} onClick={onClose} />
      <ModalCard
        {...rest}
        {...nisthaAttr("modal", rest)}
        ref={setCardRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        title={title}
        description={description}
        eyebrow={eyebrow}
        tone={tone}
        size={size}
        onClose={showClose ? onClose : undefined}
        footer={footer}
        footerStart={footerStart}
      >
        {children}
      </ModalCard>
    </div>
  );

  if (contained) return node;
  return createPortal(node, document.body);
}
