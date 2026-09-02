"use client";

import { CircleAlert, CircleCheck, Info, Minus, TriangleAlert, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ToastProps, ToastStatus } from "./Toast.types";
import styles from "./Toast.module.css";

export type { ToastProps, ToastSize, ToastStatus } from "./Toast.types";

const ICONS: Record<ToastStatus, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  default: Minus,
};

export function Toast({
  open = true,
  onOpenChange,
  title,
  description,
  status = "default",
  size = "md",
  duration = null,
  onClose,
  action,
  className = "",
}: ToastProps) {
  const titleId = useId();
  const descriptionId = useId();
  const timerRef = useRef<number | null>(null);
  const Icon = ICONS[status];

  function handleClose() {
    onClose?.();
    onOpenChange?.(false);
  }

  useEffect(() => {
    if (!open || duration == null || duration <= 0) return undefined;

    timerRef.current = window.setTimeout(() => {
      onClose?.();
      onOpenChange?.(false);
    }, duration);

    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [open, duration, onClose, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className={[styles.toast, styles[status], styles[size], className].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className={styles.header}>
        <div className={styles.lead}>
          <span className={styles.icon}>
            <Icon aria-hidden="true" size={20} strokeWidth={2} />
          </span>
          {title ? (
            <p id={titleId} className={styles.title}>
              {title}
            </p>
          ) : null}
        </div>
        {onClose || onOpenChange ? (
          <button type="button" className={styles.close} aria-label="Dismiss" onClick={handleClose}>
            <X aria-hidden="true" size={20} strokeWidth={2} />
          </button>
        ) : null}
      </div>
      {description ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
