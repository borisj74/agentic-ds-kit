"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AgentInbox } from "../AgentInbox";
import { AgentLanes } from "../AgentLanes";
import { BarChart } from "../BarChart";
import { Empty } from "../Empty";
import { Scoreboard } from "../Scoreboard";
import { SegmentedControl } from "../SegmentedControl";
import { cx } from "../shared/cx";
import {
  FILTER_LABEL,
  MISSION_HOME_FILTERS,
  activityFor,
  filterCounts,
  formatAgo,
  inboxHandlers,
  inboxItemsFor,
  lanesFor,
  summaryCounts,
} from "./missionHome.logic";
import type { MissionHomeFilter, MissionHomeProps } from "./MissionHome.types";
import styles from "./MissionHome.module.css";

export type { MissionHomeProps, MissionHomeAgent, MissionHomeEvent, MissionHomeFilter } from "./MissionHome.types";

const MINUTE = 60_000;
const LANE_SPANS = [10 * MINUTE, 30 * MINUTE];

const LANES_EMPTY: Record<MissionHomeFilter, { title: string; description: string }> = {
  all: { title: "No agents yet", description: "Each agent gets a lane here once it starts work." },
  running: { title: "No agents running", description: "Running agents show here on the shared time axis." },
  "needs-you": { title: "No agent is waiting on you", description: "Agents that need an approval or an answer show here." },
  failed: { title: "No failed runs", description: "Runs that fail since your last look show here." },
};

function useClock(controlled: number | undefined) {
  const [tick, setTick] = useState(() => controlled ?? Date.now());
  useEffect(() => {
    if (controlled !== undefined) return;
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [controlled]);
  return controlled ?? tick;
}

/**
 * Block: a home for a fleet of agents. A since-you-last-looked summary with an activity bar,
 * every agent on one time axis (AgentLanes), and what needs you (AgentInbox), under one filter.
 */
export function MissionHome(props: MissionHomeProps) {
  const {
    agents,
    events,
    since,
    now: nowProp,
    filter: filterProp,
    defaultFilter = "all",
    onFilterChange,
    onApprove,
    onReject,
    onRetry,
    title = "Mission home",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const summaryId = useId();
  const now = useClock(nowProp);
  const [innerFilter, setInnerFilter] = useState<MissionHomeFilter>(defaultFilter);
  const filter = filterProp ?? innerFilter;
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickedSpan, setPickedSpan] = useState<number | null>(null);

  // Minute resolution is enough for counts and the bar; it keeps them still between ticks.
  const minute = Math.floor(now / MINUTE) * MINUTE;
  const counts = useMemo(() => filterCounts(events, since, minute), [events, since, minute]);
  const summary = useMemo(() => summaryCounts(events, since, minute), [events, since, minute]);
  const activity = useMemo(() => activityFor(events, filter, since, minute), [events, filter, since, minute]);
  const lanes = useMemo(() => lanesFor(agents, events, filter), [agents, events, filter]);
  const inbox = useMemo(() => inboxItemsFor(agents, events, filter, since, minute), [agents, events, filter, since, minute]);

  // AgentLanes ticks every 2 minutes, so windows past 30 minutes crowd its axis: 10m and 30m only.
  const span = pickedSpan ?? LANE_SPANS[1];
  const ago = formatAgo(now - since);
  const sinceText = ago === "just now" ? "since just now" : `in the last ${ago}`;

  function changeFilter(next: MissionHomeFilter) {
    if (filterProp === undefined) setInnerFilter(next);
    setOpenTaskId(null);
    onFilterChange?.(next);
  }

  const handlers = inboxHandlers({ onApprove, onReject, onRetry });

  return (
    <section {...rest} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.lead}>Your agents {sinceText}.</p>
        </div>
        <SegmentedControl
          size="sm"
          ariaLabel="Show agents"
          value={filter}
          onChange={(value) => changeFilter(value as MissionHomeFilter)}
          items={MISSION_HOME_FILTERS.map((key) => ({ value: key, label: `${FILTER_LABEL[key]} ${counts[key]}` }))}
        />
      </header>

      <section className={cx("layout-split--primary", styles.split)} aria-labelledby={summaryId}>
        <div className={styles.summary}>
          <h3 id={summaryId} className={styles.subtitle}>
            Since you last looked
          </h3>
          <Scoreboard
            aria-label="Since you last looked"
            items={[
              { label: "Done", value: String(summary.done), hint: sinceText, size: "sm" },
              { label: "Needs you", value: String(summary.needsYou), hint: "waiting now", size: "sm" },
              { label: "Failed", value: String(summary.failed), hint: sinceText, size: "sm" },
            ]}
          />
        </div>
        <BarChart
          className={styles.activity}
          title={filter === "all" ? "Activity" : `Activity · ${FILTER_LABEL[filter]}`}
          description={`Agent work started ${sinceText}`}
          data={activity}
          height={120}
          showGrid={false}
          emptyLabel="No activity in this range"
        />
      </section>

      <div className={cx("layout-split--primary", styles.split)}>
        {lanes.agents.length ? (
          <AgentLanes
            agents={lanes.agents}
            tasks={lanes.tasks}
            now={now}
            span={span}
            spans={LANE_SPANS}
            onSpanChange={setPickedSpan}
            openTaskId={openTaskId}
            onOpenTaskChange={setOpenTaskId}
            onApprove={(id) => {
              setOpenTaskId(null);
              onApprove?.(id);
            }}
            onReject={(id) => {
              setOpenTaskId(null);
              onReject?.(id);
            }}
          />
        ) : (
          <Empty outlined icon="Filter" {...LANES_EMPTY[filter]} />
        )}
        <AgentInbox
          title="Needs you"
          items={inbox}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId((current) => (current === id ? null : id))}
          {...handlers}
        />
      </div>
    </section>
  );
}
