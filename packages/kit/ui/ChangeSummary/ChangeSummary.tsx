"use client";

import { useId } from "react";
import { ArrowDown, ArrowRight, ArrowUp, TrendingUp } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { ChangeItem, ChangeSummaryProps } from "./ChangeSummary.types";
import styles from "./ChangeSummary.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ChangeSummaryProps, ChangeItem, ChangeDirection, ChangeSentiment } from "./ChangeSummary.types";

const DIRECTION_WORD = { up: "up", down: "down", flat: "unchanged" } as const;

/**
 * A compact "what moved" card for a period: each metric shows before → after and a delta pill. Good and bad
 * are set per metric, and direction and sentiment are always spelled out, never colour alone.
 */
export function ChangeSummary({
  title = "What moved",
  period,
  items,
  onViewAll,
  viewAllLabel = "View full report",
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
  const showPeriod = Boolean(period) && !loading && !error && items.length > 0;
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
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className={styles.loadingRow}>
              <Skeleton width="40%" size="sm" />
              <Skeleton width="27%" size="sm" />
            </div>
          ))}
        </div>
      ) : error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <Empty title={emptyTitle} description={emptyDescription} icon="TrendingUp" />
      ) : (
        <>
          <ul className={styles.list} aria-labelledby={titleId}>
            {items.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
          {onViewAll ? (
            <button type="button" className={styles.viewAll} onClick={onViewAll}>
              {viewAllLabel}
              <ArrowRight size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

function Row({ item }: { item: ChangeItem }) {
  const sentiment = item.sentiment ?? "neutral";
  const Arrow = item.direction === "up" ? ArrowUp : item.direction === "down" ? ArrowDown : ArrowRight;
  const spoken = `${item.label} ${DIRECTION_WORD[item.direction]} ${item.delta}, ${sentiment}. ${item.before} to ${item.after}.`;
  return (
    <li className={styles.row}>
      <span className={styles.srOnly}>{spoken}</span>
      <span className={styles.main} aria-hidden="true">
        <span className={styles.label}>{item.label}</span>
        <span className={styles.values}>
          <span className={styles.before}>{item.before}</span>
          <ArrowRight size={12} strokeWidth={ICON_STROKE} className={styles.valuesArrow} />
          <span className={styles.after}>{item.after}</span>
          <span className={cx(styles.sentiment, styles[sentiment])}>· {sentiment}</span>
        </span>
      </span>
      <span className={cx(styles.delta, styles[`delta_${sentiment}`])} aria-hidden="true">
        <Arrow size={12} strokeWidth={ICON_STROKE} />
        {item.delta}
      </span>
    </li>
  );
}
