"use client";

import { useId } from "react";
import { CircleX } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LineChart } from "../LineChart";
import { Meter } from "../Meter";
import { Skeleton } from "../Skeleton";
import { UsageList } from "../UsageList";
import { cx } from "../shared/cx";
import type { UsageMeterProps } from "./UsageMeter.types";
import styles from "./UsageMeter.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { UsageMeterProps, UsageCategory, UsageOverage } from "./UsageMeter.types";

const num = (value: number) => value.toLocaleString("en-US");

/** Default share of the limit where the warning starts. */
export const USAGE_WARN_AT = 0.8;

/**
 * Plan usage and AI credits: total against the limit, usage by category, a daily line, and a warning
 * near the limit. Composes kit Meter, UsageList, LineChart and Alert.
 */
export function UsageMeter({
  title,
  used,
  limit,
  unit = "credits",
  categories = [],
  periodStart,
  resetLabel,
  daily = [],
  dailyLabels,
  dailyCap,
  warnAt = USAGE_WARN_AT,
  paceNote,
  overage,
  compact = false,
  onUpgrade,
  upgradeLabel = "Upgrade plan",
  onViewUsage,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: UsageMeterProps) {
  const titleId = useId();
  const share = limit > 0 ? used / limit : 0;
  const percent = Math.round(share * 100);
  const state = share >= 1 ? "exceeded" : share >= warnAt ? "warning" : "normal";
  const intent = state === "exceeded" ? "danger" : state === "warning" ? "warning" : "info";
  const left = Math.max(0, limit - used);
  const over = Math.max(0, used - limit);
  const meterLabel = over
    ? `${title}: ${num(used)} of ${num(limit)} ${unit}, ${num(over)} over the limit${overage ? `, ${overage.amount} overage so far` : ""}`
    : `${title}: ${num(used)} of ${num(limit)} ${unit}, ${percent}% used`;
  const labels = dailyLabels ?? daily.map((_, index) => String(index + 1));
  const today = daily.length ? daily[daily.length - 1] : undefined;
  const badge = (
    <Badge
      tone={state === "normal" ? "neutral" : state === "warning" ? "warning" : "danger"}
      size="sm"
      icon={compact && state !== "normal" ? (state === "warning" ? "TriangleAlert" : "CircleX") : undefined}
    >
      {state === "normal" ? `${percent}% used` : state === "warning" ? "Near limit" : over ? "Over limit" : "Limit reached"}
    </Badge>
  );
  const upgrade =
    onUpgrade && state !== "normal" ? (
      <Button size="md" className={compact ? styles.compactUpgrade : undefined} onClick={onUpgrade}>
        {upgradeLabel}
      </Button>
    ) : null;

  if (compact && !loading && !error) {
    const summary = [`${num(used)} of ${num(limit)} used`, resetLabel, paceNote].filter(Boolean).join(" · ");
    return (
      <section
        {...rest} {...nisthaAttr("usagemeter", rest)}
        ref={ref}
        className={cx(styles.card, styles.compact, className)}
        aria-labelledby={titleId}
      >
        <div className={styles.compactGrid}>
          <header className={styles.compactHead}>
            <h3 id={titleId} className={styles.title}>
              {title}
            </h3>
            {badge}
          </header>
          {upgrade}
          <p className={styles.summary}>{summary}</p>
          <div className={styles.compactMeter}>
            <Meter value={Math.min(100, percent)} intent={intent} size="md" label={meterLabel} />
          </div>
          {categories.length ? (
            <dl className={styles.categories} aria-label={`${title} by category`}>
              {categories.map((category) => (
                <div key={category.id} className={styles.category}>
                  <dt>{category.label}</dt>
                  <dd>{num(category.value)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section {...rest} {...nisthaAttr("usagemeter", rest)} ref={ref} className={cx(styles.card, compact && styles.compact, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {!loading && !error ? badge : null}
      </header>

      {loading ? (
        <div className={styles.loading}>
          <Skeleton width="45%" height="var(--space-8)" />
          <Skeleton width="100%" size="sm" />
          <Skeleton width="80%" size="sm" />
          <Skeleton shape="rect" width="100%" height="var(--space-16)" />
        </div>
      ) : error ? (
        <div className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.errorText}>{error}</span>
          {onRetry ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <p className={styles.figures}>
            <span className={styles.used}>{num(used)}</span>
            <span className={styles.limit}>
              / {num(limit)} {unit}
            </span>
          </p>
          <div className={styles.meterBlock}>
            <Meter value={Math.min(100, percent)} intent={intent} size="md" label={meterLabel} />
            {periodStart || resetLabel ? (
              <div className={styles.axis}>
                <span>{periodStart}</span>
                <span>
                  Limit {num(limit)}
                  {resetLabel ? ` · ${resetLabel}` : ""}
                </span>
              </div>
            ) : null}
          </div>

          {categories.length ? (
            <UsageList
              className={styles.list}
              label={`${title} by category`}
              hideLimit
              items={categories.map((category) => ({ id: category.id, label: category.label, used: category.value, limit, unit }))}
            />
          ) : null}

          {daily.length ? (
            <div className={styles.daily}>
              <LineChart
                className={styles.chart}
                variant="line"
                height={128}
                showGrid={false}
                includeZero
                labels={labels}
                tickInterval={Math.max(1, labels.length - 1)}
                series={[
                  { label: "Daily usage", data: daily, color: state === "normal" ? "var(--fill-brand)" : "var(--fill-warning)" },
                  ...(dailyCap ? [{ label: `Daily cap ${num(dailyCap)}`, data: daily.map(() => dailyCap), color: "var(--line-default)" }] : []),
                ]}
                title="Daily usage"
                description={today !== undefined ? `today ${num(today)}` : undefined}
              />
            </div>
          ) : null}

          {state !== "normal" ? (
            <Alert variant={state === "exceeded" ? "danger" : "warning"} title={state === "exceeded" ? (over ? `${num(over)} ${unit} over the limit` : "Limit reached") : `${num(left)} ${unit} left`}>
              {paceNote ??
                (state === "exceeded"
                  ? over && overage
                    ? `Requests keep running. Overage is billed at ${overage.rateLabel}: ${overage.amount} so far on the next invoice.`
                    : "New requests wait until the limit resets or you upgrade."
                  : "You are close to this period's limit.")}
            </Alert>
          ) : null}

          {onViewUsage || (onUpgrade && state !== "normal") ? (
            <footer className={styles.footer}>
              {onViewUsage ? (
                <Button size="md" appearance="outline" mode="neutral" onClick={onViewUsage}>
                  View usage
                </Button>
              ) : null}
              {upgrade}
            </footer>
          ) : null}
        </>
      )}
    </section>
  );
}
