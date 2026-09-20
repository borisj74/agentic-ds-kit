import { CircleAlert, TriangleAlert } from "lucide-react";
import { Progress } from "../Progress";
import type { UsageListItem, UsageListProps } from "./UsageList.types";
import styles from "./UsageList.module.css";

export type { UsageListItem, UsageListProps } from "./UsageList.types";

const WARN_AT = 0.8;

type Threshold = "ok" | "warning" | "danger";

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return value.toLocaleString("en-US");
  const decimals = String(value).split(".")[1]?.length ?? 0;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function figuresText(item: UsageListItem): string {
  const used = formatAmount(item.used);
  const limit = formatAmount(item.limit);
  const base = `${used} of ${limit}`;
  return item.unit ? `${base} ${item.unit}` : base;
}

function usageRatio(item: UsageListItem): number {
  const used = Number.isFinite(item.used) ? item.used : 0;
  if (!Number.isFinite(item.limit) || item.limit <= 0) {
    return used > 0 ? Number.POSITIVE_INFINITY : 0;
  }
  return used / item.limit;
}

function thresholdOf(ratio: number): Threshold {
  if (ratio >= 1) return "danger";
  if (ratio >= WARN_AT) return "warning";
  return "ok";
}

function statusCopy(level: Threshold): string | undefined {
  if (level === "warning") return "Almost at limit";
  if (level === "danger") return "Limit reached";
  return undefined;
}

function barTone(level: Threshold): "brand" | "warning" | "danger" {
  if (level === "warning") return "warning";
  if (level === "danger") return "danger";
  return "brand";
}

export function UsageList({ items, label = "Usage" }: UsageListProps) {
  return (
    <div className={styles.root} role="list" aria-label={label}>
      {items.map((item) => {
        const ratio = usageRatio(item);
        const level = thresholdOf(ratio);
        const figures = figuresText(item);
        const status = statusCopy(level);
        const percent = ratio * 100;
        const ariaLabel = status ? `${item.label}, ${figures}, ${status}` : `${item.label}, ${figures}`;
        const Icon = level === "danger" ? CircleAlert : level === "warning" ? TriangleAlert : null;

        return (
          <div key={item.id} className={styles.item} role="listitem">
            <div className={styles.header}>
              <span className={styles.name}>{item.label}</span>
              <span className={styles.figures}>
                {Icon ? (
                  <Icon
                    className={level === "danger" ? styles.iconDanger : styles.iconWarning}
                    size={16}
                    strokeWidth={2}
                    aria-hidden
                  />
                ) : null}
                <span className={styles.amount}>{figures}</span>
                {status ? <span className={styles.srOnly}>{status}</span> : null}
              </span>
            </div>
            <Progress value={percent} showValue={false} tone={barTone(level)} ariaLabel={ariaLabel} />
            {item.note ? <p className={styles.note}>{item.note}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
