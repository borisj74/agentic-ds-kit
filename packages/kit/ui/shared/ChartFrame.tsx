"use client";

import { BarChart3, Table2 } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import styles from "./ChartFrame.module.css";

export interface ChartFrameProps {
  title?: string;
  description?: string;
  legend?: ReactNode;
  children: ReactNode;
  table?: ReactNode;
  footnote?: string;
  isEmpty?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function ChartFrame({
  title,
  description,
  legend,
  children,
  table,
  footnote,
  isEmpty = false,
  emptyLabel = "No data for this range",
  isLoading = false,
  className = "",
}: ChartFrameProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const titleId = useId();
  const descriptionId = useId();
  const panelId = useId();
  const showTable = view === "table" && Boolean(table);

  return (
    <figure
      className={`${styles.frame} ${className}`.trim()}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {title || table ? (
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
          {table ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setView(showTable ? "chart" : "table")}
                aria-expanded={showTable}
                aria-controls={panelId}
              >
                {showTable ? <BarChart3 aria-hidden="true" size={14} /> : <Table2 aria-hidden="true" size={14} />}
                <span>{showTable ? "Chart" : "Table"}</span>
              </button>
            </div>
          ) : null}
        </figcaption>
      ) : null}

      {legend}

      <div
        id={panelId}
        className={`${styles.body}${isLoading ? ` ${styles.loading}` : ""}`}
      >
        {isEmpty ? <p className={styles.empty}>{emptyLabel}</p> : showTable ? table : children}
      </div>

      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </figure>
  );
}
