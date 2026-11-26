"use client";

import { useId } from "react";
import { CirclePause, CircleX, Clock, LoaderCircle } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { RunningNowItem, RunningNowProps, RunningNowStatus } from "./RunningNow.types";
import styles from "./RunningNow.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { RunningNowProps, RunningNowItem, RunningNowStatus, RunningNowLayout } from "./RunningNow.types";

const STATUS_ICON = { running: LoaderCircle, waiting: CirclePause, failed: CircleX } as const;
const STATUS_TEXT: Record<RunningNowStatus, string> = { running: "Running", waiting: "Needs you", failed: "Failed" };

function Item({
  item,
  layout,
  onSelect,
  onStop,
}: {
  item: RunningNowItem;
  layout: "row" | "stack";
  onSelect?: (id: string) => void;
  onStop?: (id: string) => void;
}) {
  const Icon = STATUS_ICON[item.status];
  // The icon and the activity's colour show the state; the word is read to screen readers.
  const word = item.status === "running" ? null : <span className={styles.srOnly}>{STATUS_TEXT[item.status]}, </span>;
  const body = (
    <>
      <Icon size={14} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.name}>{item.name}</span>
        {/* No activity: the word stays for screen readers, with no empty visible line under the name. */}
        {item.activity ? (
          <span className={styles.sub}>
            {word}
            <span className={styles.activity}>{item.activity}</span>
          </span>
        ) : (
          word
        )}
      </span>
      {item.elapsed ? <span className={styles.elapsed}>{item.elapsed}</span> : null}
      {item.status === "running" ? <span className={styles.srOnly}>, {STATUS_TEXT.running}</span> : null}
    </>
  );
  const canStop = Boolean(onStop) && item.status !== "failed";
  return (
    <li className={styles.cell}>
      <span className={cx(styles.item, styles[layout === "row" ? "chip" : "line"], styles[item.status], canStop && styles.withStop)}>
        {onSelect ? (
          <button type="button" className={cx(styles.main, styles.button)} onClick={() => onSelect(item.id)}>
            {body}
          </button>
        ) : (
          <span className={styles.main}>{body}</span>
        )}
        {canStop ? (
          <Button
            size="sm"
            appearance="ghost"
            mode="neutral"
            iconStart="Square"
            className={styles.stop}
            ariaLabel={`Stop ${item.name}`}
            onClick={() => onStop?.(item.id)}
          />
        ) : null}
      </span>
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
  onStop,
  loading = false,
  emptyText = "Nothing running right now",
  idleText,
  className,
  ref,
  ...rest
}: RunningNowProps) {
  const labelId = useId();
  const limit = maxVisible ?? (layout === "row" ? 3 : 4);
  const visible = items.slice(0, limit);
  const hidden = Math.max(0, items.length - visible.length);
  // Idle: nothing runs and the person knows when it last did — no count, no icon, just the line.
  const idle = Boolean(idleText) && !loading && items.length === 0;

  return (
    <section
      {...rest} {...nisthaAttr("runningnow", rest)}
      ref={ref}
      className={cx(styles.strip, styles[`layout-${layout}`], className)}
      aria-labelledby={labelId}
      aria-busy={loading || undefined}
    >
      <div className={styles.head}>
        <h3 id={labelId} className={styles.label}>
          {label}
          {idle ? null : (
            <span className={styles.count} aria-hidden={loading || undefined}>
              {loading ? "…" : items.length}
            </span>
          )}
        </h3>
        {/* Row layout: the overflow is said in words on the label line, not as a lone "+N" chip. */}
        {layout === "row" && !loading && hidden > 0 ? (
          onShowAll ? (
            <button type="button" className={styles.headMore} onClick={onShowAll} aria-label={`${hidden} more running, view all`}>
              {hidden} more · View all
            </button>
          ) : (
            <span className={cx(styles.headMore, styles.headMoreText)}>{hidden} more</span>
          )
        ) : null}
      </div>
      {loading ? (
        <div className={styles.loading}>
          {Array.from({ length: 3 }, (_, index) =>
            layout === "row" ? (
              <Skeleton
                key={index}
                shape="rect"
                width={["calc(var(--space-16) + var(--space-12))", "calc(var(--space-16) + var(--space-8))", "calc(var(--space-16) + var(--space-12) + var(--space-2))"][index]}
                height="var(--space-8)"
              />
            ) : (
              <div key={index} className={styles.skeletonLine}>
                <Skeleton shape="circle" width="var(--space-4)" />
                <div className={styles.skeletonText}>
                  <Skeleton width="60%" size="sm" />
                  <Skeleton width="40%" size="sm" />
                </div>
              </div>
            ),
          )}
        </div>
      ) : idle ? (
        <p className={styles.empty}>{idleText}</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>
          <Clock size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          {emptyText}
        </p>
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => (
            <Item key={item.id} item={item} layout={layout} onSelect={onSelect} onStop={onStop} />
          ))}
          {hidden > 0 && layout === "stack" ? (
            <li className={styles.cell}>
              <button type="button" className={styles.viewAll} onClick={onShowAll} disabled={!onShowAll}>
                +{hidden} more running{onShowAll ? " · View all" : ""}
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
