"use client";

import { useId } from "react";
import { CirclePause, CircleX, Clock, LoaderCircle } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { RunningNowItem, RunningNowProps, RunningNowStatus } from "./RunningNow.types";
import styles from "./RunningNow.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { RunningNowProps, RunningNowItem, RunningNowStatus, RunningNowLayout } from "./RunningNow.types";

const STATUS_ICON = { running: LoaderCircle, waiting: CirclePause, failed: CircleX } as const;
const STATUS_TEXT: Record<RunningNowStatus, string> = { running: "running", waiting: "waiting for you", failed: "failed" };

function Item({
  item,
  layout,
  onSelect,
}: {
  item: RunningNowItem;
  layout: "row" | "stack";
  onSelect?: (id: string) => void;
}) {
  const Icon = STATUS_ICON[item.status];
  const body = (
    <>
      <Icon size={14} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.name}>{item.name}</span>
        {item.activity ? <span className={styles.activity}>{item.activity}</span> : null}
      </span>
      {item.elapsed ? <span className={styles.elapsed}>{item.elapsed}</span> : null}
      <span className={styles.srOnly}>, {STATUS_TEXT[item.status]}</span>
    </>
  );
  const className = cx(styles.item, styles[layout === "row" ? "chip" : "line"], styles[item.status]);
  return (
    <li className={styles.cell}>
      {onSelect ? (
        <button type="button" className={cx(className, styles.button)} onClick={() => onSelect(item.id)}>
          {body}
        </button>
      ) : (
        <span className={className}>{body}</span>
      )}
    </li>
  );
}

/** Many agents, small: a strip for a header (row) or a sidebar (stack). AgentMonitor shows one agent in detail. */
export function RunningNow({
  items,
  layout = "row",
  maxVisible,
  label = "Running now",
  onSelect,
  onShowAll,
  loading = false,
  emptyText = "Nothing running right now",
  className,
  ref,
  ...rest
}: RunningNowProps) {
  const labelId = useId();
  const limit = maxVisible ?? (layout === "row" ? 3 : 4);
  const visible = items.slice(0, limit);
  const hidden = Math.max(0, items.length - visible.length);

  return (
    <section
      {...rest} {...nisthaAttr("runningnow", rest)}
      ref={ref}
      className={cx(styles.strip, styles[`layout-${layout}`], className)}
      aria-labelledby={labelId}
      aria-busy={loading || undefined}
    >
      <h3 id={labelId} className={styles.label}>
        {label}
        <span className={styles.count} aria-hidden={loading || undefined}>
          {loading ? "…" : items.length}
        </span>
      </h3>
      {loading ? (
        <div className={styles.loading}>
          {Array.from({ length: 3 }, (_, index) =>
            layout === "row" ? (
              <Skeleton key={index} shape="rect" width="calc(var(--space-16) * 2)" height="var(--space-8)" />
            ) : (
              <div key={index} className={styles.skeletonLine}>
                <Skeleton shape="circle" size="sm" />
                <div className={styles.skeletonText}>
                  <Skeleton width="70%" />
                  <Skeleton width="45%" size="sm" />
                </div>
              </div>
            ),
          )}
        </div>
      ) : items.length === 0 ? (
        <p className={styles.empty}>
          <Clock size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
          {emptyText}
        </p>
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => (
            <Item key={item.id} item={item} layout={layout} onSelect={onSelect} />
          ))}
          {hidden > 0 ? (
            <li className={styles.cell}>
              {layout === "row" ? (
                <button
                  type="button"
                  className={cx(styles.item, styles.chip, styles.more, onShowAll && styles.button)}
                  onClick={onShowAll}
                  disabled={!onShowAll}
                  aria-label={`${hidden} more running${onShowAll ? ", view all" : ""}`}
                >
                  +{hidden}
                </button>
              ) : (
                <button type="button" className={styles.viewAll} onClick={onShowAll} disabled={!onShowAll}>
                  +{hidden} more running{onShowAll ? " · View all" : ""}
                </button>
              )}
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
