"use client";

import { useId, useState } from "react";
import { useChartSize } from "../shared/useChartSize";
import { Check } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { NumberTransition } from "../NumberTransition";
import { SegmentedControl } from "../SegmentedControl";
import { TileGroup } from "../TileGroup";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../LoadError";
import { cx } from "../shared/cx";
import type { PricingPlan, PricingPlansProps } from "./PricingPlans.types";
import styles from "./PricingPlans.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { PricingPlansProps, PricingPlan, PricingInterval } from "./PricingPlans.types";

/** Width in rem below which the plans become a TileGroup. */
const COMPACT_REM = 30;

const rootFontSize = () =>
  typeof window === "undefined" ? 16 : Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;

/**
 * An in-product plan comparison for upgrades, not a marketing page: a Monthly / Yearly switch, one card per
 * plan with price, features and one CTA. Recommended and current are words. Built on kit SegmentedControl,
 * Badge, Button and NumberTransition. Below 30rem the cards become a kit TileGroup with one button.
 */
export function PricingPlans({
  plans,
  interval,
  onIntervalChange,
  onSelect,
  title = "Choose a plan",
  description,
  savingsLabel,
  footnote,
  currency = "$",
  unitLabel = "/ seat / month",
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: PricingPlansProps) {
  const titleId = useId();
  const yearly = interval === "year";
  // Below 30rem of width the cards become one TileGroup and one button. Only one of the two is rendered,
  // so there is never more than one solid primary; before measuring (SSR) the cards show.
  const { ref: measureRef, width } = useChartSize(0);
  const compact = width > 0 && width < COMPACT_REM * rootFontSize();
  const choosable = plans.filter((plan) => !plan.current);
  const [picked, setPicked] = useState<string | undefined>(undefined);
  const pickedPlan =
    plans.find((plan) => plan.id === picked && !plan.current) ?? choosable.find((plan) => plan.recommended) ?? choosable[0];
  const priceOf = (plan: PricingPlan) => (yearly && plan.yearlyPrice !== undefined ? plan.yearlyPrice : plan.price);
  const savePercent = (plan: PricingPlan) =>
    plan.yearlyPrice !== undefined && plan.price > 0 ? Math.round((1 - plan.yearlyPrice / plan.price) * 100) : 0;

  return (
    <section
      {...rest}
      {...nisthaAttr("pricingplans", rest)}
      ref={ref}
      className={cx(styles.root, className)}
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {!error ? (
          <div className={styles.interval}>
            <SegmentedControl
              size="sm"
              ariaLabel="Billing interval"
              value={interval}
              onChange={(value) => onIntervalChange(value === "year" ? "year" : "month")}
              disabled={loading}
              items={[
                { value: "month", label: "Monthly" },
                { value: "year", label: "Yearly" },
              ]}
            />
            {savingsLabel ? <span className={styles.savings}>{savingsLabel}</span> : null}
          </div>
        ) : null}
      </header>

      {loading ? (
        <div className={styles.grid}>
          {[0, 1, 2].map((card) => (
            <Skeleton key={card} shape="rect" width="100%" height="calc(var(--space-16) * 4)" />
          ))}
        </div>
      ) : error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : (
        <div ref={measureRef} className={styles.body}>
          {compact ? null : (
            <ul className={styles.grid} aria-label="Plans">
              {plans.map((plan) => {
                const price = yearly && plan.yearlyPrice !== undefined ? plan.yearlyPrice : plan.price;
                const save = yearly ? savePercent(plan) : 0;
                // Only the recommended plan is highlighted; the current plan is said by its neutral Badge.
                const highlight = plan.recommended && !plan.current;
                const nameId = `${titleId}-${plan.id}`;
                return (
                  <li key={plan.id} className={cx(styles.plan, highlight && styles.planHighlight)}>
                    <div className={styles.planHead}>
                      <h4 id={nameId} className={styles.planName}>
                        {plan.name}
                      </h4>
                      {plan.current ? (
                        <Badge tone="neutral" size="sm">
                          Current plan
                        </Badge>
                      ) : plan.recommended ? (
                        <Badge tone="info" size="sm">
                          Recommended
                        </Badge>
                      ) : null}
                    </div>
                    {plan.tagline ? <p className={styles.tagline}>{plan.tagline}</p> : null}
                    {plan.fit ? <p className={styles.fit}>{plan.fit}</p> : null}
                    <p className={styles.price}>
                      <NumberTransition
                        className={styles.amount}
                        size="lg"
                        value={price}
                        format={(value) => `${currency}${value}`}
                        label={`${plan.name}: ${currency}${price} ${unitLabel.replace(/\//g, "per").trim()}`}
                      />
                      <span className={styles.unit} aria-hidden="true">
                        {unitLabel}
                      </span>
                    </p>
                    <p className={styles.billed}>{yearly ? `billed yearly${save ? ` · save ${save}%` : ""}` : "billed monthly"}</p>
                    <Button
                      block
                      size="md"
                      appearance={plan.recommended && !plan.current ? "solid" : "outline"}
                      mode={plan.recommended && !plan.current ? "primary" : "neutral"}
                      disabled={plan.current}
                      aria-describedby={nameId}
                      onClick={() => onSelect(plan.id)}
                    >
                      {plan.current ? "Current plan" : (plan.ctaLabel ?? `Choose ${plan.name}`)}
                    </Button>
                    <ul className={styles.features} aria-label={`${plan.name} includes`}>
                      {plan.features.map((feature) => (
                        <li key={feature} className={styles.feature}>
                          <Check size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.check} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
          {compact ? (
            <div className={styles.compact}>
              <TileGroup
                ariaLabel="Plans"
                value={pickedPlan?.id}
                onChange={setPicked}
                items={plans.map((plan) => ({
                  value: plan.id,
                  title: plan.recommended && !plan.current ? `${plan.name} · Recommended` : plan.name,
                  description: [plan.current ? "Current plan" : null, plan.fit ?? plan.tagline].filter(Boolean).join(" · ") || undefined,
                  meta: `${currency}${priceOf(plan)}`,
                  disabled: plan.current,
                }))}
              />
              {pickedPlan ? (
                <Button block size="lg" onClick={() => onSelect(pickedPlan.id)}>
                  {pickedPlan.ctaLabel ?? `Choose ${pickedPlan.name}`}
                </Button>
              ) : null}
            </div>
          ) : null}
          {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
        </div>
      )}
    </section>
  );
}
