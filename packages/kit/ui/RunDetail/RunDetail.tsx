"use client";

import { useId, useMemo, useState } from "react";
import { AgentMonitor } from "../AgentMonitor";
import { AgentTrail } from "../AgentTrail";
import { AgentTree } from "../AgentTree";
import { Empty } from "../Empty";
import { ToolCallCard } from "../ToolCallCard";
import { cx } from "../shared/cx";
import { agentForStep, failedStepForAgent, lastFailedStep, monitorSteps, runSummary, stepForAgent, toolCallFor, trailSteps } from "./runDetail.logic";
import type { RunDetailProps } from "./RunDetail.types";
import styles from "./RunDetail.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { RunDetailProps, RunDetailRun, RunDetailStep, RunDetailStepStatus } from "./RunDetail.types";

/**
 * Block: one agent run on one screen. AgentMonitor (clock, cost, step strip, pending approval),
 * the selected step's ToolCallCard, AgentTree (who started whom) and AgentTrail (the step log),
 * all on one selected step.
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
    onRetry,
    title = "Run detail",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const callId = useId();
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelectedStepId);
  const selectedId = selectedProp !== undefined ? selectedProp : innerSelected;

  const strip = useMemo(() => monitorSteps(steps), [steps]);
  const trail = useMemo(() => trailSteps(steps), [steps]);
  const selected = selectedId ? steps.find((step) => step.id === selectedId) : undefined;
  const call = toolCallFor(selected);
  const selectedAgent = agentForStep(steps, selectedId, agents);
  const failedId = lastFailedStep(steps);

  function select(next: string | null) {
    if (selectedProp === undefined) setInnerSelected(next);
    onSelectStep?.(next);
  }

  // The strip only holds started steps: a pending step selected in the trail leaves it unpressed.
  const stripSelected = selected && selected.status !== "pending" ? selected.id : null;
  const retry = onRetry ? (id: string) => onRetry(id) : undefined;

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
            onRetry={retry && failedId ? () => retry(failedId) : undefined}
            onOpenTrail={run.status === "failed" && failedId ? () => select(failedId) : undefined}
          />

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
          <AgentTrail
            title={run.name}
            tag={run.tag}
            icon="ListChecks"
            steps={trail}
            selectedStepId={selectedId}
            onSelectStep={select}
          />
        </div>
      </div>
    </section>
  );
}
