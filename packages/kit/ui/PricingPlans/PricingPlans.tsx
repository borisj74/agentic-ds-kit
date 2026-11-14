"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { NumberTransition } from "../NumberTransition";
import { SegmentedControl } from "../SegmentedControl";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { PricingPlan, PricingPlansProps } from "./PricingPlans.types";
import styles from "./PricingPlans.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { PricingPlansProps, PricingPlan, PricingInterval } from "./PricingPlans.types";

/**
 * An in-product plan comparison for upgrades, not a marketing page: a Monthly / Yearly switch, one card per
 * plan with price, features and one CTA. Recommended and current are words. Built on kit SegmentedControl,
 * Badge, Button and NumberTransition.
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
  const savePercent = (plan: PricingPlan) =>
    plan.yearlyPrice !== undefined && plan.price > 0 ? Math.round((1 - plan.yearlyPrice / plan.price) * 100) : 0;

  return (
    <section {...rest} {...nisthaAttr("pricingplans", rest)} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
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
        <>
          <ul className={styles.grid} aria-label="Plans">
            {plans.map((plan) => {
              const price = yearly && plan.yearlyPrice !== undefined ? plan.yearlyPrice : plan.price;
              const save = yearly ? savePercent(plan) : 0;
              const highlight = plan.current || plan.recommended;
              const nameId = `${titleId}-${plan.id}`;
              return (
                <li key={plan.id} className={cx(styles.plan, highlight && styles.planHighlight)}>
                  <div className={styles.planHead}>
                    <h4 id={nameId} className={styles.planName}>
                      {plan.name}
                    </h4>
                    {plan.current ? (
                      <Badge tone="success" size="sm">
                        Current plan
                      </Badge>
                    ) : plan.recommended ? (
                      <Badge tone="info" size="sm">
                        Recommended
                      </Badge>
                    ) : null}
                  </div>
                  {plan.tagline ? <p className={styles.tagline}>{plan.tagline}</p> : null}
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
          {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
        </>
      )}
    </section>
  );
}
