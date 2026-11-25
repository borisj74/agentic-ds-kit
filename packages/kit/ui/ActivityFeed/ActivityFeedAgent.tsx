"use client";

import { useEffect, useId, useMemo, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { CircleAlert, Lock, Undo2 } from "lucide-react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import { agentSteps, groupByDay, plural, timeLabel, undoLeft } from "./activityFeed.logic";
import type { ActivityAgentEvent, ActivityFeedAgentProps } from "./ActivityFeed.types";
import styles from "./ActivityFeed.module.css";
import { nisthaAttr } from "../shared/inspect";

const FEED_ONLY = new Set([
  "variant",
  "filters",
  "defaultFilters",
  "onFiltersChange",
  "onOpen",
  "onReply",
  "statusChips",
  "statusChip",
  "onStatusChipChange",
]);

/**
 * variant="agent": an agent's steps on the shared history rail. Each step is a time column (wide), an
 * Avatar marker, the sentence, a meta line and a reason, with Undo and its deadline, or an Undone or
 * Final Badge, at the row end. Below 40rem of block width the time joins the meta line and the end
 * column moves under the copy. No built-in filters: the page puts a FilterBar above it.
 */
export function ActivityFeedAgent(props: ActivityFeedAgentProps) {
  const {
    events,
    onLoadMore,
    hasMore = false,
    loading = false,
    now: nowProp,
    locale = "en-GB",
    timeZone,
    title = "Activity",
    description,
    error,
    onRetry,
    className,
    ref,
    ...others
  } = props;
  // Feed-only props (filters, Open, Reply, status chips) have no effect here and stay off the section.
  const rest = Object.fromEntries(
    Object.entries(others).filter(([key]) => !FEED_ONLY.has(key)),
  ) as ComponentPropsWithoutRef<"section">;
  const uid = useId();
  const titleId = `${uid}-title`;
  const leadId = `${uid}-lead`;
  const [renderedAt] = useState(() => Date.now());
  const now = nowProp ?? renderedAt;
  const [announcement, setAnnouncement] = useState("");
  const pending = useRef<Set<string> | null>(null);
  const undoing = useRef<string | null>(null);
  const eventRefs = useRef(new Map<string, HTMLLIElement>());

  const shown = useMemo(() => agentSteps(events), [events]);
  const days = useMemo(() => groupByDay(shown, now, locale, timeZone), [shown, now, locale, timeZone]);
  const showMore = Boolean(onLoadMore && hasMore);

  function loadMore() {
    if (loading || !onLoadMore) return;
    pending.current = new Set(events.map((event) => event.id));
    setAnnouncement("");
    onLoadMore();
  }

  useEffect(() => {
    const before = pending.current;
    if (!before || loading) return;
    pending.current = null;
    const added = shown.filter((event) => !before.has(event.id));
    setAnnouncement(added.length ? `${plural(added.length, "more step")} loaded.${hasMore ? "" : " That's all the steps."}` : "No more steps.");
    if (!hasMore && added.length) eventRefs.current.get(added[0].id)?.focus();
  }, [shown, loading, hasMore]);

  // Undo removes its own button. Once the page marks the step undone, focus moves to that step so it
  // isn't lost, and the struck row (with its Undone Badge) is what a keyboard user lands on.
  useEffect(() => {
    const id = undoing.current;
    if (!id) return;
    const event = events.find((entry) => entry.id === id);
    if (event?.state === "undone") {
      undoing.current = null;
      eventRefs.current.get(id)?.focus();
    }
  }, [events]);

  function renderStep(event: ActivityAgentEvent, index: number, dayEvents: ActivityAgentEvent[]) {
    const id = `${uid}-${event.id}`;
    const time = typeof event.at === "number" ? event.at : Date.parse(event.at);
    const clock = timeLabel(time, locale, timeZone);
    const iso = new Date(time).toISOString();
    const last = index === dayEvents.length - 1;
    const left = event.undo && !event.state ? undoLeft(event.undo.until, now, locale, timeZone) : null;
    const undone = event.state === "undone";
    const final = event.state === "final";
    const line = event.reason ?? event.note;
    return (
      <li
        key={event.id}
        ref={(el) => {
          if (el) eventRefs.current.set(event.id, el);
          else eventRefs.current.delete(event.id);
        }}
        className={cx(styles.agentEvent, event.state && event.note && styles.agentFolds)}
        tabIndex={-1}
      >
        <time className={styles.agentTime} dateTime={iso}>
          {clock}
        </time>
        <span className={styles.agentRail} aria-hidden="true">
          <Avatar name={event.actor.name} initials={event.actor.initials} size="sm" />
          {last ? null : <span className={styles.railLine} />}
        </span>
        <div className={styles.agentBody}>
          <p id={`${id}-sentence`} className={cx(styles.agentSentence, undone && styles.agentStruck)}>
            {event.sentence}
          </p>
          <p className={styles.agentMeta}>
            <span className={styles.agentMetaTime}>
              <time dateTime={iso}>{clock}</time> ·{" "}
            </span>
            {event.meta}
          </p>
          {line ? <p className={styles.agentReason}>{line}</p> : null}
        </div>
        {left ? (
          <div className={styles.agentEnd}>
            <Button
              size="sm"
              appearance="outline"
              mode="neutral"
              iconStart={Undo2}
              aria-describedby={`${id}-sentence ${id}-until`}
              onClick={() => {
                undoing.current = event.id;
                event.undo?.onUndo();
              }}
            >
              Undo
            </Button>
            <span id={`${id}-until`} className={styles.agentDeadline}>
              {left}
            </span>
          </div>
        ) : undone || final ? (
          <div className={styles.agentEnd}>
            <Badge size="sm" appearance="soft" tone="neutral" icon={undone ? Undo2 : Lock}>
              {undone ? "Undone" : "Final"}
            </Badge>
            {event.note ? <span className={styles.agentNote}>{event.note}</span> : null}
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
    body = (
      <ul className={styles.skeletons} aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className={styles.skeletonRow}>
            <Skeleton shape="circle" size="sm" label={index === 0 ? "Loading activity" : ""} />
            <span className={styles.skeletonCopy}>
              <Skeleton lines={2} size="sm" label="" />
            </span>
          </li>
        ))}
      </ul>
    );
  } else if (!events.length) {
    body = <Empty outlined icon="Activity" title="No steps yet" description="Steps your agents take show here as they happen." />;
  } else {
    body = (
      <div className={styles.agentDays}>
        {days.map((day) => (
          <section key={day.key} className={styles.agentDay} aria-labelledby={`${uid}-day-${day.key}`}>
            <h3 id={`${uid}-day-${day.key}`} className={styles.agentDayTitle}>
              {day.label}
              <span className={styles.srOnly}>, {plural(day.events.length, "step")}</span>
            </h3>
            <ol className={styles.agentList}>{day.events.map(renderStep)}</ol>
          </section>
        ))}
      </div>
    );
  }

  return (
    <section
      {...rest}
      {...nisthaAttr("activityfeed", rest)}
      ref={ref}
      className={cx(styles.root, styles.agent, className)}
      aria-labelledby={titleId}
    >
      {/* The page's PageHeader names the screen, so the block's heading and count are for screen readers. */}
      <header className={styles.srOnly}>
        <h2 id={titleId}>{title}</h2>
        <p id={leadId}>{description ?? (events.length ? plural(events.length, "step") : "No steps yet")}</p>
      </header>

      {body}

      {loading && events.length ? (
        <ul className={styles.skeletons} aria-busy="true">
          {[0, 1].map((index) => (
            <li key={index} className={styles.skeletonRow}>
              <Skeleton shape="circle" size="sm" label={index === 0 ? "Loading more steps" : ""} />
              <span className={styles.skeletonCopy}>
                <Skeleton lines={2} size="sm" label="" />
              </span>
            </li>
          ))}
        </ul>
      ) : null}

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
            {loading ? "Loading…" : "Load earlier days"}
          </Button>
        </div>
      ) : null}

      <p role="status" className={styles.srOnly}>
        {announcement}
      </p>
    </section>
  );
}
