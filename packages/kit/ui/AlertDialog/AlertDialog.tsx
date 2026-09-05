"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import type { AlertDialogProps } from "./AlertDialog.types";
import styles from "./AlertDialog.module.css";

export type { AlertDialogProps, AlertDialogActionVariant, AlertDialogSize } from "./AlertDialog.types";

export function AlertDialog({
  open,
  title,
  description,
  cancelLabel = "Cancel",
  actionLabel,
  actionVariant = "primary",
  size = "md",
  onCancel,
  onAction,
}: AlertDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const onCancelRef = useRef(onCancel);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  onCancelRef.current = onCancel;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const root = dialogRef.current;
    if (!root) return;

    const cancelButton = root.querySelector<HTMLButtonElement>("button");
    cancelRef.current = cancelButton;
    cancelButton?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
      if (buttons.length === 0) return;

      const first = buttons[0];
      const last = buttons[buttons.length - 1];
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
        if (event.target === event.currentTarget) event.preventDefault();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`${styles.dialog} ${styles[size]}`}
        tabIndex={-1}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
        <div className={styles.footer}>
          <ButtonGroup ariaLabel="Dialog actions">
            <Button variant="secondary" size="md" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant={actionVariant} size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>,
    document.body,
  );
}
