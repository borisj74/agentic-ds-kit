"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ModalCard } from "../ModalCard";
import type { ModalProps } from "./Modal.types";
import { mergeRefs } from "../shared/mergeRefs";
import styles from "./Modal.module.css";

export type { ModalProps, ModalSize } from "./Modal.types";

const FOCUSABLE = "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])";

const subscribeNoop = () => () => {};

/** False during SSR and hydration, true once the client has taken over — portals need `document`. */
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function Modal({
  open,
  title,
  description,
  size = "md",
  showClose = true,
  onClose,
  children,
  footer,
  contained = false,
  ref,
  ...rest
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const setCardRef = useMemo(() => mergeRefs(cardRef, ref), [ref]);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mounted = useIsClient();

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const root = cardRef.current;
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
    if (!contained) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (!contained) {
        document.body.style.overflow = previousOverflow;
      }
      previousFocusRef.current?.focus();
    };
  }, [open, contained, mounted]);

  if (!open) return null;
  if (!contained && !mounted) return null;

  const node = (
    <div className={`${styles.root} ${contained ? styles.contained : ""}`}>
      <button type="button" className={styles.scrim} aria-label="Close dialog" onClick={onClose} />
      <ModalCard
        {...rest}
        ref={setCardRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        title={title}
        description={description}
        size={size}
        onClose={showClose ? onClose : undefined}
        footer={footer}
      >
        {children}
      </ModalCard>
    </div>
  );

  if (contained) return node;
  return createPortal(node, document.body);
}
