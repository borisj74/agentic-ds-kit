"use client";

import { useId, useState } from "react";
import { Accordion } from "../Accordion";
import { PricingPlans } from "../PricingPlans";
import { cx } from "../shared/cx";
import { faqItems, plansHandlers } from "./plans.logic";
import type { PlansInterval, PlansProps } from "./Plans.types";
import styles from "./Plans.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { PlansProps, PlansPlan, PlansInterval, PlansFaq } from "./Plans.types";

/**
 * Block: a pricing section. Heading and lead, PricingPlans with its Monthly / Yearly switch and
 * an FAQ Accordion. The recommended plan's CTA is the one solid primary.
 */
export function Plans(props: PlansProps) {
  const {
    plans,
    interval: intervalProp,
    defaultInterval = "month",
    onIntervalChange,
    onChoosePlan,
    faqs,
    title = "Pricing",
    description,
    plansTitle = "Choose a plan",
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
  const faqId = useId();
  const [innerInterval, setInnerInterval] = useState<PlansInterval>(defaultInterval);
  const interval = intervalProp ?? innerInterval;

  const handlers = plansHandlers({
    interval,
    setInterval: intervalProp === undefined ? setInnerInterval : undefined,
    onIntervalChange,
    onChoosePlan,
  });

  const questions = faqItems(faqs);

  return (
    <section {...rest} {...nisthaAttr("plans", rest)} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
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
