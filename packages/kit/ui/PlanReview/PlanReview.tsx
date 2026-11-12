"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AgentPlan } from "../AgentPlan";
import { Alert } from "../Alert";
import { AUTONOMY_STOPS, AutonomyDial } from "../AutonomyDial";
import { Button } from "../Button";
import { ChangeSummary } from "../ChangeSummary";
import { Field } from "../Field";
import { Textarea } from "../Textarea";
import { cx } from "../shared/cx";
import { DECISION_COPY, approveHint, planLead } from "./planReview.logic";
import type { PlanReviewProps } from "./PlanReview.types";
import styles from "./PlanReview.module.css";

export type { PlanReviewProps, PlanReviewDecision, PlanReviewApproval } from "./PlanReview.types";

/**
 * Block: approve an agent's plan before it runs. The steps (AgentPlan, editable while pending),
 * what the plan expects to change (ChangeSummary), how far the agent may go without asking
 * (AutonomyDial), and one decision: Approve plan (the one solid primary), Request changes with
 * a note, or Reject.
 */
export function PlanReview(props: PlanReviewProps) {
  const {
    planTitle,
    steps,
    onStepsChange,
    agent,
    target,
    changes,
    changesTitle = "What the plan changes",
    changesPeriod,
    autonomy: autonomyProp,
    defaultAutonomy = "risk",
    onAutonomyChange,
    autonomyOptions = AUTONOMY_STOPS,
    decision = "pending",
    decisionNote,
    onApprove,
    onRequestChanges,
    onReject,
    title = "Plan review",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const decisionId = useId();
  const hintId = useId();
  const noteId = useId();
  const [innerAutonomy, setInnerAutonomy] = useState(defaultAutonomy);
  const autonomy = autonomyProp ?? innerAutonomy;
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<HTMLButtonElement>(null);
  const pending = decision === "pending";

  function changeAutonomy(next: string) {
    if (autonomyProp === undefined) setInnerAutonomy(next);
    onAutonomyChange?.(next);
  }

  function openNote() {
    setNoteOpen(true);
    // The field mounts on this render; focus it on the next frame.
    requestAnimationFrame(() => noteRef.current?.focus());
  }

  function closeNote() {
    setNoteOpen(false);
    setNote("");
    requestAnimationFrame(() => requestRef.current?.focus());
  }

  function sendNote() {
    const text = note.trim();
    if (!text) return;
    onRequestChanges?.(text);
    setNoteOpen(false);
    setNote("");
  }

  function noteKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeNote();
    } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      sendNote();
    }
  }

  const outcome = pending ? null : DECISION_COPY[decision];

  return (
    <section {...rest} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.lead}>{planLead(steps, agent, target)}</p>
      </header>

      <div className={cx("layout-split--primary", styles.columns)}>
        <AgentPlan
          className={styles.plan}
          title={planTitle}
          steps={steps}
          status={decision === "approved" ? "accepted" : "draft"}
          editable={pending}
          onChange={pending ? onStepsChange : undefined}
        />
        <div className={styles.side}>
          {changes ? <ChangeSummary className={styles.changes} title={changesTitle} period={changesPeriod} items={changes} /> : null}
          <AutonomyDial
            value={autonomy}
            onValueChange={changeAutonomy}
            options={autonomyOptions}
            appliesTo={[agent, target].filter(Boolean).join(" · ") || undefined}
            disabled={!pending}
            disabledReason={pending ? undefined : "Set when the plan was decided"}
          />
        </div>
      </div>

      <section className={styles.decision} aria-labelledby={decisionId}>
        <h3 id={decisionId} className={styles.subtitle}>
          Your decision
        </h3>
        {outcome ? (
          <Alert variant={outcome.variant} title={outcome.title}>
            {decisionNote ?? approveHint(steps, autonomy, autonomyOptions)}
          </Alert>
        ) : (
          <>
            {noteOpen ? (
              <p id={hintId} className={styles.hint}>
                {approveHint(steps, autonomy, autonomyOptions)}
              </p>
            ) : null}
            {noteOpen ? (
              <div className={styles.note} onKeyDown={noteKeys}>
                <Field label="What should change?" htmlFor={noteId} hint="The agent revises the plan and asks again.">
                  <Textarea
                    id={noteId}
                    ref={noteRef}
                    rows={3}
                    value={note}
                    onChange={setNote}
                    placeholder="e.g. Keep the limit per API key, not per IP."
                  />
                </Field>
                <div className={styles.actions}>
                  <Button size="md" appearance="ghost" mode="neutral" shortcut="Esc" aria-keyshortcuts="Escape" onClick={closeNote}>
                    Cancel
                  </Button>
                  <Button
                    size="md"
                    appearance="outline"
                    mode="neutral"
                    shortcut="⌘⏎"
                    aria-keyshortcuts="Meta+Enter Control+Enter"
                    disabled={!note.trim()}
                    onClick={sendNote}
                  >
                    Send request
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.row}>
                <p id={hintId} className={styles.hint}>
                  {approveHint(steps, autonomy, autonomyOptions)}
                </p>
                <div className={styles.actions}>
                  {onReject ? (
                    <Button size="md" appearance="outline" mode="danger" iconStart="X" onClick={onReject}>
                      Reject
                    </Button>
                  ) : null}
                  {onRequestChanges ? (
                    <Button ref={requestRef} size="md" appearance="outline" mode="neutral" iconStart="MessageSquare" onClick={openNote}>
                      Request changes
                    </Button>
                  ) : null}
                  {onApprove ? (
                    <Button
                      size="md"
                      iconStart="Check"
                      aria-describedby={hintId}
                      disabled={steps.length === 0}
                      onClick={() => onApprove({ autonomy, steps })}
                    >
                      Approve plan
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </section>
  );
}
