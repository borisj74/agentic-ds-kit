"use client";

import { useId, useState } from "react";
import { Check, CircleCheck, CircleHelp, CircleX, Inbox, ShieldAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { ApprovalCard } from "../ApprovalCard";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { DecisionCard } from "../DecisionCard";
import { Empty } from "../Empty";
import { SegmentedControl } from "../SegmentedControl";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { AgentInboxFilter, AgentInboxItem, AgentInboxItemType, AgentInboxProps } from "./AgentInbox.types";
import styles from "./AgentInbox.module.css";

export type { AgentInboxProps, AgentInboxItem, AgentInboxItemType, AgentInboxFilter } from "./AgentInbox.types";

const TYPE_LABEL: Record<AgentInboxItemType, string> = {
  approval: "Approval",
  question: "Question",
  failure: "Failure",
  recap: "Recap",
};

const FILTER_LABEL: Record<AgentInboxFilter, string> = {
  all: "All",
  approval: "Approvals",
  question: "Questions",
  failure: "Failures",
  recap: "Recaps",
};

const TYPE_ICON = { approval: ShieldAlert, question: CircleHelp, failure: CircleX, recap: CircleCheck } as const;

const EMPTY_FILTER: Record<Exclude<AgentInboxFilter, "all">, string> = {
  approval: "No approvals waiting",
  question: "No questions waiting",
  failure: "No failed runs",
  recap: "No recaps yet",
};

type DetailHandlers = Pick<
  AgentInboxProps,
  "onApprove" | "onDeny" | "onAnswer" | "onRetryItem" | "onViewDiff" | "onOpenTrail" | "renderDetail"
>;

function Detail({ item, props }: { item: AgentInboxItem; props: DetailHandlers }) {
  const [answer, setAnswer] = useState("");
  if (props.renderDetail) return <>{props.renderDetail(item)}</>;

  if (item.type === "approval" && item.approval) {
    return (
      <ApprovalCard
        className={styles.embedded}
        title={item.approval.title}
        description={item.approval.description}
        risk={item.approval.risk}
        action={item.approval.action}
        onApprove={() => props.onApprove?.(item.id)}
        onDeny={() => props.onDeny?.(item.id)}
      />
    );
  }

  if (item.type === "question" && item.question) {
    return (
      <DecisionCard
        className={styles.embedded}
        title={`${item.agentName} asks`}
        meta={item.question.meta}
        question={item.question.question}
        options={item.question.options}
        allowFreeText={item.question.allowFreeText}
        value={answer}
        onValueChange={setAnswer}
        onConfirm={() => props.onAnswer?.(item.id, answer)}
      />
    );
  }

  const Icon = TYPE_ICON[item.type];
  return (
    <div className={cx(styles.detail, styles[item.type])}>
      <p className={styles.detailHead}>
        <Icon size={16} strokeWidth={ICON_STROKE} className={styles.detailIcon} aria-hidden="true" />
        <span className={styles.detailTitle}>{item.detail?.heading ?? `${item.agentName} · ${item.type === "recap" ? "done" : "failed"}`}</span>
        {item.detail?.meta ? <span className={styles.detailMeta}>{item.detail.meta}</span> : null}
      </p>
      {item.detail?.lines?.length ? (
        <ul className={styles.lines}>
          {item.detail.lines.map((line) => (
            <li key={line} className={styles.line}>
              {item.type === "recap" ? <Check size={14} strokeWidth={ICON_STROKE} aria-hidden="true" /> : null}
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.preview}>{item.preview}</p>
      )}
      <div className={styles.detailActions}>
        {item.type === "recap" && props.onViewDiff ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="FileDiff" onClick={() => props.onViewDiff?.(item.id)}>
            View diff
          </Button>
        ) : null}
        {item.type === "failure" && props.onRetryItem ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={() => props.onRetryItem?.(item.id)}>
            Retry run
          </Button>
        ) : null}
        {props.onOpenTrail ? (
          <Button size="sm" appearance="ghost" mode="neutral" iconStart="ArrowRight" onClick={() => props.onOpenTrail?.(item.id)}>
            Open trail
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** A queue of what agents need from you: approvals, questions, failed runs and finished recaps. A row opens its detail. */
export function AgentInbox(props: AgentInboxProps) {
  const {
    items,
    title = "Agent inbox",
    selectedId,
    onSelect,
    filter = "all",
    onFilterChange,
    onMarkAllRead,
    onApprove,
    onDeny,
    onAnswer,
    onRetryItem,
    onViewDiff,
    onOpenTrail,
    renderDetail,
    loading = false,
    error,
    onRetry,
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const detailId = useId();
  const unread = items.filter((item) => !item.read).length;
  const shown = filter === "all" ? items : items.filter((item) => item.type === filter);
  const selected = shown.find((item) => item.id === selectedId);
  const counts = (key: AgentInboxFilter) => (key === "all" ? items.length : items.filter((item) => item.type === key).length);

  let body;
  if (loading) {
    body = (
      <div className={styles.loading} aria-busy="true">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className={styles.skeletonRow}>
            <Skeleton shape="circle" size="sm" />
            <div className={styles.skeletonText}>
              <Skeleton width="45%" />
              <Skeleton width="85%" size="sm" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <div className={styles.error} role="alert">
        <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span className={styles.errorText}>{error}</span>
        {onRetry ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  } else if (items.length === 0) {
    body = <Empty icon="Inbox" title="All caught up" description="Approvals, questions, failures and recaps from your agents land here." />;
  } else if (shown.length === 0) {
    body = (
      <Empty
        icon="Filter"
        title={EMPTY_FILTER[filter as Exclude<AgentInboxFilter, "all">]}
        description="Agents ask here when they need you. Clear the filter to see everything."
      />
    );
  } else {
    body = (
      <div className={styles.split}>
        <ul className={styles.list} aria-label={`${FILTER_LABEL[filter]} items`}>
          {shown.map((item) => {
            const Icon = TYPE_ICON[item.type];
            const isSelected = item.id === selectedId;
            return (
              <li key={item.id} className={styles.cell}>
                <button
                  type="button"
                  className={cx(styles.row, styles[item.type], isSelected && styles.selected)}
                  aria-current={isSelected ? "true" : undefined}
                  aria-controls={isSelected ? detailId : undefined}
                  onClick={() => onSelect?.(item.id)}
                >
                  <span className={styles.unreadSlot} aria-hidden="true">
                    {!item.read ? <span className={styles.unread} /> : null}
                  </span>
                  <Icon size={16} strokeWidth={ICON_STROKE} className={styles.typeIcon} aria-hidden="true" />
                  <span className={styles.rowText}>
                    <span className={styles.rowHead}>
                      <span className={styles.agent}>{item.agentName}</span>
                      <span className={styles.type}>· {TYPE_LABEL[item.type]}</span>
                      {!item.read ? <span className={styles.srOnly}>, unread</span> : null}
                      {item.time ? <span className={styles.time}>{item.time}</span> : null}
                    </span>
                    <span className={styles.rowPreview}>{item.preview}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div id={detailId} className={styles.pane} role="region" aria-label="Item detail" aria-live="polite">
          {selected ? (
            <div key={selected.id} className={styles.paneInner}>
              <Detail item={selected} props={{ onApprove, onDeny, onAnswer, onRetryItem, onViewDiff, onOpenTrail, renderDetail }} />
            </div>
          ) : (
            <p className={styles.hint}>Select an item to see the detail.</p>
          )}
        </div>
      </div>
    );
  }

  const filters: AgentInboxFilter[] = ["all", "approval", "question", "failure", "recap"];

  return (
    <section {...rest} ref={ref} className={cx(styles.inbox, className)} aria-labelledby={titleId}>
      <header className={styles.header}>
        <Inbox size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {unread && !loading && !error ? (
          <Badge tone="primary" size="sm">
            {`${unread} unread`}
          </Badge>
        ) : null}
      </header>
      {items.length > 0 && !loading && !error ? (
        <div className={styles.toolbar}>
          {onFilterChange ? (
            <SegmentedControl
              size="sm"
              ariaLabel="Filter"
              value={filter}
              onChange={(value) => onFilterChange(value as AgentInboxFilter)}
              items={filters.map((key) => ({ value: key, label: `${FILTER_LABEL[key]} ${counts(key)}` }))}
            />
          ) : (
            <span />
          )}
          {onMarkAllRead && unread ? (
            <Button size="sm" appearance="ghost" mode="neutral" iconStart="Check" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          ) : null}
        </div>
      ) : null}
      {body}
    </section>
  );
}
