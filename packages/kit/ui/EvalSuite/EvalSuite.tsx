"use client";

import { useId, useState } from "react";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { CodeSnippet } from "../CodeSnippet";
import { DataTable } from "../DataTable";
import type { DataTableColumn, DataTableRow } from "../DataTable";
import { Drawer } from "../Drawer";
import { FilterBar } from "../FilterBar";
import { InlineDiff } from "../InlineDiff";
import { Progress } from "../Progress";
import { RadioGroup } from "../RadioGroup";
import { Scoreboard } from "../Scoreboard";
import type { ScorecardProps } from "../Scorecard";
import { SegmentedControl } from "../SegmentedControl";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import {
  RESULT_LABEL,
  distinct,
  isImprovement,
  isRegression,
  lineDiff,
  money,
  ms,
  percent,
  regressions,
  signed,
  unreviewedRegressions,
  viewCases,
} from "./evalSuite.logic";
import type { EvalCase, EvalResult, EvalSuiteProps, EvalView } from "./EvalSuite.types";
import styles from "./EvalSuite.module.css";

export type {
  EvalSuiteProps,
  EvalCase,
  EvalCaseRun,
  EvalMetrics,
  EvalVersion,
  EvalResult,
  EvalView,
  EvalStatus,
} from "./EvalSuite.types";

const RESULT_TONE: Record<EvalResult, "success" | "danger" | "warning"> = { pass: "success", fail: "danger", error: "warning" };
const VIEWS: { value: EvalView; label: string }[] = [
  { value: "regressions", label: "Regressions" },
  { value: "improvements", label: "Improvements" },
  { value: "all", label: "All" },
];
const ANY = "__any";

type FilterKey = "tag" | "dataset";

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Block: a candidate agent version against the baseline on a fixed set of test cases, before it
 * ships. Pass rate, cost and latency side by side; regressions first; each case opens with both
 * outputs.
 */
export function EvalSuite({
  title = "Eval run",
  baseline,
  candidate,
  cases,
  view: viewProp,
  onViewChange,
  onPromote,
  onRerun,
  onAcceptExpected,
  onFlag,
  status = "done",
  progress = 0,
  errorMessage = "The run stopped before every case finished.",
  currency = "USD",
  className,
  ref,
  ...rest
}: EvalSuiteProps) {
  const base = useId();
  const titleId = `${base}-title`;
  const blockerId = `${base}-blocker`;
  const [innerView, setInnerView] = useState<EvalView>("regressions");
  const [filters, setFilters] = useState<{ tag?: string; dataset?: string }>({});
  const [openFilter, setOpenFilter] = useState<FilterKey | undefined>();
  const [openId, setOpenId] = useState<string | null>(null);
  const view = viewProp ?? innerView;
  const open = cases.find((c) => c.id === openId) ?? null;
  const shown = viewCases(cases, view, filters);
  const regressed = regressions(cases);
  const unreviewed = unreviewedRegressions(cases);
  const running = status === "running";
  const done = Math.round(progress * cases.length);

  function setView(next: EvalView) {
    if (viewProp === undefined) setInnerView(next);
    onViewChange?.(next);
  }

  const b = baseline.metrics;
  const c = candidate.metrics;
  const passDelta = (c.passRate - b.passRate) * 100;
  const costDelta = c.avgCost - b.avgCost;
  const latencyDelta = c.p50LatencyMs - b.p50LatencyMs;
  const metrics: ScorecardProps[] = [
    {
      label: "Pass rate",
      value: percent(c.passRate),
      delta: `${signed(passDelta, 1)} pts`,
      trend: passDelta > 0 ? "up" : passDelta < 0 ? "down" : "flat",
      deltaTone: passDelta > 0 ? "success" : passDelta < 0 ? "danger" : "neutral",
      hint: `${baseline.label} ${percent(b.passRate)}`,
      size: "sm",
    },
    {
      label: "Average cost",
      value: money(c.avgCost, currency),
      delta: `${signed((costDelta / (b.avgCost || 1)) * 100, 0)}%`,
      trend: costDelta > 0 ? "up" : costDelta < 0 ? "down" : "flat",
      deltaTone: costDelta > 0 ? "danger" : costDelta < 0 ? "success" : "neutral",
      hint: `${baseline.label} ${money(b.avgCost, currency)}`,
      size: "sm",
    },
    {
      label: "p50 latency",
      value: ms(c.p50LatencyMs),
      delta: `${signed((latencyDelta / (b.p50LatencyMs || 1)) * 100, 0)}%`,
      trend: latencyDelta > 0 ? "up" : latencyDelta < 0 ? "down" : "flat",
      deltaTone: latencyDelta > 0 ? "danger" : latencyDelta < 0 ? "success" : "neutral",
      hint: `${baseline.label} ${ms(b.p50LatencyMs)}`,
      size: "sm",
    },
    {
      label: "Regressions",
      value: String(regressed.length),
      delta: unreviewed.length > 0 ? `${unreviewed.length} to review` : "all reviewed",
      trend: "neutral",
      deltaTone: unreviewed.length > 0 ? "danger" : regressed.length > 0 ? "neutral" : "success",
      hint: `pass in ${baseline.label}, not in ${candidate.label}`,
      size: "sm",
    },
  ];

  const filterOptions: Record<FilterKey, { label: string; values: string[] }> = {
    tag: { label: "Tag", values: distinct(cases.flatMap((x) => x.tags ?? [])) },
    dataset: { label: "Dataset", values: distinct(cases.map((x) => x.dataset).filter((d): d is string => Boolean(d))) },
  };

  const columns: DataTableColumn[] = [
    { key: "name", header: "Case" },
    { key: "tags", header: "Tags" },
    { key: "baseline", header: baseline.label },
    { key: "candidate", header: candidate.label },
    { key: "score", header: "Score Δ", type: "number" },
    { key: "cost", header: "Cost Δ", type: "number" },
    { key: "open", header: "Details" },
  ];

  const rows: DataTableRow[] = shown.map((x) => {
    const scoreDelta = x.candidate.score !== undefined && x.baseline.score !== undefined ? signed(x.candidate.score - x.baseline.score) : "—";
    const costDelta = x.candidate.cost !== undefined && x.baseline.cost !== undefined ? signed(x.candidate.cost - x.baseline.cost, 3) : "—";
    const state = isRegression(x) ? (x.accepted ? " · accepted" : x.flagged ? " · flagged" : "") : "";
    return {
      id: x.id,
      name: `${x.name}${state}`,
      tags: { type: "badges", badges: (x.tags ?? []).map((t) => ({ label: t, tone: "neutral" })) },
      baseline: { type: "badge", label: RESULT_LABEL[x.baseline.result], tone: RESULT_TONE[x.baseline.result] },
      candidate: { type: "badge", label: RESULT_LABEL[x.candidate.result], tone: RESULT_TONE[x.candidate.result] },
      score: scoreDelta,
      cost: costDelta,
      open: {
        type: "actions",
        label: `Details for ${x.name}`,
        actions: [{ label: "Open", ariaLabel: `Open ${x.name}`, appearance: "outline", mode: "neutral", onClick: () => setOpenId(x.id) }],
      },
    };
  });

  const blocker = running
    ? "Wait for the run to finish."
    : status === "error"
      ? "Re-run the suite first."
      : unreviewed.length > 0
        ? `Review ${plural(unreviewed.length, "regression")} first: accept the new output or flag the case.`
        : "";

  const emptyMessage =
    view === "regressions"
      ? `No regressions: every case that passed in ${baseline.label} still passes.`
      : view === "improvements"
        ? "No improvements in this run."
        : "No cases match these filters.";

  return (
    <section
      {...rest}
      {...nisthaAttr("evalsuite", rest)}
      ref={ref}
      className={cx(styles.root, className)}
      aria-labelledby={titleId}
      aria-busy={running || undefined}
    >
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.versions}>
            {`${baseline.label} baseline · ${candidate.label} candidate · ${plural(cases.length, "case")}`}
          </p>
        </div>
      </header>

      {running ? (
        <div className={styles.progress}>
          <Progress size="sm" value={Math.round(progress * 100)} ariaLabel="Eval progress" />
          <span className={styles.progressText} role="status">{`Running ${done} of ${cases.length} cases`}</span>
        </div>
      ) : null}
      {status === "error" ? <Alert variant="danger" title="Run failed">{errorMessage}</Alert> : null}

      <Scoreboard items={metrics} aria-label={`${candidate.label} against ${baseline.label}`} />

      <div className={styles.controls}>
        <SegmentedControl size="sm" ariaLabel="Show cases" items={VIEWS} value={view} onChange={(v) => setView(v as EvalView)} />
        <FilterBar
          size="sm"
          ariaLabel="Filter cases"
          filters={(["tag", "dataset"] as FilterKey[]).map((key) => ({ id: key, label: filterOptions[key].label, value: filters[key] }))}
          openId={openFilter}
          onFilterClick={(id) => setOpenFilter((current) => (current === id ? undefined : (id as FilterKey)))}
          onClear={() => {
            setFilters({});
            setOpenFilter(undefined);
          }}
        />
      </div>
      {openFilter ? (
        <RadioGroup
          className={styles.picker}
          name={`${base}-${openFilter}`}
          legend={filterOptions[openFilter].label}
          size="sm"
          orientation="horizontal"
          options={[{ value: ANY, label: "Any" }, ...filterOptions[openFilter].values.map((v) => ({ value: v, label: v }))]}
          value={filters[openFilter] ?? ANY}
          onChange={(value) => {
            setFilters({ ...filters, [openFilter]: value === ANY ? undefined : value });
            setOpenFilter(undefined);
          }}
        />
      ) : null}

      <DataTable
        className={styles.table}
        ariaLabel={`Cases, ${VIEWS.find((v) => v.value === view)?.label.toLowerCase()} first`}
        toolbar={false}
        cellSize="sm"
        columns={columns}
        rows={rows}
        emptyMessage={emptyMessage}
      />

      <footer className={styles.footer}>
        {blocker ? (
          <span id={blockerId} className={styles.blocker}>
            {blocker}
          </span>
        ) : (
          <span className={styles.blocker}>{`${candidate.label} is ready to replace ${baseline.label}.`}</span>
        )}
        <span className={styles.actions}>
          {onRerun ? (
            <Button appearance="outline" mode="neutral" iconStart="RotateCcw" disabled={running} onClick={onRerun}>
              Re-run
            </Button>
          ) : null}
          {onPromote ? (
            <Button
              appearance="solid"
              mode="primary"
              disabled={Boolean(blocker)}
              aria-describedby={blocker ? blockerId : undefined}
              onClick={onPromote}
            >
              {`Promote ${candidate.label}`}
            </Button>
          ) : null}
        </span>
      </footer>

      <Drawer
        open={Boolean(open)}
        title={open?.name ?? "Case"}
        description={open ? caseLine(open, baseline.label, candidate.label) : undefined}
        size="lg"
        onClose={() => setOpenId(null)}
        footer={
          open && (onAcceptExpected || onFlag) ? (
            <span className={styles.drawerActions}>
              {onFlag ? (
                <Button appearance="ghost" mode="neutral" iconStart="Flag" disabled={open.flagged} onClick={() => onFlag(open.id)}>
                  {open.flagged ? "Flagged" : "Flag case"}
                </Button>
              ) : null}
              {onAcceptExpected ? (
                <Button appearance="outline" mode="neutral" iconStart="Check" disabled={open.accepted} onClick={() => onAcceptExpected(open.id)}>
                  {open.accepted ? "Accepted as expected" : "Accept as new expected"}
                </Button>
              ) : null}
            </span>
          ) : undefined
        }
      >
        {open ? (
          <div className={styles.detail}>
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Input</h3>
              <CodeSnippet code={open.input} title="Input" wrap />
            </section>
            <InlineDiff
              title="Output"
              mode="split"
              file={`${baseline.label} → ${candidate.label}`}
              lines={lineDiff(open.baseline.output, open.candidate.output)}
              hunkLabel={`${baseline.label}: ${RESULT_LABEL[open.baseline.result]} · ${candidate.label}: ${RESULT_LABEL[open.candidate.result]}`}
            />
            {open.graderNote ? (
              <section className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>Grader note</h3>
                <p className={styles.note}>{open.graderNote}</p>
              </section>
            ) : null}
            <p className={styles.badges}>
              {(open.tags ?? []).map((t) => (
                <Badge key={t} tone="neutral" appearance="outline" size="sm">
                  {t}
                </Badge>
              ))}
            </p>
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}

function caseLine(c: EvalCase, b: string, n: string): string {
  const kind = isRegression(c) ? "Regression" : isImprovement(c) ? "Improvement" : "No change";
  return `${kind} · ${b} ${RESULT_LABEL[c.baseline.result]} → ${n} ${RESULT_LABEL[c.candidate.result]}${c.dataset ? ` · ${c.dataset}` : ""}`;
}
