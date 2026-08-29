"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
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

  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return;

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
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
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
    </div>
  );
}
