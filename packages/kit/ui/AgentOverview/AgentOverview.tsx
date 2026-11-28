"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ActivityFeed } from "../ActivityFeed";
import { AgentLanes } from "../AgentLanes";
import { ApprovalCard } from "../ApprovalCard";
import { Button } from "../Button";
import { DecisionCard } from "../DecisionCard";
import { ListView } from "../ListView";
import { SegmentedControl } from "../SegmentedControl";
import { AgentStatusIcon, AgentStatusMark } from "../shared/agentStatus";
import { cx } from "../shared/cx";
import {
  ACTION_ASK,
  ACTION_REVIEW,
  AGENT_OVERVIEW_FILTERS,
  DECISION_APPROVE,
  DECISION_REJECT,
  FILTER_LABEL,
  filterCounts,
  formatClock,
  lanesFor,
  leadLine,
  railFor,
  requestsFor,
  rowsFor,
} from "./agentOverview.logic";
import type { AgentOverviewFilter, AgentOverviewProps, AgentOverviewView } from "./AgentOverview.types";
import styles from "./AgentOverview.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  AgentOverviewProps,
  AgentOverviewAgent,
  AgentOverviewEvent,
  AgentOverviewFilter,
  AgentOverviewSubAgent,
  AgentOverviewView,
} from "./AgentOverview.types";

const MINUTE = 60_000;
const LANE_SPANS = [10 * MINUTE, 30 * MINUTE];

const LIST_EMPTY: Record<AgentOverviewFilter, { title: string; description: string }> = {
  all: { title: "No agents yet", description: "Agents show here once they start work." },
  running: { title: "No agents running", description: "Running agents show here." },
  "needs-you": { title: "No agent is waiting on you", description: "Agents that need an approval show here." },
  failed: { title: "No failed runs", description: "Agents whose run failed show here." },
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
 * Block: the agent home. What needs you (one request, the rest counted), every agent with an
 * icon-and-word status and one action, and what happened since the last visit on the shared rail.
 * A Timeline view shows the same agents on one time axis (AgentLanes) on wide screens.
 */
export function AgentOverview(props: AgentOverviewProps) {
  const {
    agents,
    events,
    since,
    now: nowProp,
    filter: filterProp,
    defaultFilter = "all",
    onFilterChange,
    view: viewProp,
    defaultView = "list",
    onViewChange,
    onApprove,
    onReject,
    // Kept in the props for older apps; taken out so it does not land on the section.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRetry: _onRetry,
    onReview,
    onAsk,
    onNewTask,
    title = "Agents",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const needsId = useId();
  const listId = useId();
  const now = useClock(nowProp);
  const [innerFilter, setInnerFilter] = useState<AgentOverviewFilter>(defaultFilter);
  const filter = filterProp ?? innerFilter;
  const [innerView, setInnerView] = useState<AgentOverviewView>(defaultView);
  const view = viewProp ?? innerView;
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [pickedSpan, setPickedSpan] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | undefined>(undefined);

  // Minute resolution is enough for the rail; it keeps it still between ticks.
  const minute = Math.floor(now / MINUTE) * MINUTE;
  const counts = useMemo(() => filterCounts(agents, events), [agents, events]);
  const requests = useMemo(() => requestsFor(events), [events]);
  const request = requests[0];
  const rows = useMemo(
    () => rowsFor(agents, events, filter, request?.agentId, { review: Boolean(onReview), ask: Boolean(onAsk) }),
    [agents, events, filter, request?.agentId, onReview, onAsk],
  );
  const rail = useMemo(() => railFor(agents, events, since, minute), [agents, events, since, minute]);
  const lanes = useMemo(() => lanesFor(agents, events, filter), [agents, events, filter]);
  const doneCount = rail.filter((event) => event.status?.label === "Done").length;
  const requestAgent = request ? (agents.find((agent) => agent.id === request.agentId)?.name ?? request.agentId) : "";
  const more = requests.length - 1;
  const span = pickedSpan ?? LANE_SPANS[1];
  const timeline = view === "timeline";

  function changeFilter(next: AgentOverviewFilter) {
    if (filterProp === undefined) setInnerFilter(next);
    setOpenTaskId(null);
    onFilterChange?.(next);
  }

  function changeView(next: AgentOverviewView) {
    if (viewProp === undefined) setInnerView(next);
    setOpenTaskId(null);
    onViewChange?.(next);
  }

  function rowAction(agentId: string, actionId: string) {
    if (actionId === ACTION_REVIEW) onReview?.(agentId);
    else if (actionId === ACTION_ASK) onAsk?.(agentId);
  }

  const list = (
    <ListView
      label="All agents"
      size="sm"
      items={rows.map(({ item, status }) => ({ ...item, icon: <AgentStatusIcon status={status} size={16} /> }))}
      onAction={rowAction}
      empty={{ ...LIST_EMPTY[filter], icon: "Filter" }}
    />
  );

  return (
    <section {...rest} {...nisthaAttr("agentoverview", rest)} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.lead}>{leadLine(agents, since)}</p>
        </div>
        <div className={styles.headActions}>
          <SegmentedControl
            className={styles.viewToggle}
            size="sm"
            ariaLabel="View"
            value={view}
            onChange={(value) => changeView(value as AgentOverviewView)}
            items={[
              { value: "list", label: "List" },
              { value: "timeline", label: "Timeline" },
            ]}
          />
          {onNewTask ? (
            <Button size="md" appearance="outline" mode="neutral" iconStart="Plus" onClick={onNewTask}>
              New task
            </Button>
          ) : null}
        </div>
      </header>

      {/* New requests are announced politely; focus never jumps to them. */}
      <p className={styles.srOnly} aria-live="polite">
        {requests.length ? `${requests.length} ${requests.length === 1 ? "request needs" : "requests need"} you` : ""}
      </p>

      {/* The Needs you line sits above both columns, so the request card and the Since rail start level. */}
      <div className={styles.body}>
        {request ? (
          <p className={styles.needsMeta}>
            <AgentStatusMark status="needs-you" />
            <span>{`${requestAgent} · ${formatClock(request.start)}`}</span>
          </p>
        ) : null}

        <div className={cx("layout-split--primary", styles.columns)}>
          <div className={styles.column}>
            {request ? (
              <section className={styles.needs} aria-labelledby={needsId}>
                <h3 id={needsId} className={styles.srOnly}>
                  {`${requestAgent} asks`}
                </h3>
                {request.action ? (
                  <ApprovalCard
                    key={request.id}
                    title={request.ask ?? request.title}
                    description={request.ask && request.ask !== request.title ? request.title : undefined}
                    risk={request.risk}
                    action={request.action}
                    onApprove={() => onApprove?.(request.id)}
                    onDeny={() => onReject?.(request.id)}
                  />
                ) : (
                  <DecisionCard
                    key={request.id}
                    title={`${requestAgent} asks`}
                    question={request.ask ?? request.title}
                    meta={request.ask && request.ask !== request.title ? request.title : undefined}
                    options={[
                      { id: DECISION_APPROVE, label: "Approve" },
                      { id: DECISION_REJECT, label: "Deny" },
                    ]}
                    value={decision}
                    onValueChange={setDecision}
                    onConfirm={() => {
                      if (decision === DECISION_APPROVE) onApprove?.(request.id);
                      else if (decision === DECISION_REJECT) onReject?.(request.id);
                      setDecision(undefined);
                    }}
                  />
                )}
                {more > 0 ? <p className={styles.more}>{`${more} more ${more === 1 ? "request" : "requests"} waiting`}</p> : null}
              </section>
            ) : null}

            <section className={styles.agents} aria-labelledby={listId}>
              <header className={styles.agentsHead}>
                <h3 id={listId} className={styles.agentsTitle}>
                  All agents
                </h3>
                <SegmentedControl
                  size="sm"
                  ariaLabel="Show agents"
                  value={filter}
                  onChange={(value) => changeFilter(value as AgentOverviewFilter)}
                  items={AGENT_OVERVIEW_FILTERS.map((key) => ({ value: key, label: `${FILTER_LABEL[key]} ${counts[key]}` }))}
                />
              </header>
              {/* Timeline needs width: below the small breakpoint the list shows instead. */}
              <div className={cx(styles.list, timeline && styles.listUnderTimeline)}>{list}</div>
              {timeline ? (
                <div className={styles.lanes}>
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
                </div>
              ) : null}
            </section>
          </div>

          <div className={styles.column}>
            <ActivityFeed
              variant="history"
              title={`Since ${formatClock(since)}`}
              description={`${doneCount} done`}
              events={rail}
              now={now}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
