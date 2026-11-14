"use client";

import { useId, useRef, useState } from "react";
import { CircleHelp, FlaskConical } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { AlertDialog } from "../AlertDialog";
import { Badge } from "../Badge";
import type { BadgeTone } from "../Badge/Badge.types";
import { Button } from "../Button";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { ExperimentCardProps, ExperimentVariant } from "./ExperimentCard.types";
import styles from "./ExperimentCard.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ExperimentCardProps, ExperimentVariant, ExperimentStatus } from "./ExperimentCard.types";

const LETTERS = "ABCDEFGHIJ";

/**
 * A compact A/B or A/B/n experiment: status in words, the traffic split and metric per variant, a confidence
 * note and one decision. Ship and Stop confirm with a kit AlertDialog. The winner is a word badge, not colour alone.
 */
export function ExperimentCard({
  name,
  metricLabel,
  status,
  variants,
  dates,
  confidenceNote,
  onView,
  onShip,
  onStop,
  onStart,
  onEdit,
  onExtend,
  extendLabel = "Extend 7 days",
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: ExperimentCardProps) {
  const titleId = useId();
  const [confirm, setConfirm] = useState<"ship" | "stop" | null>(null);
  const shipRef = useRef<HTMLButtonElement>(null);
  const stopRef = useRef<HTMLButtonElement>(null);
  const winnerIndex = variants.findIndex((variant) => variant.isWinner);
  const winner = winnerIndex >= 0 ? variants[winnerIndex] : undefined;
  const inconclusive = status === "concluded" && !winner;
  const badge: { tone: BadgeTone; label: string } =
    status === "running"
      ? { tone: "info", label: "Running" }
      : status === "draft"
        ? { tone: "neutral", label: "Draft" }
        : status === "stopped"
          ? { tone: "neutral", label: "Stopped" }
          : inconclusive
            ? { tone: "warning", label: "Inconclusive" }
            : { tone: "success", label: "Concluded" };

  const closeConfirm = () => {
    const back = confirm === "ship" ? shipRef.current : stopRef.current;
    setConfirm(null);
    requestAnimationFrame(() => back?.focus());
  };

  if (loading) {
    return (
      <article {...rest} {...nisthaAttr("experimentcard", rest)} ref={ref} className={cx(styles.card, className)} aria-busy="true" aria-label={name}>
        <div className={styles.loadingHead}>
          <Skeleton width="50%" />
          <Skeleton width="20%" />
        </div>
        <Skeleton shape="rect" width="100%" height="var(--space-12)" />
        <Skeleton shape="rect" width="100%" height="var(--space-12)" />
      </article>
    );
  }

  const winnerLetter = winner ? LETTERS[winnerIndex] : "";

  return (
    <article {...rest} {...nisthaAttr("experimentcard", rest)} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId}>
      <header className={styles.header}>
        <FlaskConical size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.headerIcon} />
        <h3 id={titleId} className={styles.title}>
          {name}
        </h3>
        {!error ? (
          <Badge tone={badge.tone} size="sm">
            {badge.label}
          </Badge>
        ) : null}
      </header>

      {error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : (
        <>
          <div className={styles.meta}>
            <span className={styles.metric}>{metricLabel}</span>
            {dates ? <span className={styles.dates}>{dates}</span> : null}
          </div>

          <ul className={styles.variants} aria-label={`${metricLabel} by variant`}>
            {variants.map((variant, index) => (
              <VariantRow key={variant.id} variant={variant} letter={LETTERS[index] ?? String(index + 1)} running={status === "running"} />
            ))}
          </ul>

          {confidenceNote ? (
            <p className={styles.note}>
              <CircleHelp size={14} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.noteIcon} />
              {confidenceNote}
            </p>
          ) : null}

          <footer className={styles.footer}>
            {status === "running" ? (
              <>
                {onStop ? (
                  <Button ref={stopRef} size="sm" appearance="outline" mode="danger" iconStart="Square" onClick={() => setConfirm("stop")}>
                    Stop
                  </Button>
                ) : null}
                <span className={styles.spacer} />
                {onView ? (
                  <Button size="sm" appearance="outline" mode="neutral" onClick={onView}>
                    View
                  </Button>
                ) : null}
              </>
            ) : status === "draft" ? (
              <>
                {onEdit ? (
                  <Button size="sm" appearance="ghost" mode="neutral" onClick={onEdit}>
                    Edit
                  </Button>
                ) : null}
                <span className={styles.spacer} />
                {onStart ? (
                  <Button size="sm" appearance="outline" mode="neutral" iconStart="Play" onClick={onStart}>
                    Start
                  </Button>
                ) : null}
              </>
            ) : status === "concluded" ? (
              <>
                {onView ? (
                  <Button size="sm" appearance="ghost" mode="neutral" onClick={onView}>
                    View
                  </Button>
                ) : null}
                <span className={styles.spacer} />
                {winner && onShip ? (
                  <Button ref={shipRef} size="sm" onClick={() => setConfirm("ship")}>
                    Ship winner
                  </Button>
                ) : inconclusive && onExtend ? (
                  <Button size="sm" appearance="outline" mode="neutral" onClick={onExtend}>
                    {extendLabel}
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <span className={styles.spacer} />
                {onView ? (
                  <Button size="sm" appearance="outline" mode="neutral" onClick={onView}>
                    View
                  </Button>
                ) : null}
              </>
            )}
          </footer>
        </>
      )}

      {winner && onShip ? (
        <AlertDialog
          open={confirm === "ship"}
          title={`Ship variant ${winnerLetter} to everyone?`}
          description={`The experiment ends and all traffic gets ${winner.label}. You can roll back from Releases.`}
          cancelLabel="Cancel"
          actionLabel={`Ship ${winnerLetter}`}
          onCancel={closeConfirm}
          onAction={() => {
            setConfirm(null);
            onShip(winner.id);
          }}
        />
      ) : null}
      {onStop ? (
        <AlertDialog
          open={confirm === "stop"}
          title={`Stop “${name}”?`}
          description="Traffic goes back to the control and the results so far are kept. You can't resume a stopped experiment."
          cancelLabel="Keep running"
          actionLabel="Stop experiment"
          actionVariant="danger"
          onCancel={closeConfirm}
          onAction={() => {
            setConfirm(null);
            onStop();
          }}
        />
      ) : null}
    </article>
  );
}

function VariantRow({ variant, letter, running }: { variant: ExperimentVariant; letter: string; running: boolean }) {
  return (
    <li className={cx(styles.variant, variant.isWinner && styles.variantWinner)}>
      <span className={styles.letter} aria-hidden="true">
        {letter}
      </span>
      <span className={styles.variantText}>
        <span className={styles.variantLabel}>
          <span className={styles.srOnly}>Variant {letter}: </span>
          {variant.label}
          {variant.isWinner ? (
            <Badge tone="success" size="sm">
              Winner
            </Badge>
          ) : variant.isLeading && running ? (
            <Badge tone="neutral" size="sm" appearance="outline">
              Leading
            </Badge>
          ) : null}
        </span>
        <span className={styles.traffic}>{variant.traffic}% of traffic</span>
      </span>
      <span className={styles.value}>
        {variant.value ?? (
          <>
            <span aria-hidden="true">–</span>
            <span className={styles.srOnly}>no data yet</span>
          </>
        )}
      </span>
    </li>
  );
}
