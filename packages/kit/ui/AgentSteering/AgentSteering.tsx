"use client";

import { useId, useState, type FormEvent } from "react";
import { Bot, CircleCheck, CircleX, Square } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { AlertDialog } from "../AlertDialog";
import { Button } from "../Button";
import { Input } from "../Input";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { AgentSteeringProps, AgentSteeringStatus } from "./AgentSteering.types";
import styles from "./AgentSteering.module.css";

export type { AgentSteeringProps, AgentSteeringStatus } from "./AgentSteering.types";

const STATUS_LABEL: Record<AgentSteeringStatus, string> = {
  running: "Running",
  paused: "Paused",
  stopped: "Stopped",
  done: "Done",
};

/** Redirect, pause or stop an agent while it runs. Not DecisionCard (the agent asks) or AgentPlan (before the run). */
export function AgentSteering({
  name,
  meta,
  status = "running",
  elapsed,
  value = "",
  onValueChange,
  onSteer,
  sendAppearance = "solid",
  sending = false,
  applied,
  error,
  onRetry,
  suggestions = [],
  onPause,
  onResume,
  onStop,
  stopConfirm,
  stoppedNote,
  onOpenTrail,
  loading = false,
  className,
  ref,
  ...rest
}: AgentSteeringProps) {
  const nameId = useId();
  const inputId = useId();
  const [confirming, setConfirming] = useState(false);
  const finished = status === "done";

  const header = (
    <header className={styles.header}>
      <span className={styles.lead} aria-hidden="true">
        <Bot size={16} strokeWidth={ICON_STROKE} />
      </span>
      <div className={styles.heading}>
        <h3 id={nameId} className={styles.name}>
          {name}
        </h3>
        {meta ? <p className={styles.meta}>{meta}</p> : null}
      </div>
      <span className={cx(styles.status, styles[`status-${status}`])}>
        <span className={styles.dot} aria-hidden="true" />
        {STATUS_LABEL[status]}
      </span>
      {elapsed ? (
        <span className={styles.elapsed} role="timer" aria-live="off">
          {elapsed}
        </span>
      ) : null}
    </header>
  );

  if (loading) {
    return (
      <section {...rest} ref={ref} className={cx(styles.card, className)} aria-busy="true" aria-label={`${name}, loading`}>
        <div className={styles.header}>
          <Skeleton shape="circle" size="md" />
          <div className={styles.heading}>
            <Skeleton width="45%" />
            <Skeleton width="30%" size="sm" />
          </div>
        </div>
        <Skeleton shape="rect" width="100%" height="var(--space-10)" />
      </section>
    );
  }

  if (status === "stopped") {
    return (
      <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={nameId}>
        {header}
        {stoppedNote ? (
          <p className={styles.stopped}>
            <Square size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
            {stoppedNote}
          </p>
        ) : null}
        {onOpenTrail ? (
          <div>
            <Button size="sm" appearance="ghost" mode="neutral" iconStart="ArrowRight" onClick={onOpenTrail}>
              Open trail
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text || sending || finished) return;
    onSteer?.(text);
  }

  function stop() {
    if (stopConfirm) setConfirming(true);
    else onStop?.();
  }

  const placeholder = finished
    ? "Run finished · steering is off"
    : status === "paused"
      ? "Add a note before resuming…"
      : applied
        ? "Steer again…"
        : "Steer: e.g. focus on refunds";

  return (
    <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={nameId} aria-busy={sending || undefined}>
      {header}

      {applied && !error ? (
        <p className={styles.applied} role="status">
          <CircleCheck size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          Steering applied · {applied}
        </p>
      ) : null}

      <form className={styles.composer} onSubmit={submit}>
        <Input
          id={inputId}
          className={styles.input}
          iconStart="Compass"
          ariaLabel={`Steer ${name}`}
          placeholder={placeholder}
          value={value}
          disabled={finished || sending}
          onChange={(next) => onValueChange?.(next)}
        />
        <Button
          type="submit"
          appearance={sendAppearance}
          mode="primary"
          iconStart={sending ? "LoaderCircle" : "Send"}
          ariaLabel={sending ? "Sending steer" : "Send steer"}
          className={sending ? styles.spin : undefined}
          disabled={finished || (!value.trim() && !sending)}
        />
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.errorText}>{error}</span>
          {onRetry ? (
            <button type="button" className={styles.retry} onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </p>
      ) : null}

      {suggestions.length && status === "running" && !applied ? (
        <ul className={styles.suggestions} aria-label="Quick steers">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                className={styles.chip}
                disabled={finished || sending}
                onClick={() => onValueChange?.(suggestion)}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {suggestions.length && finished ? (
        <ul className={styles.suggestions} aria-hidden="true">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <span className={cx(styles.chip, styles.chipOff)}>{suggestion}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <footer className={styles.footer}>
        {status === "paused" ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="Play" onClick={onResume}>
            Resume
          </Button>
        ) : (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="Pause" disabled={finished} onClick={onPause}>
            Pause
          </Button>
        )}
        <Button size="sm" appearance="outline" mode="danger" iconStart="Square" disabled={finished} onClick={stop}>
          Stop
        </Button>
        <span className={styles.hint} aria-hidden="true">
          steer with ⏎
        </span>
      </footer>

      {stopConfirm ? (
        <AlertDialog
          open={confirming}
          title={stopConfirm.title}
          description={stopConfirm.description}
          cancelLabel="Keep running"
          actionLabel="Stop run"
          actionVariant="danger"
          onCancel={() => setConfirming(false)}
          onAction={() => {
            setConfirming(false);
            onStop?.();
          }}
        />
      ) : null}
    </section>
  );
}
