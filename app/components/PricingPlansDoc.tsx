"use client";

import { useState } from "react";
import { PricingPlans, type PricingInterval, type PricingPlan } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";

const PLANS: PricingPlan[] = [
  { id: "starter", name: "Starter", tagline: "For trying things out", price: 9, yearlyPrice: 7, features: ["1 workspace", "100 invoices / month", "Email support"] },
  {
    id: "pro",
    name: "Pro",
    tagline: "For growing teams",
    price: 29,
    yearlyPrice: 24,
    features: ["5 workspaces", "Unlimited invoices", "Integrations", "Priority support"],
    recommended: true,
  },
  { id: "business", name: "Business", tagline: "For finance teams", price: 79, yearlyPrice: 66, features: ["Unlimited workspaces", "SSO and audit log", "Custom roles", "Dedicated manager"] },
];
const CURRENT = PLANS.map((plan) => (plan.id === "pro" ? { ...plan, current: true } : plan));
const COMMON = {
  description: "Prices are example data.",
  savingsLabel: "Save 17% with yearly",
  footnote: "Prices exclude tax. Change or cancel any time.",
};
const noop = () => {};

export function PricingPlansDoc() {
  const [interval, setInterval] = useState<PricingInterval>("month");
  return (
    <AgentDocFrame
      id="pricingplans"
      name="PricingPlans"
      lede="An in-product plan comparison for upgrades, not a marketing page."
      summary="Switch Monthly and Yearly: prices roll with NumberTransition."
      preview={<PricingPlans {...COMMON} plans={PLANS} interval={interval} onIntervalChange={setInterval} onSelect={noop} />}
      usage="The recommended plan's CTA is the one solid primary; when it is the current plan, the CTA reads Current plan, is disabled and outline. Recommended and Current plan are Badge words."
      code={`<PricingPlans
  plans={plans}
  interval={interval}
  onIntervalChange={setInterval}
  onSelect={choose}
  savingsLabel="Save 17% with yearly"
  footnote="Prices exclude tax. Change or cancel any time."
/>`}
      variants={[
        {
          title: "Monthly — Pro recommended",
          about: "Choose Pro is the solid primary.",
          code: `<PricingPlans plans={plans} interval="month" onIntervalChange={setInterval} onSelect={choose} />`,
          render: <PricingPlans {...COMMON} plans={PLANS} interval="month" onIntervalChange={noop} onSelect={noop} />,
        },
        {
          title: "Yearly — prices roll",
          about: "Yearly prices with the saving per plan.",
          code: `<PricingPlans plans={plans} interval="year" … />`,
          render: <PricingPlans {...COMMON} plans={PLANS} interval="year" onIntervalChange={noop} onSelect={noop} />,
        },
        {
          title: "Current plan is Pro",
          about: "Current plan replaces Recommended; no solid primary on the view.",
          code: `<PricingPlans plans={plansWithCurrent} interval="month" … />`,
          render: <PricingPlans {...COMMON} plans={CURRENT} interval="month" onIntervalChange={noop} onSelect={noop} />,
        },
        {
          title: "Loading",
          about: "Skeleton cards; the switch is disabled.",
          code: `<PricingPlans plans={[]} interval="month" loading … />`,
          render: <PricingPlans plans={[]} interval="month" loading onIntervalChange={noop} onSelect={noop} />,
        },
        {
          title: "Error",
          about: "A load error with Retry.",
          code: `<PricingPlans plans={[]} interval="month" error="Couldn't load plans." onRetry={retry} … />`,
          render: <PricingPlans plans={[]} interval="month" error="Couldn’t load plans." onRetry={noop} onIntervalChange={noop} onSelect={noop} />,
        },
      ]}
    />
  );
}
