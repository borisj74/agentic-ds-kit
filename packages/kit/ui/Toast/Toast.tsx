"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type FocusEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import type { ToastProps, ToastStatus } from "./Toast.types";
import styles from "./Toast.module.css";

export type { ToastProps, ToastStatus } from "./Toast.types";

const ICONS: Record<ToastStatus, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

const STACK_ID = "agentic-ds-kit-toasts";

function getStack(): HTMLElement {
  let el = document.getElementById(STACK_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = STACK_ID;
    document.body.appendChild(el);
  }
  el.className = styles.stack;
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  return el;
}

export function Toast(props: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!props.open || !mounted) return null;
  return createPortal(<ToastCard {...props} />, getStack());
}

function ToastCard({
  onClose,
  title,
  description,
  status = "info",
  actionLabel,
  onAction,
  duration: durationProp,
}: ToastProps) {
  const duration = durationProp === undefined ? 5000 : durationProp;
  const titleId = useId();
  const descriptionId = useId();
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);
  const onCloseRef = useRef(onClose);
  const Icon = ICONS[status];
  const isDanger = status === "danger";

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (duration == null || duration <= 0 || paused) return undefined;

    const started = Date.now();
    const timer = window.setTimeout(() => onCloseRef.current(), remaining.current);

    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(remaining.current - (Date.now() - started), 0);
    };
  }, [paused, duration]);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setPaused(false);
    }
  }

  function handleAction() {
    onAction?.();
    onClose();
  }

  return (
    <div
      className={[styles.toast, styles[status]].join(" ")}
      role={isDanger ? "alert" : "status"}
      aria-live={isDanger ? undefined : "polite"}
      aria-atomic="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={handleBlur}
    >
      {duration != null && duration > 0 ? (
        <span className={styles.bar} aria-hidden="true">
          <span
            className={`${styles.fill} ${paused ? styles.paused : ""}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </span>
      ) : null}
      <div className={styles.body}>
        <span className={styles.icon}>
          <Icon aria-hidden="true" size={20} strokeWidth={2} />
        </span>
        <div className={styles.content}>
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
          {actionLabel ? (
            <div className={styles.action}>
              <Button variant="tertiary" size="sm" onClick={handleAction}>
                {actionLabel}
              </Button>
            </div>
          ) : null}
        </div>
        <Button variant="tertiary" size="sm" iconStart="X" ariaLabel="Dismiss" onClick={onClose} />
      </div>
    </div>
  );
}
