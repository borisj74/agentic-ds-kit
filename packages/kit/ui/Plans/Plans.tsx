"use client";

import { useId, useState } from "react";
import { Check, Minus } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Accordion } from "../Accordion";
import { PricingPlans } from "../PricingPlans";
import { Table } from "../Table";
import { cx } from "../shared/cx";
import { comparisonColumns, comparisonGrid, faqItems, plansHandlers, type PlansCell } from "./plans.logic";
import type { PlansInterval, PlansProps } from "./Plans.types";
import styles from "./Plans.module.css";

export type { PlansProps, PlansPlan, PlansInterval, PlansComparisonRow, PlansFaq } from "./Plans.types";

function Cell({ cell }: { cell: PlansCell }) {
  if (cell.kind === "text") return <>{cell.label}</>;
  const Icon = cell.kind === "yes" ? Check : Minus;
  return (
    <span className={cx(styles.mark, cell.kind === "yes" ? styles.yes : styles.no)}>
      <Icon size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
      <span className={styles.srOnly}>{cell.label}</span>
    </span>
  );
}

/**
 * Block: a pricing section. Heading and lead, PricingPlans with its Monthly / Yearly switch, a
 * feature comparison Table and an FAQ Accordion. The recommended plan's CTA is the one solid primary.
 */
export function Plans(props: PlansProps) {
  const {
    plans,
    interval: intervalProp,
    defaultInterval = "month",
    onIntervalChange,
    onChoosePlan,
    comparison,
    faqs,
    title = "Pricing",
    description,
    plansTitle = "Choose a plan",
    comparisonTitle = "Compare plans",
    faqTitle = "Questions",
    savingsLabel,
    footnote,
    currency,
    unitLabel,
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const compareId = useId();
  const faqId = useId();
  const [innerInterval, setInnerInterval] = useState<PlansInterval>(defaultInterval);
  const interval = intervalProp ?? innerInterval;

  const handlers = plansHandlers({
    interval,
    setInterval: intervalProp === undefined ? setInnerInterval : undefined,
    onIntervalChange,
    onChoosePlan,
  });

  const rows = comparison?.length ? comparisonGrid(plans, comparison) : [];
  const questions = faqItems(faqs);

  return (
    <section {...rest} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.heading}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description ? <p className={styles.lead}>{description}</p> : null}
      </header>

      <PricingPlans
        plans={plans}
        interval={interval}
        onIntervalChange={handlers.changeInterval}
        onSelect={handlers.choose}
        title={plansTitle}
        savingsLabel={savingsLabel}
        footnote={footnote}
        currency={currency}
        unitLabel={unitLabel}
      />

      {rows.length ? (
        <section className={styles.part} aria-labelledby={compareId}>
          <h3 id={compareId} className={styles.subtitle}>
            {comparisonTitle}
          </h3>
          <Table
            columns={comparisonColumns(plans)}
            rows={rows.map((row) => ({
              feature: row.feature,
              ...Object.fromEntries(row.cells.map(({ planId, cell }) => [planId, <Cell key={planId} cell={cell} />])),
            }))}
          />
        </section>
      ) : null}

      {questions.length ? (
        <section className={styles.part} aria-labelledby={faqId}>
          <h3 id={faqId} className={styles.subtitle}>
            {faqTitle}
          </h3>
          <Accordion items={questions} />
        </section>
      ) : null}
    </section>
  );
}
