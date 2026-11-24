"use client";

import { useId } from "react";
import { ArrowDown, ArrowRight, ArrowUp, TrendingUp } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../LoadError";
import { cx } from "../shared/cx";
import type { ChangeItem, ChangeSummaryProps } from "./ChangeSummary.types";
import { groupBySentiment } from "./changeSummary.logic";
import styles from "./ChangeSummary.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ChangeSummaryProps, ChangeItem, ChangeDirection, ChangeSentiment, ChangeGroupBy } from "./ChangeSummary.types";

const DIRECTION_WORD = { up: "up", down: "down", flat: "unchanged" } as const;
/**
 * A compact "what moved" card for a period: each metric shows before → after and a delta. Good and bad
 * are set per metric, and direction and sentiment are always spelled out, never colour alone. An optional
 * summary sentence leads, rows can be grouped into Better and Worse, and each row can carry a one-line why.
 */
export function ChangeSummary({
  title = "What moved",
  period,
  items,
  summary,
  groupBy,
  onViewAll,
  viewAllLabel = "View full report",
  onAsk,
  emptyTitle = "Nothing to compare yet",
  emptyDescription = "Changes show after two full periods of data.",
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: ChangeSummaryProps) {
  const titleId = useId();
  const groupId = useId();
  const hasItems = items.length > 0;
  const ready = !loading && !error;
  const showPeriod = Boolean(period) && ready && (hasItems || Boolean(summary));
  const showActions = ready && (hasItems || Boolean(summary)) && (onViewAll || onAsk);
  return (
    <section {...rest} {...nisthaAttr("changesummary", rest)} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <TrendingUp size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.headerIcon} />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {showPeriod ? <span className={styles.period}>{period}</span> : null}
      </header>

      {loading ? (
        <div className={styles.loading}>
          {[0, 1, 2].map((row) => (
            <div key={row} className={styles.loadingRow}>
              <div className={styles.loadingLine}>
                <Skeleton width="45%" size="sm" />
                <Skeleton width="20%" size="sm" />
              </div>
              <Skeleton width="60%" size="sm" />
            </div>
          ))}
        </div>
      ) : error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : !hasItems && !summary ? (
        <Empty title={emptyTitle} description={emptyDescription} icon="TrendingUp" />
      ) : (
        <>
          {summary ? <p className={styles.summary}>{summary}</p> : null}
          {!hasItems ? null : groupBy === "sentiment" ? (
            groupBySentiment(items).map((group) => {
              const labelId = `${groupId}-${group.sentiment}`;
              return (
                <div key={group.sentiment} className={styles.group}>
                  <h4 id={labelId} className={styles.groupLabel}>
                    {group.label}
                    <Badge size="sm">
                      {String(group.items.length)}
                    </Badge>
                  </h4>
                  <ul className={styles.list} aria-labelledby={labelId}>
                    {group.items.map((item) => (
                      <Row key={item.id} item={item} />
                    ))}
                  </ul>
                </div>
              );
            })
          ) : (
            <ul className={styles.list} aria-labelledby={titleId}>
              {items.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </ul>
          )}
          {showActions ? (
            <div className={styles.actions}>
              {onViewAll ? (
                <Button appearance="outline" mode="neutral" size="sm" onClick={onViewAll}>
                  {viewAllLabel}
                </Button>
              ) : null}
              {onAsk ? (
                <Button appearance="outline" mode="neutral" size="sm" iconStart="MessageCircle" onClick={onAsk}>
                  Ask in Chat
                </Button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function Row({ item }: { item: ChangeItem }) {
  const sentiment = item.sentiment ?? "neutral";
  const Arrow = item.direction === "up" ? ArrowUp : item.direction === "down" ? ArrowDown : ArrowRight;
  const why = item.why ? ` ${item.why}.` : "";
  const spoken = `${item.label} ${DIRECTION_WORD[item.direction]} ${item.delta}, ${sentiment}. ${item.before} to ${item.after}.${why}`;
  return (
    <li className={styles.row}>
      <span className={styles.srOnly}>{spoken}</span>
      <span className={styles.main} aria-hidden="true">
        <span className={styles.label}>{item.label}</span>
        <span className={styles.values}>
          <span className={styles.before}>{item.before}</span>
          <ArrowRight size={12} strokeWidth={ICON_STROKE} className={styles.valuesArrow} />
          <span className={styles.after}>{item.after}</span>
          <span className={styles.sentiment}>· {sentiment}</span>
        </span>
        {item.why ? <span className={styles.why}>{item.why}</span> : null}
      </span>
      <span className={cx(styles.delta, styles[`delta_${sentiment}`])} aria-hidden="true">
        <Arrow size={12} strokeWidth={ICON_STROKE} />
        {item.delta}
      </span>
    </li>
  );
}
