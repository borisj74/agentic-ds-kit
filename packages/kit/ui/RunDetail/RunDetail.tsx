"use client";

import { useId, useMemo, useState } from "react";
import { AgentMonitor } from "../AgentMonitor";
import { AgentTrail } from "../AgentTrail";
import { AgentTree } from "../AgentTree";
import { Chat } from "../Chat";
import { Empty } from "../Empty";
import { ToolCallCard } from "../ToolCallCard";
import { TraceWaterfall } from "../TraceWaterfall";
import type { TraceStatus } from "../TraceWaterfall/TraceWaterfall.types";
import { cx } from "../shared/cx";
import {
  agentForStep,
  failedStepForAgent,
  lastFailedStep,
  monitorSteps,
  runSummary,
  startedSteps,
  stepForAgent,
  toolCallFor,
  trailSteps,
} from "./runDetail.logic";
import type { RunDetailRun } from "./RunDetail.types";
import type { RunDetailProps } from "./RunDetail.types";
import styles from "./RunDetail.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { RunDetailCalls, RunDetailProps, RunDetailRun, RunDetailStep, RunDetailStepStatus } from "./RunDetail.types";

function traceStatus(status: RunDetailRun["status"]): TraceStatus {
  if (status === "failed") return "failed";
  return status === "done" || status === "idle" ? "complete" : "running";
}

/**
 * Block: one agent run on one screen. AgentMonitor (clock, cost, step strip, pending approval),
 * the selected step's ToolCallCard, AgentTree (who started whom) and AgentTrail (the step log),
 * all on one selected step. With messages or onSend, an Ask panel (kit Chat) to ask or steer the
 * agent sits under the trail; it replaces LiveSession.
 */
export function RunDetail(props: RunDetailProps) {
  const {
    run,
    steps,
    agents,
    selectedStepId: selectedProp,
    defaultSelectedStepId = null,
    onSelectStep,
    onApprove,
    onDeny,
    onPause,
    onResume,
    onCancel,
    onStop,
    onRetry,
    calls = "selected",
    trace,
    messages,
    onSend,
    thinking = false,
    title = "Run detail",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const callId = useId();
  const askId = useId();
  const showAsk = messages !== undefined || onSend !== undefined;
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelectedStepId);
  const selectedId = selectedProp !== undefined ? selectedProp : innerSelected;

  const all = calls === "all";
  const strip = useMemo(() => (trace ? [] : monitorSteps(steps)), [steps, trace]);
  const trail = useMemo(() => trailSteps(steps, all), [steps, all]);
  const selected = selectedId ? steps.find((step) => step.id === selectedId) : undefined;
  const call = toolCallFor(selected);
  const selectedAgent = agentForStep(steps, selectedId, agents);
  const failedId = lastFailedStep(steps);

  function select(next: string | null) {
    if (selectedProp === undefined) setInnerSelected(next);
    onSelectStep?.(next);
  }

  const retry = onRetry ? (id: string) => onRetry(id) : undefined;
  const cardId = (stepId: string) => `${callId}-${stepId}`;
  // calls="all": picking a step in the trail brings its call into view.
  function selectAndShow(next: string | null) {
    select(next);
    if (next) document.getElementById(cardId(next))?.scrollIntoView({ block: "nearest" });
  }

  const traceNode = trace ? (
    <TraceWaterfall className={styles.trace} title="Run trace" spans={trace} status={traceStatus(run.status)} compact />
  ) : null;

  if (all) {
    const started = startedSteps(steps);
    const done = run.status === "done";
    return (
      <section {...rest} {...nisthaAttr("rundetail", rest)} ref={ref} className={cx(styles.root, styles.all, className)} aria-labelledby={titleId}>
        {/* The page's PageHeader names the run on screen; the block keeps its heading for screen readers. */}
        <header className={styles.srOnly}>
          <h2 id={titleId}>{title}</h2>
          <p>{runSummary(steps)}</p>
        </header>
        <AgentMonitor
          collapsed
          className={styles.monitor}
          name={run.name}
          status={run.status}
          headline={run.headline}
          elapsed={run.elapsed}
          cost={run.cost}
          onPause={onPause}
          onResume={onResume}
          onCancel={onCancel}
          onStop={onStop}
        />
        <div className={cx("layout-split--secondary", styles.split)}>
          <div className={styles.column}>
            {agents ? (
              <AgentTree
                root={agents}
                label="Agents"
                selectedId={selectedAgent}
                onSelect={(agentId) => {
                  const next = stepForAgent(steps, agentId);
                  selectAndShow(next === selectedId ? null : next);
                }}
                onApprove={onApprove ? () => onApprove() : undefined}
              />
            ) : null}
            <AgentTrail title="Steps" tag={run.tag} steps={trail} selectedStepId={selectedId} onSelectStep={selectAndShow} />
            {traceNode}
          </div>
          <section className={cx(styles.column, styles.calls)} aria-label="Tool calls">
            {started.map((step) => {
              const props = toolCallFor(step);
              if (!props) return null;
              return (
                <ToolCallCard
                  key={`${step.id}-${done ? "done" : "open"}`}
                  id={cardId(step.id)}
                  {...props}
                  defaultExpanded={!done}
                  onRetry={retry && step.status === "failed" ? () => retry(step.id) : undefined}
                />
              );
            })}
          </section>
        </div>
      </section>
    );
  }

  // The strip only holds started steps: a pending step selected in the trail leaves it unpressed.
  const stripSelected = selected && selected.status !== "pending" ? selected.id : null;

  return (
    <section {...rest} {...nisthaAttr("rundetail", rest)} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.lead}>{runSummary(steps)}</p>
      </header>

      <div className={cx("layout-split--primary", styles.split)}>
        <div className={styles.column}>
          <AgentMonitor
            className={styles.monitor}
            name={run.name}
            meta={run.meta}
            status={run.status}
            headline={run.headline}
            headlineNote={run.headlineNote}
            elapsed={run.elapsed}
            cost={run.cost}
            axis={run.axis}
            error={run.error}
            pendingAction={run.pendingAction}
            steps={strip}
            selectedStepId={stripSelected}
            onSelectStep={select}
            onApprove={onApprove}
            onDeny={onDeny}
            onPause={onPause}
            onResume={onResume}
            onCancel={onCancel}
            onStop={onStop}
            onRetry={retry && failedId ? () => retry(failedId) : undefined}
            onOpenTrail={run.status === "failed" && failedId ? () => select(failedId) : undefined}
          />

          {traceNode}

          <section className={styles.call} aria-labelledby={callId}>
            <h3 id={callId} className={styles.subtitle}>
              {selected ? `Tool call · ${selected.label ?? selected.tool}` : "Tool call"}
            </h3>
            {call && selected ? (
              <ToolCallCard
                key={selected.id}
                {...call}
                defaultExpanded
                onRetry={retry && selected.status === "failed" ? () => retry(selected.id) : undefined}
              />
            ) : (
              <Empty
                outlined
                icon="Wrench"
                title={selected ? "Not run yet" : "No step selected"}
                description={
                  selected
                    ? "This step is planned. Its tool call shows here once it starts."
                    : "Pick a step in the strip, the tree or the trail to see its call."
                }
              />
            )}
          </section>
        </div>

        <div className={styles.column}>
          {agents ? (
            <AgentTree
              root={agents}
              label="Agents"
              selectedId={selectedAgent}
              onSelect={(agentId) => {
                const next = stepForAgent(steps, agentId);
                select(next === selectedId ? null : next);
              }}
              onApprove={onApprove ? () => onApprove() : undefined}
              onRetry={
                retry
                  ? (agentId) => {
                      const failed = failedStepForAgent(steps, agentId);
                      if (failed) retry(failed);
                    }
                  : undefined
              }
            />
          ) : null}
          <AgentTrail
            title={run.name}
            tag={run.tag}
            icon="ListChecks"
            steps={trail}
            selectedStepId={selectedId}
            onSelectStep={select}
          />
          {showAsk ? (
            <aside className={styles.ask} aria-labelledby={askId}>
              <h3 id={askId} className={styles.srOnly}>
                {`Ask ${run.name}`}
              </h3>
              <Chat
                title="Ask"
                messages={messages ?? []}
                onSend={onSend}
                isThinking={thinking}
                placeholder={`Ask or steer ${run.name}`}
                sendAppearance={run.pendingAction || run.status === "paused" ? "soft" : "solid"}
              />
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
