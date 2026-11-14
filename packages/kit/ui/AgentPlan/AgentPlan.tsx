"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ChevronDown, CircleCheck, CirclePause, CircleX, ClipboardList } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Empty } from "../Empty";
import { Field } from "../Field";
import { Input } from "../Input";
import { Skeleton } from "../Skeleton";
import { Spinner } from "../Spinner";
import { Textarea } from "../Textarea";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { AgentPlanProps, AgentPlanStatus, AgentPlanStep } from "./AgentPlan.types";
import styles from "./AgentPlan.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { AgentPlanProps, AgentPlanStatus, AgentPlanStep } from "./AgentPlan.types";

type RowState = "numbered" | "done" | "current" | "failed" | "pending";

const STATUS_BADGE: Record<AgentPlanStatus, { label: string; tone: "neutral" | "primary" | "success" | "danger" }> = {
  drafting: { label: "Drafting", tone: "neutral" },
  draft: { label: "Draft", tone: "neutral" },
  accepted: { label: "Accepted", tone: "primary" },
  running: { label: "Running", tone: "primary" },
  complete: { label: "Complete", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function rowState(status: AgentPlanStatus, index: number, currentIndex: number): RowState {
  if (status === "complete") return "done";
  if (status === "running" || status === "failed") {
    if (currentIndex === -1) return "numbered";
    if (index < currentIndex) return "done";
    if (index === currentIndex) return status === "failed" ? "failed" : "current";
    return "pending";
  }
  return "numbered";
}

function defaultSummary(status: AgentPlanStatus, steps: AgentPlanStep[], currentIndex: number): string {
  if (status === "drafting") return "reading the task";
  const total = plural(steps.length, "step");
  if (status === "complete") return `${total} · all done`;
  if (status === "running" || status === "failed") {
    const done = Math.max(0, currentIndex);
    const current = steps[currentIndex];
    const tail = status === "failed" ? "1 failed" : current?.needsApproval ? "1 waiting" : "1 running";
    return `${total} · ${done} done · ${tail}`;
  }
  const approvals = steps.filter((step) => step.needsApproval).length;
  return approvals ? `${total} · ${approvals} need approval` : total;
}

function Marker({ state, index }: { state: RowState; index: number }) {
  if (state === "done") return <CircleCheck size={20} strokeWidth={ICON_STROKE} className={styles.markDone} aria-hidden="true" />;
  if (state === "failed") return <CircleX size={20} strokeWidth={ICON_STROKE} className={styles.markFailed} aria-hidden="true" />;
  return (
    <span className={cx(styles.number, state === "current" && styles.numberCurrent)} aria-hidden="true">
      {index + 1}
    </span>
  );
}

function StepForm({
  step,
  index,
  onSave,
  onCancel,
}: {
  step: AgentPlanStep;
  index: number;
  onSave: (step: AgentPlanStep) => void;
  onCancel: () => void;
}) {
  const base = useId();
  const [label, setLabel] = useState(step.label);
  const [tool, setTool] = useState(step.tool ?? "");
  const [note, setNote] = useState(step.note ?? "");
  const [needsApproval, setNeedsApproval] = useState(Boolean(step.needsApproval));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    onSave({ ...step, label: label.trim(), tool: tool.trim() || undefined, note: note.trim() || undefined, needsApproval });
  }

  return (
    <form
      className={styles.form}
      onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onCancel();
        }
      }}
      aria-label={`Edit step ${index + 1}`}
    >
      <span className={styles.number} aria-hidden="true">
        {index + 1}
      </span>
      <div className={styles.formFields}>
        <Field label="Step" htmlFor={`${base}-label`}>
          <Input id={`${base}-label`} size="sm" value={label} onChange={setLabel} autoFocus />
        </Field>
        <Field label="Tool" htmlFor={`${base}-tool`}>
          <Input id={`${base}-tool`} size="sm" value={tool} onChange={setTool} className={styles.monoField} />
        </Field>
        <Field label="Note" htmlFor={`${base}-note`}>
          <Textarea id={`${base}-note`} size="sm" rows={2} value={note} onChange={setNote} />
        </Field>
        <Checkbox
          id={`${base}-approval`}
          size="sm"
          label="Needs approval before it runs"
          checked={needsApproval}
          onChange={setNeedsApproval}
        />
        <div className={styles.formActions}>
          <Button size="sm" appearance="ghost" mode="neutral" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" appearance="outline" mode="neutral" type="submit" shortcut="⏎">
            Save step
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * What the agent intends to do, before or during a run. People accept, edit or skip steps.
 * AgentTrail shows what already happened.
 */
export function AgentPlan({
  title,
  steps,
  status = "draft",
  currentStepId,
  summary,
  footerNote,
  waitingLabel = "Waiting for your OK",
  editable = true,
  onChange,
  onAccept,
  onRun,
  onEdit,
  onSkipStep,
  onStop,
  onRetryStep,
  onViewTrail,
  onDraft,
  collapsed = false,
  onCollapsedChange,
  className,
  ref,
  ...rest
}: AgentPlanProps) {
  const titleId = useId();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  // After the step form closes, focus goes back to the control that opened it.
  const returnFocus = useRef<string | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const setReturnFocus = (key: string) => {
    returnFocus.current = key;
  };

  useEffect(() => {
    const key = returnFocus.current;
    if (!key) return;
    returnFocus.current = null;
    rootRef.current?.querySelector<HTMLElement>(`[data-plan-focus="${CSS.escape(key)}"]`)?.focus();
  });
  const currentIndex = currentStepId ? steps.findIndex((step) => step.id === currentStepId) : -1;
  const canEdit = status === "draft" && editable && Boolean(onChange);
  const line = summary ?? defaultSummary(status, steps, currentIndex);
  const badge = STATUS_BADGE[status];
  const empty = status === "draft" && steps.length === 0 && !adding;

  if (collapsed) {
    return (
      <section {...rest} {...nisthaAttr("agentplan", rest)} ref={ref} className={cx(styles.collapsed, className)} aria-labelledby={titleId}>
        <ClipboardList size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        <span className={styles.collapsedSummary}>· {line}</span>
        <Badge tone={badge.tone} size="sm">
          {badge.label}
        </Badge>
        {onCollapsedChange ? (
          <button
            type="button"
            className={styles.expand}
            aria-expanded="false"
            aria-label={`Show plan: ${title}`}
            onClick={() => onCollapsedChange(false)}
          >
            <ChevronDown size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
        ) : null}
      </section>
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey) || editingId || adding) return;
    if (status === "draft" && onAccept && steps.length > 0) {
      event.preventDefault();
      onAccept();
    } else if (status === "accepted" && onRun) {
      event.preventDefault();
      onRun();
    }
  }

  function saveStep(next: AgentPlanStep) {
    onChange?.(steps.map((step) => (step.id === next.id ? next : step)));
    setEditingId(null);
    setReturnFocus(`edit-${next.id}`);
  }

  function addStep(next: AgentPlanStep) {
    onChange?.([...steps, next]);
    setAdding(null);
    setReturnFocus("add");
  }

  const current = steps[currentIndex];

  return (
    <section
      {...rest} {...nisthaAttr("agentplan", rest)}
      ref={mergeRefs(rootRef, ref)}
      className={cx(styles.plan, className)}
      aria-labelledby={titleId}
      aria-busy={status === "drafting" || undefined}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <ClipboardList size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          <Badge tone={badge.tone} size="sm">
            {badge.label}
          </Badge>
          {onCollapsedChange ? (
            <button
              type="button"
              className={cx(styles.expand, styles.expandOpen)}
              aria-expanded="true"
              aria-label={`Hide plan: ${title}`}
              onClick={() => onCollapsedChange(true)}
            >
              <ChevronDown size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <p className={styles.summary}>{line}</p>
      </header>

      {status === "drafting" ? (
        <div className={styles.loading}>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className={styles.skeletonRow}>
              <Skeleton shape="circle" size="sm" />
              <div className={styles.skeletonText}>
                <Skeleton width={row % 2 ? "60%" : "85%"} />
                <Skeleton width="45%" size="sm" />
              </div>
            </div>
          ))}
        </div>
      ) : empty ? (
        <Empty
          icon="ClipboardList"
          title="No plan yet"
          description="Describe the task and the agent drafts steps you can edit before it runs."
          actions={
            onDraft ? (
              <Button size="sm" appearance="outline" mode="neutral" iconStart="Plus" onClick={onDraft}>
                Draft a plan
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ol className={styles.steps}>
          {steps.map((step, index) => {
            if (editingId === step.id) {
              return (
                <li key={step.id} className={styles.editing}>
                  <StepForm step={step} index={index} onSave={saveStep} onCancel={() => {
                      setEditingId(null);
                      setReturnFocus(`edit-${step.id}`);
                    }} />
                </li>
              );
            }
            const state = rowState(status, index, currentIndex);
            const waiting = state === "current" && step.needsApproval;
            return (
              <li
                key={step.id}
                className={cx(styles.step, styles[state])}
                aria-current={state === "current" || state === "failed" ? "step" : undefined}
              >
                <span key={state} className={styles.marker}>
                  <Marker state={state} index={index} />
                </span>
                <div className={styles.stepBody}>
                  <div className={styles.stepRow}>
                    <span className={styles.label}>{step.label}</span>
                    {step.needsApproval && state !== "done" ? (
                      <Badge tone="warning" size="sm" className={styles.approval}>
                        Approval
                      </Badge>
                    ) : null}
                    {canEdit ? (
                      <span className={styles.rowActions}>
                        <Button
                          size="sm"
                          appearance="ghost"
                          mode="neutral"
                          iconStart="Pencil"
                          data-plan-focus={`edit-${step.id}`}
                          ariaLabel={`Edit step ${index + 1}: ${step.label}`}
                          onClick={() => {
                            setAdding(null);
                            setEditingId(step.id);
                          }}
                        />
                        <Button
                          size="sm"
                          appearance="ghost"
                          mode="neutral"
                          iconStart="X"
                          ariaLabel={`Remove step ${index + 1}: ${step.label}`}
                          onClick={() => onChange?.(steps.filter((item) => item.id !== step.id))}
                        />
                      </span>
                    ) : null}
                  </div>
                  {step.tool || step.target ? (
                    <p className={styles.detail}>
                      {step.tool ? <span className={styles.tool}>{step.tool}</span> : null}
                      {step.tool && step.target ? <span aria-hidden="true">·</span> : null}
                      {step.target ? <span>{step.target}</span> : null}
                    </p>
                  ) : null}
                  {waiting ? (
                    <p className={styles.waiting}>
                      <CirclePause size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                      {waitingLabel}
                    </p>
                  ) : null}
                  {state === "failed" && step.error ? <p className={styles.error}>{step.error}</p> : null}
                </div>
              </li>
            );
          })}
          {adding ? (
            <li className={styles.editing}>
              <StepForm
                step={{ id: adding, label: "" }}
                index={steps.length}
                onSave={addStep}
                onCancel={() => {
                  setAdding(null);
                  setReturnFocus("add");
                }}
              />
            </li>
          ) : null}
        </ol>
      )}

      {status !== "drafting" && !empty ? (
        <footer className={styles.footer}>
          {status === "draft" ? (
            <>
              {canEdit ? (
                <Button
                  size="sm"
                  appearance="ghost"
                  mode="neutral"
                  iconStart="Plus"
                  data-plan-focus="add"
                  onClick={() => {
                    setEditingId(null);
                    setAdding(`step-${steps.length + 1}-${Date.now().toString(36)}`);
                  }}
                >
                  Add step
                </Button>
              ) : footerNote ? (
                <span className={styles.note}>{footerNote}</span>
              ) : (
                <span />
              )}
              {onAccept ? (
                <Button size="md" shortcut="⌘⏎" aria-keyshortcuts="Meta+Enter Control+Enter" onClick={onAccept}>
                  Accept plan
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <span className={styles.note}>{footerNote}</span>
              <span className={styles.footerActions}>
                {status === "accepted" ? (
                  <>
                    {onEdit ? (
                      <Button size="sm" appearance="ghost" mode="neutral" iconStart="Pencil" onClick={onEdit}>
                        Edit
                      </Button>
                    ) : null}
                    {onRun ? (
                      <Button
                        size="md"
                        appearance="outline"
                        mode="neutral"
                        iconStart="ArrowRight"
                        shortcut="⌘⏎"
                        aria-keyshortcuts="Meta+Enter Control+Enter"
                        onClick={onRun}
                      >
                        Run
                      </Button>
                    ) : null}
                  </>
                ) : null}
                {(status === "running" || status === "failed") && current && onSkipStep ? (
                  <Button size="sm" appearance="ghost" mode="neutral" iconStart="SkipForward" onClick={() => onSkipStep(current.id)}>
                    Skip step
                  </Button>
                ) : null}
                {status === "running" && onStop ? (
                  <Button size="md" appearance="outline" mode="neutral" iconStart="Square" onClick={onStop}>
                    Stop
                  </Button>
                ) : null}
                {status === "failed" && current && onRetryStep ? (
                  <Button size="md" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={() => onRetryStep(current.id)}>
                    Retry step
                  </Button>
                ) : null}
                {status === "complete" && onViewTrail ? (
                  <Button size="sm" appearance="ghost" mode="neutral" iconStart="ArrowRight" onClick={onViewTrail}>
                    View trail
                  </Button>
                ) : null}
              </span>
            </>
          )}
        </footer>
      ) : null}

      {status === "drafting" ? (
        <footer className={styles.footer}>
          <Spinner size="sm" label="Drafting plan…" className={styles.drafting} />
        </footer>
      ) : null}
    </section>
  );
}
