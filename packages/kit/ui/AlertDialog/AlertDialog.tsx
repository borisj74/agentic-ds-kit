"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { Field } from "../Field";
import { Input } from "../Input";
import { ModalCard } from "../ModalCard";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { AlertDialogProps } from "./AlertDialog.types";
import styles from "./AlertDialog.module.css";
import { useIsClient } from "../shared/useIsClient";
import { useMediaQuery } from "../shared/useMediaQuery";
import { useThemeScopeMarker } from "../shared/themeScope";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";
import { FOCUSABLE, lockPage, restoreFocus } from "../shared/overlayLock";

export type { AlertDialogProps, AlertDialogActionVariant, AlertDialogSize } from "./AlertDialog.types";

/** Media queries cannot read var(): 30rem (480px) is where Modal goes full screen and SaveBar stacks. */
const SHEET_QUERY = "(max-width: 30rem)";

export function AlertDialog({
  open,
  title,
  description,
  eyebrow,
  tone,
  consequences,
  confirmText,
  cancelLabel = "Cancel",
  actionLabel,
  actionVariant = "primary",
  size = "md",
  footerStart,
  onCancel,
  onAction,
  className,
  ref,
  ...rest
}: AlertDialogProps) {
  const labels = useKitLabels();
  const confirmId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const setDialogRef = useMemo(() => mergeRefs(dialogRef, ref), [ref]);
  const onCancelRef = useRef(onCancel);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mounted = useIsClient();
  const scope = useThemeScopeMarker();
  const [typed, setTyped] = useState("");
  // Below 480px the dialog docks to the bottom as a sheet with full-width lg Buttons, Cancel on top.
  const sheet = useMediaQuery(SHEET_QUERY);
  const needsTyping = Boolean(confirmText);
  const matches = !needsTyping || typed === confirmText;
  // A typo shows an error; a correct start (or nothing yet) only shows the hint.
  const mistyped = needsTyping && typed !== "" && !confirmText!.startsWith(typed);

  useLayoutEffect(() => {
    onCancelRef.current = onCancel;
  });

  // Each opening starts with an empty field (adjusted during render, not in an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setTyped("");
  }

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const root = dialogRef.current;
    if (!root) return;

    // The type-to-confirm field when there is one, else Cancel: never the destructive action.
    const field = document.getElementById(confirmId);
    const start = (field && root.contains(field) ? field : null) ?? root.querySelector<HTMLElement>("[data-alert-cancel]");
    (start ?? root).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A nested overlay (Select, DatePicker) already handled this Escape.
        if (event.defaultPrevented) return;
        event.preventDefault();
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
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
    const unlock = lockPage(overlayRef.current);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlock();
      restoreFocus(previousFocusRef.current);
    };
  }, [open, mounted, confirmId]);

  if (!open) return null;
  if (!mounted) return null;

  const hasBody = Boolean(consequences?.length) || needsTyping;

  return createPortal(
    <div
      ref={overlayRef}
      className={[styles.overlay, sheet && styles.sheet, scope.fontClassName].filter(Boolean).join(" ")}
      data-theme-scope={scope.id}
      data-theme={scope.mode === "dark" ? "dark" : undefined}
      role="presentation"
      onMouseDown={(event) => {
        // The overlay does not dismiss: a must-choose dialog waits for Cancel or the action.
        if (event.target === event.currentTarget) event.preventDefault();
      }}
    >
      <ModalCard
        {...rest}
        {...nisthaAttr("alertdialog", rest)}
        ref={setDialogRef}
        role="alertdialog"
        aria-modal="true"
        tabIndex={-1}
        title={title}
        description={description}
        eyebrow={eyebrow}
        tone={tone}
        size={size}
        className={cx(styles.dialog, className)}
        footerStart={footerStart}
        footer={
          sheet ? (
            // Stacked, not joined: ButtonGroup fuses its Buttons into one segmented row.
            <div role="group" aria-label={labels.dialogActions} className={styles.sheetActions}>
              <Button appearance="outline" mode="neutral" size="lg" onClick={onCancel} data-alert-cancel="">
                {cancelLabel}
              </Button>
              <Button appearance="solid" mode={actionVariant} size="lg" onClick={onAction} disabled={!matches}>
                {actionLabel}
              </Button>
            </div>
          ) : (
            <ButtonGroup ariaLabel={labels.dialogActions}>
              <Button appearance="outline" mode="neutral" size="sm" onClick={onCancel} data-alert-cancel="">
                {cancelLabel}
              </Button>
              <Button appearance="solid" mode={actionVariant} size="sm" onClick={onAction} disabled={!matches}>
                {actionLabel}
              </Button>
            </ButtonGroup>
          )
        }
      >
        {hasBody ? (
          <div className={styles.content}>
            {consequences?.length ? (
              <ul className={styles.consequences}>
                {consequences.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            {needsTyping ? (
              <Field
                label={`Type ${confirmText} to confirm`}
                htmlFor={confirmId}
                hint={matches ? undefined : `${actionLabel} turns on when this matches.`}
                error={mistyped ? `This does not match ${confirmText}.` : undefined}
              >
                <Input id={confirmId} size="sm" value={typed} onChange={setTyped} />
              </Field>
            ) : null}
          </div>
        ) : null}
      </ModalCard>
    </div>,
    document.body,
  );
}
