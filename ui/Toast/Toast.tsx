"use client";

import { CircleAlert, Check, Info, Minus, TriangleAlert, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ToastProps, ToastStatus } from "./Toast.types";
import styles from "./Toast.module.css";

export type { ToastProps, ToastSize, ToastStatus } from "./Toast.types";

function StatusIcon({ status }: { status: ToastStatus }) {
  if (status === "success") return <Check aria-hidden="true" size={15} />;
  if (status === "warning") return <TriangleAlert aria-hidden="true" size={15} />;
  if (status === "danger") return <CircleAlert aria-hidden="true" size={15} />;
  if (status === "info") return <Info aria-hidden="true" size={15} />;
  return <Minus aria-hidden="true" size={15} />;
}

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
      className={`${styles.toast} ${styles[status]} ${styles[size]} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      <span className={styles.icon}>
        <StatusIcon status={status} />
      </span>
      <div className={styles.content}>
        {title ? (
          <p id={titleId} className={styles.title}>
            {title}
          </p>
        ) : null}
        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
      {onClose || onOpenChange ? (
        <button type="button" className={styles.close} aria-label="Dismiss" onClick={handleClose}>
          <X aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
}
