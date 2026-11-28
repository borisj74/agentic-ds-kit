"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { BellOff, CircleDot, Minus, Sparkles, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { FilterBar } from "../FilterBar";
import { LineChart } from "../LineChart";
import { Link } from "../Link";
import { NumberTransition } from "../NumberTransition";
import { RadioGroup } from "../RadioGroup";
import { Table } from "../Table";
import { ToolCallCard } from "../ToolCallCard";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { STATUSES, STATUS_LABEL, agentNames, filterClusters, listWords, plural, trendWords, type TrendDirection } from "./failureClusters.logic";
import type { FailureCluster, FailureClusterStatus, FailureClustersProps, FailureFilters } from "./FailureClusters.types";
import styles from "./FailureClusters.module.css";

export type {
  FailureClustersProps,
  FailureCluster,
  FailureClusterStatus,
  FailureAgent,
  FailureRun,
  FailureSample,
  FailureFilters,
} from "./FailureClusters.types";

const STATUS_TONE: Record<FailureClusterStatus, "warning" | "neutral" | "success" | "danger"> = {
  new: "warning",
  known: "neutral",
  fixed: "success",
  regressed: "danger",
};
const TREND_ICON: Record<TrendDirection, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus, new: Sparkles };
const DEFAULT_TIMES = ["Last hour", "Last 24 hours", "Last 7 days"];
const ANY = "__any";

type FilterKey = keyof FailureFilters;

/**
 * Block: failed runs across many agents, grouped by likely cause, so ops can fix causes rather
 * than single runs. The selected cluster shows its trend, a sample failing call and recent runs.
 */
export function FailureClusters({
  clusters,
  title = "Failures",
  selectedId: selectedProp,
  onSelect,
  filters: filtersProp,
  onFiltersChange,
  timeOptions = DEFAULT_TIMES,
  onMarkKnown,
  onMute,
  onOpenIssue,
  className,
  ref,
  ...rest
}: FailureClustersProps) {
  const base = useId();
  const titleId = `${base}-title`;
  const detailTitleId = `${base}-detail`;
  const [innerFilters, setInnerFilters] = useState<FailureFilters>({});
  const [innerSelected, setInnerSelected] = useState<string | null>(null);
  const [openFilter, setOpenFilter] = useState<FilterKey | undefined>();
  const optionRefs = useRef(new Map<string, HTMLLIElement | null>());
  const filters = filtersProp ?? innerFilters;
  const shown = filterClusters(clusters, filters);
  const wanted = selectedProp === undefined ? innerSelected : selectedProp;
  const selected = shown.find((c) => c.id === wanted) ?? shown[0] ?? null;

  function setFilters(next: FailureFilters) {
    if (filtersProp === undefined) setInnerFilters(next);
    onFiltersChange?.(next);
  }

  function select(id: string, focus = false) {
    if (selectedProp === undefined) setInnerSelected(id);
    onSelect?.(id);
    if (focus) optionRefs.current.get(id)?.focus();
  }

  function handleListKey(event: KeyboardEvent<HTMLUListElement>) {
    if (!selected) return;
    const index = shown.findIndex((c) => c.id === selected.id);
    let next = -1;
    if (event.key === "ArrowDown") next = Math.min(shown.length - 1, index + 1);
    else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = shown.length - 1;
    if (next < 0) return;
    event.preventDefault();
    select(shown[next].id, true);
  }

  const options: Record<FilterKey, { label: string; values: { value: string; label: string }[] }> = {
    time: { label: "Time", values: timeOptions.map((t) => ({ value: t, label: t })) },
    agent: { label: "Agent", values: agentNames(clusters).map((a) => ({ value: a, label: a })) },
    status: { label: "Status", values: STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
  };
  const filterKeys: FilterKey[] = ["time", "agent", "status"];
  const valueLabel = (key: FilterKey) => (key === "status" && filters.status ? STATUS_LABEL[filters.status] : (filters[key] as string | undefined));
  const total = shown.reduce((sum, c) => sum + c.count, 0);

  return (
    <section {...rest} {...nisthaAttr("failureclusters", rest)} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.lead}>
          {shown.length > 0
            ? `${plural(total, "failed run")} in ${plural(shown.length, "cause")}${filters.time ? ` · ${filters.time.charAt(0).toLowerCase()}${filters.time.slice(1)}` : ""}`
            : "Nothing failed in this window."}
        </p>
      </header>

      <div className={cx("layout-split--secondary", styles.columns)}>
        <div className={styles.listColumn}>
          <FilterBar
            size="sm"
            ariaLabel="Filter failures"
            filters={filterKeys.map((key) => ({ id: key, label: options[key].label, value: valueLabel(key) }))}
            openId={openFilter}
            onFilterClick={(id) => setOpenFilter((current) => (current === id ? undefined : (id as FilterKey)))}
            renderOptions={(id) => {
              const key = id as FilterKey;
              return (
                <RadioGroup
                  name={`${base}-${key}`}
                  legend={options[key].label}
                  size="sm"
                  options={[{ value: ANY, label: "Any" }, ...options[key].values]}
                  value={(filters[key] as string | undefined) ?? ANY}
                  onChange={(value) => {
                    setFilters({ ...filters, [key]: value === ANY ? undefined : value });
                    setOpenFilter(undefined);
                  }}
                />
              );
            }}
            onClear={() => {
              setFilters({});
              setOpenFilter(undefined);
            }}
          />
          
          {shown.length === 0 ? (
            <Empty icon="CircleCheck" title="No failures in this window" description="Try a longer window or clear the filters." outlined />
          ) : (
            <ul
              role="listbox"
              aria-label={`Failure causes, largest first, ${shown.length}`}
              className={styles.list}
              onKeyDown={handleListKey}
            >
              {shown.map((cluster) => {
                const isSelected = cluster.id === selected?.id;
                const trend = trendWords(cluster.trend);
                const TrendIcon = TREND_ICON[trend.direction];
                return (
                  <li
                    key={cluster.id}
                    ref={(node) => {
                      optionRefs.current.set(cluster.id, node);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    className={cx(styles.option, isSelected && styles.selected)}
                    onClick={() => select(cluster.id)}
                  >
                    <span className={styles.optionTop}>
                      <span className={styles.cause}>{cluster.title}</span>
                      <NumberTransition className={styles.count} value={cluster.count} label={plural(cluster.count, "failed run")} />
                    </span>
                    <span className={styles.optionMeta}>
                      <Badge tone={STATUS_TONE[cluster.status]} appearance="soft" size="sm">
                        {STATUS_LABEL[cluster.status]}
                      </Badge>
                      <span className={styles.trend}>
                        <TrendIcon size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                        {trend.text}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selected ? <ClusterDetail cluster={selected} titleId={detailTitleId} onMarkKnown={onMarkKnown} onMute={onMute} onOpenIssue={onOpenIssue} /> : null}
      </div>
    </section>
  );
}

function ClusterDetail({
  cluster,
  titleId,
  onMarkKnown,
  onMute,
  onOpenIssue,
}: {
  cluster: FailureCluster;
  titleId: string;
  onMarkKnown?: (id: string) => void;
  onMute?: (id: string) => void;
  onOpenIssue?: (id: string) => void;
}) {
  const labels = cluster.trendLabels ?? cluster.trend.map((_, i) => `Period ${i + 1}`);
  return (
    <section className={styles.detail} aria-labelledby={titleId}>
      <header className={styles.detailHead}>
        <div className={styles.detailHeading}>
          <h3 id={titleId} className={styles.detailTitle}>
            {cluster.title}
          </h3>
          <p className={styles.detailMeta}>
            <Badge tone={STATUS_TONE[cluster.status]} appearance="soft" size="sm">
              {STATUS_LABEL[cluster.status]}
            </Badge>
            <span>
              <NumberTransition value={cluster.count} label={plural(cluster.count, "failed run")} />
              <span aria-hidden="true">{cluster.count === 1 ? " failed run" : " failed runs"}</span>
            </span>
            <span>{listWords(cluster.agents.map((a) => a.name))}</span>
            <span>First seen {cluster.firstSeen}</span>
            <span>Last seen {cluster.lastSeen}</span>
          </p>
          {cluster.sample.summary ? <p className={styles.summary}>{cluster.sample.summary}</p> : null}
        </div>
      </header>

      <LineChart
        title="Failures over time"
        labels={labels}
        series={[{ label: "Failed runs", data: cluster.trend }]}
        variant="area"
        height={160}
        includeZero
        showGrid={false}
        tickInterval={Math.max(1, Math.ceil(labels.length / 4))}
      />

      <div className={styles.block}>
        <h4 className={styles.sectionTitle}>Sample failing call</h4>
        <ToolCallCard
          className={styles.sample}
          name={cluster.sample.name}
          status="error"
          duration={cluster.sample.duration}
          args={cluster.sample.args}
          error={cluster.sample.error}
          defaultExpanded
        />
      </div>

      <div className={styles.block}>
        <h4 className={styles.sectionTitle}>Recent runs</h4>
        <Table
          caption={`Recent failed runs for ${cluster.title}`}
          columns={[
            { key: "run", header: "Run" },
            { key: "agent", header: "Agent" },
            { key: "when", header: "When" },
            { key: "step", header: "Step" },
          ]}
          rows={cluster.runs.map((run) => ({
            run: run.href ? (
              <Link href={run.href} variant="inline">
                {run.label}
              </Link>
            ) : (
              run.label
            ),
            agent: run.agent,
            when: run.when,
            step: run.step,
          }))}
          emptyLabel="No runs in this window"
        />
      </div>

      {/* Actions come after the evidence, in reading and tab order. */}
      {onMarkKnown || onMute || onOpenIssue ? (
        <span className={styles.actions}>
          {onMute ? (
            <Button size="sm" appearance="ghost" mode="neutral" iconStart={BellOff} disabled={Boolean(cluster.mutedUntil)} onClick={() => onMute(cluster.id)}>
              {cluster.mutedUntil ? `Muted ${cluster.mutedUntil}` : "Mute 24h"}
            </Button>
          ) : null}
          {onMarkKnown && cluster.status !== "known" ? (
            <Button size="sm" appearance="outline" mode="neutral" onClick={() => onMarkKnown(cluster.id)}>
              Mark known
            </Button>
          ) : null}
          {onOpenIssue ? (
            <Button size="sm" appearance="solid" mode="primary" iconStart={CircleDot} onClick={() => onOpenIssue(cluster.id)}>
              Open issue
            </Button>
          ) : null}
        </span>
      ) : null}
    </section>
  );
}
