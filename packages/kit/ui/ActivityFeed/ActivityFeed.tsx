"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Empty } from "../Empty";
import { FilterButton } from "../FilterButton";
import { Popover } from "../Popover";
import { SegmentedControl } from "../SegmentedControl";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import {
  ACTIVITY_TYPES,
  NO_FILTERS,
  TYPE_LABEL,
  TYPE_PLURAL,
  actorsOf,
  chipState,
  eventSentence,
  groupByDay,
  isFiltered,
  loadedMessage,
  summaryLine,
  timeLabel,
  timeOf,
  toggle,
  typeCounts,
  visibleEvents,
} from "./activityFeed.logic";
import type { ActivityEvent, ActivityFeedFilters, ActivityFeedProps } from "./ActivityFeed.types";
import styles from "./ActivityFeed.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  ActivityActor,
  ActivityEvent,
  ActivityEventType,
  ActivityFeedFilters,
  ActivityFeedProps,
  ActivityFeedVariant,
} from "./ActivityFeed.types";

type OpenFilter = "type" | "person" | null;

function SkeletonRows({ count, label }: { count: number; label: string }) {
  return (
    <ul className={styles.skeletons} aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={styles.skeletonRow}>
          <Skeleton shape="circle" size="sm" label={index === 0 ? label : ""} />
          <span className={styles.skeletonCopy}>
            <Skeleton lines={2} size="sm" label="" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Block: what happened across a workspace. Events from people and agents, newest first and grouped
 * by day, filtered by type and by person, with Open and Reply on each event and Load more at the
 * end. Each event reads as one sentence; events that Load more brings in are announced politely.
 */
export function ActivityFeed(props: ActivityFeedProps) {
  const {
    events,
    filters: filtersProp,
    defaultFilters = NO_FILTERS,
    onFiltersChange,
    onOpen,
    onReply,
    onLoadMore,
    hasMore = false,
    loading = false,
    now: nowProp,
    locale = "en-GB",
    timeZone,
    title = "Activity",
    description,
    variant = "feed",
    statusChips,
    statusChip: chipProp,
    onStatusChipChange,
    error,
    onRetry,
    className,
    ref,
    ...rest
  } = props;
  const uid = useId();
  const titleId = `${uid}-title`;
  const leadId = `${uid}-lead`;
  const [renderedAt] = useState(() => Date.now());
  const now = nowProp ?? renderedAt;
  const [innerFilters, setInnerFilters] = useState<ActivityFeedFilters>(defaultFilters);
  const filters = filtersProp ?? innerFilters;
  const [innerChip, setInnerChip] = useState<string | null>(null);
  const chip = chipProp !== undefined ? chipProp : innerChip;
  const history = variant === "history";
  const filtered = isFiltered(filters) || chip !== null;
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
  const [announcement, setAnnouncement] = useState("");
  const pending = useRef<Set<string> | null>(null);
  const eventRefs = useRef(new Map<string, HTMLLIElement>());

  const shown = useMemo(() => visibleEvents(events, filters, chip), [events, filters, chip]);
  const days = useMemo(() => groupByDay(shown, now, locale, timeZone), [shown, now, locale, timeZone]);
  const actors = useMemo(() => actorsOf(events), [events]);
  const counts = useMemo(() => typeCounts(events), [events]);
  const nameOf = (id: string) => actors.find((actor) => actor.id === id)?.name ?? id;

  function announce(nextFilters: ActivityFeedFilters, nextChip: string | null) {
    const count = visibleEvents(events, nextFilters, nextChip).length;
    setAnnouncement(
      isFiltered(nextFilters) || nextChip !== null
        ? `${summaryLine(events.length, count, true, history)}.`
        : "Filters cleared. Showing all activity.",
    );
  }

  function setFilters(next: ActivityFeedFilters) {
    if (filtersProp === undefined) setInnerFilters(next);
    onFiltersChange?.(next);
    announce(next, chip);
  }

  function setChip(next: string | null) {
    if (chipProp === undefined) setInnerChip(next);
    onStatusChipChange?.(next);
    announce(filters, next);
  }

  // Clear filters resets the Type and Person filters and the status chip.
  function clearAll() {
    if (isFiltered(filters)) {
      if (filtersProp === undefined) setInnerFilters(NO_FILTERS);
      onFiltersChange?.(NO_FILTERS);
    }
    if (chip !== null) {
      if (chipProp === undefined) setInnerChip(null);
      onStatusChipChange?.(null);
    }
    setAnnouncement("Filters cleared. Showing all activity.");
  }

  function loadMore() {
    if (loading || !onLoadMore) return;
    pending.current = new Set(events.map((event) => event.id));
    setAnnouncement("");
    onLoadMore();
  }

  // After Load more: once loading is over and the events changed, say what came in. If the button
  // is gone (nothing more to load), focus moves to the first new event that shows.
  useEffect(() => {
    const before = pending.current;
    if (!before || loading) return;
    pending.current = null;
    const added = events.filter((event) => !before.has(event.id));
    const addedShown = added.filter((event) => shown.includes(event));
    setAnnouncement(loadedMessage(added.length, addedShown.length, filtered, hasMore));
    if (!hasMore && addedShown.length) {
      const first = shown.find((event) => !before.has(event.id));
      if (first) eventRefs.current.get(first.id)?.focus();
    }
  }, [events, loading, hasMore, shown, filtered]);

  const typeChip = chipState(filters.types, (id) => TYPE_PLURAL[id as ActivityEvent["type"]]);
  const personChip = chipState(filters.people, nameOf);
  const showMore = Boolean(onLoadMore && hasMore);

  const clearButton = (
    <Button size="sm" appearance="ghost" mode="neutral" onClick={clearAll}>
      Clear filters
    </Button>
  );

  // history: a time column, the shared rail (12px dot, 1px line to the next event of the same day),
  // the sentence and detail, and the status word at the end. Narrow, time and status join a meta line.
  function renderHistoryEvent(event: ActivityEvent, index: number, dayEvents: ActivityEvent[]) {
    const id = `${uid}-${event.id}`;
    const time = timeOf(event);
    const clock = timeLabel(time, locale, timeZone);
    const agent = event.actor.kind === "agent";
    const last = index === dayEvents.length - 1;
    const tone = event.status?.tone;
    return (
      <li
        key={event.id}
        ref={(el) => {
          if (el) eventRefs.current.set(event.id, el);
          else eventRefs.current.delete(event.id);
        }}
        className={cx(styles.event, styles.historyEvent)}
        tabIndex={-1}
      >
        <p id={`${id}-sentence`} className={styles.srOnly}>
          {eventSentence(event, now, locale, timeZone)}
        </p>
        <div className={styles.historyRow} aria-hidden="true">
          <time className={styles.historyTime} dateTime={new Date(time).toISOString()}>
            {clock}
          </time>
          <span className={styles.rail}>
            <span className={styles.dot} />
            {last ? null : <span className={styles.railLine} />}
          </span>
          <div className={cx(styles.historyBody, last && styles.historyBodyLast)}>
            <div className={styles.copy}>
              <p className={styles.line}>
                <span className={styles.actor}>{event.actor.name}</span>
                {agent ? (
                  <>
                    {" "}
                    <Badge size="sm" appearance="soft" tone="neutral">
                      Agent
                    </Badge>
                  </>
                ) : null}{" "}
                {event.verb} <span className={styles.object}>{event.object}</span>
              </p>
              {event.detail ? <p className={styles.historyDetail}>{event.detail}</p> : null}
              <p className={styles.historyMeta}>
                {clock}
                {event.status ? ` · ${event.status.label}` : null}
              </p>
            </div>
            {event.status ? (
              <span className={cx(styles.historyStatus, tone && styles[`tone-${tone}`])}>{event.status.label}</span>
            ) : null}
          </div>
        </div>
      </li>
    );
  }

  function renderEvent(event: ActivityEvent) {
    const id = `${uid}-${event.id}`;
    const time = timeOf(event);
    const agent = event.actor.kind === "agent";
    const reply = onReply && event.type === "comment" && event.canReply !== false;
    return (
      <li
        key={event.id}
        ref={(el) => {
          if (el) eventRefs.current.set(event.id, el);
          else eventRefs.current.delete(event.id);
        }}
        className={styles.event}
        tabIndex={-1}
      >
        <p id={`${id}-sentence`} className={styles.srOnly}>
          {eventSentence(event, now, locale, timeZone)}
        </p>
        <div className={styles.eventBody} aria-hidden="true">
          <Avatar
            className={styles.avatar}
            name={event.actor.name}
            src={event.actor.src}
            initials={event.actor.initials}
            size="sm"
          />
          <div className={styles.copy}>
            <p className={styles.line}>
              <span className={styles.actor}>{event.actor.name}</span>
              {agent ? (
                <>
                  {" "}
                  <Badge size="sm" appearance="soft" tone="neutral">
                    Agent
                  </Badge>
                </>
              ) : null}{" "}
              {event.verb} <span className={styles.object}>{event.object}</span>
            </p>
            {event.detail ? <p className={styles.detail}>{event.detail}</p> : null}
            <p className={styles.meta}>
              <time dateTime={new Date(time).toISOString()}>{timeLabel(time, locale, timeZone)}</time>
              <span className={styles.type}>{TYPE_LABEL[event.type]}</span>
              {event.status ? (
                <Badge size="sm" appearance="soft" tone={event.status.tone ?? "neutral"}>
                  {event.status.label}
                </Badge>
              ) : null}
            </p>
          </div>
        </div>
        {onOpen || reply ? (
          <div className={styles.actions}>
            {/* Hidden name parts: Open + the object, Reply to + the actor. */}
            {onOpen ? (
              <span id={`${id}-object`} className={styles.srOnly}>
                {event.object}
              </span>
            ) : null}
            {reply ? (
              <span id={`${id}-to`} className={styles.srOnly}>
                to {event.actor.name}
              </span>
            ) : null}
            {reply ? (
              <Button
                id={`${id}-reply`}
                size="sm"
                appearance="ghost"
                mode="neutral"
                iconStart="Reply"
                aria-labelledby={`${id}-reply ${id}-to`}
                onClick={() => onReply(event.id)}
              >
                Reply
              </Button>
            ) : null}
            {onOpen ? (
              <Button
                id={`${id}-open`}
                className={styles.open}
                size="sm"
                appearance="ghost"
                mode="neutral"
                iconStart="ArrowUpRight"
                ariaLabel="Open"
                aria-labelledby={`${id}-open ${id}-object`}
                onClick={() => onOpen(event.id)}
              />
            ) : null}
          </div>
        ) : null}
      </li>
    );
  }

  const errorState = error ? (
    <Empty
      outlined
      icon={CircleAlert}
      title="Couldn't load activity"
      description={error}
      actions={
        onRetry ? (
          <Button size="md" appearance="outline" mode="neutral" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    />
  ) : null;

  let body;
  if (!events.length && errorState) {
    body = errorState;
  } else if (!events.length && loading) {
    body = <SkeletonRows count={4} label="Loading activity" />;
  } else if (!events.length) {
    body = (
      <Empty
        outlined
        icon="Activity"
        title="No activity yet"
        description={
          history
            ? "Events show here as they happen."
            : "Comments, changes, agent runs, members and billing show here as they happen."
        }
      />
    );
  } else if (!shown.length) {
    body = (
      <Empty
        outlined
        icon="Filter"
        title="Nothing matches these filters"
        description={
          hasMore
            ? "Nothing loaded so far matches. Clear the filters, or load more activity."
            : "Try another type or person, or clear the filters."
        }
        actions={
          <Button size="md" appearance="outline" mode="neutral" onClick={clearAll}>
            Clear filters
          </Button>
        }
      />
    );
  } else {
    body = (
      <div className={cx(styles.days, history && styles.historyDays)}>
        {days.map((day) => (
          <section key={day.key} className={styles.day} aria-labelledby={`${uid}-day-${day.key}`}>
            <h3 id={`${uid}-day-${day.key}`} className={styles.dayTitle}>
              {day.label}
              <span className={styles.srOnly}>, {day.events.length === 1 ? "1 event" : `${day.events.length} events`}</span>
            </h3>
            <ol className={cx(styles.list, history && styles.historyList)}>
              {history ? day.events.map(renderHistoryEvent) : day.events.map(renderEvent)}
            </ol>
          </section>
        ))}
      </div>
    );
  }

  return (
    <section {...rest} {...nisthaAttr("activityfeed", rest)} ref={ref} className={cx(styles.root, history && styles.history, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p id={leadId} className={styles.lead}>
            {description ??
              (loading && !events.length
                ? "Loading…"
                : error && !events.length
                  ? "Couldn't load events"
                  : summaryLine(events.length, shown.length, filtered, history))}
          </p>
        </div>
        {events.length && statusChips?.length ? (
          <div className={styles.chips}>
            <SegmentedControl
              size="sm"
              ariaLabel="Filter activity"
              items={[{ value: "", label: "All" }, ...statusChips.map((word) => ({ value: word, label: word }))]}
              value={chip ?? ""}
              onChange={(value) => setChip(value === "" ? null : value)}
            />
          </div>
        ) : null}
        {events.length && !history ? (
          <div className={styles.filters} role="group" aria-label="Filter activity">
            <Popover
              label="Filter by type"
              open={openFilter === "type"}
              onOpenChange={(open) => setOpenFilter(open ? "type" : null)}
              trigger={
                <FilterButton size="sm" open={openFilter === "type"} {...typeChip}>
                  Type
                </FilterButton>
              }
            >
              <fieldset className={styles.options}>
                <legend className={styles.optionsTitle}>Show types</legend>
                {ACTIVITY_TYPES.map((type) => (
                  <Checkbox
                    key={type}
                    id={`${uid}-type-${type}`}
                    size="sm"
                    label={`${TYPE_PLURAL[type]} (${counts[type]})`}
                    checked={filters.types.includes(type)}
                    onChange={() => setFilters({ ...filters, types: toggle(filters.types, type) })}
                  />
                ))}
              </fieldset>
            </Popover>
            <Popover
              label="Filter by person"
              open={openFilter === "person"}
              onOpenChange={(open) => setOpenFilter(open ? "person" : null)}
              trigger={
                <FilterButton size="sm" open={openFilter === "person"} {...personChip}>
                  Person
                </FilterButton>
              }
            >
              <fieldset className={styles.options}>
                <legend className={styles.optionsTitle}>Show people and agents</legend>
                {actors.map((actor) => (
                  <Checkbox
                    key={actor.id}
                    id={`${uid}-person-${actor.id}`}
                    size="sm"
                    label={actor.kind === "agent" ? `${actor.name} (agent)` : actor.name}
                    checked={filters.people.includes(actor.id)}
                    onChange={() => setFilters({ ...filters, people: toggle(filters.people, actor.id) })}
                  />
                ))}
              </fieldset>
            </Popover>
            {filtered ? clearButton : null}
          </div>
        ) : null}
      </header>

      {body}

      {loading && events.length ? <SkeletonRows count={2} label="Loading more activity" /> : null}

      {events.length && errorState ? errorState : null}

      {showMore && !error ? (
        <div className={styles.more}>
          <Button
            size="md"
            appearance="outline"
            mode="neutral"
            aria-busy={loading || undefined}
            aria-describedby={leadId}
            onClick={loadMore}
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}

      <p role="status" className={styles.srOnly}>
        {announcement}
      </p>
    </section>
  );
}
