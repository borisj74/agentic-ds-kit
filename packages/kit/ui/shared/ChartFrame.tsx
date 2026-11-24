"use client";

import { BarChart3, Table2 } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { useId, useState, type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";
import { cx } from "./cx";
import { LoadError } from "../LoadError";
import styles from "./ChartFrame.module.css";

/** Figure attributes the frame sets itself (`title` is the chart heading, not a tooltip). */
export type ChartFrameOwnedKeys = "children" | "title" | "aria-labelledby" | "aria-describedby";

/** `ref`, `className` and other attributes land on the root `<figure>`. */
export interface ChartFrameProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  title?: string;
  description?: string;
  legend?: ReactNode;
  /** Kit Buttons in the header, before the Table toggle (e.g. an icon-only Ask). */
  actions?: ReactNode;
  children: ReactNode;
  table?: ReactNode;
  footnote?: string;
  isEmpty?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  /** When set, the body shows the kit's "Couldn't load" row in place of the chart. */
  error?: string;
  /** Shows Retry on the error row. */
  onRetry?: () => void;
  className?: string;
  ref?: Ref<HTMLElement>;
}

export function ChartFrame({
  title,
  description,
  legend,
  actions,
  children,
  table,
  footnote,
  isEmpty = false,
  emptyLabel = "No data for this range",
  isLoading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: ChartFrameProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const titleId = useId();
  const descriptionId = useId();
  const panelId = useId();
  const showTable = view === "table" && Boolean(table);
  const hasChrome = Boolean(title || description || table || footnote || legend || actions);

  return (
    <figure
      {...rest}
      ref={ref}
      className={cx(hasChrome ? styles.frame : styles.flush, className)}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {title || table || actions ? (
        <figcaption className={styles.header}>
          <div className={styles.heading}>
            {title ? (
              <h3 id={titleId} className={styles.title}>
                {title}
              </h3>
            ) : null}
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          {table || actions ? (
            <div className={styles.actions}>
              {actions}
              {table ? (
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setView(showTable ? "chart" : "table")}
                aria-expanded={showTable}
                aria-controls={panelId}
              >
                {showTable ? (
                  <BarChart3 aria-hidden="true" size={14} strokeWidth={ICON_STROKE} />
                ) : (
                  <Table2 aria-hidden="true" size={14} strokeWidth={ICON_STROKE} />
                )}
                <span>{showTable ? "Chart" : "Table"}</span>
              </button>
              ) : null}
            </div>
          ) : null}
        </figcaption>
      ) : null}

      {legend}

      <div
        id={panelId}
        className={`${styles.body}${isLoading && !error ? ` ${styles.loading}` : ""}`}
        aria-busy={isLoading && !error ? true : undefined}
      >
        {error ? (
          <LoadError message={error} onRetry={onRetry} />
        ) : isEmpty ? (
          <p className={styles.empty}>{emptyLabel}</p>
        ) : showTable ? (
          table
        ) : (
          children
        )}
      </div>

      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </figure>
  );
}
