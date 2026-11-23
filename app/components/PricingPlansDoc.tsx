"use client";

import { useState } from "react";
import { PricingPlans, type PricingInterval, type PricingPlan } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

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
/** Business is current and over its limit; each plan says how it fits that usage. */
const FIT: PricingPlan[] = [
  { id: "team", name: "Team", price: 24, features: ["3,000 credits"], fit: "3,000 credits · too small for 11,240" },
  { id: "business", name: "Business", price: 39, features: ["10,000 credits"], fit: "Over by 1,240 credits", current: true },
  { id: "scale", name: "Scale", price: 59, features: ["25,000 credits"], fit: "Fits with 13,760 spare", ctaLabel: "Upgrade to Scale", recommended: true },
];
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
      usage="The recommended plan's CTA is the one solid primary and only that card is highlighted; when it is the current plan, the CTA reads Current plan, is disabled and outline. Recommended and Current plan (neutral) are Badge words. Below 30rem the cards become a TileGroup with one button."
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
          title: "Fit — how each plan covers usage",
          about: "fit is one line per plan on how it covers current usage. Business is current; Scale is recommended.",
          code: `<PricingPlans plans={[…, { id: "scale", name: "Scale", fit: "Fits with 13,760 spare", recommended: true }]} … />`,
          render: <PricingPlans plans={FIT} interval="month" unitLabel="/ seat / month" onIntervalChange={noop} onSelect={noop} />,
        },
        {
          title: "Narrow — TileGroup and one button",
          about: "Below 30rem the plans are a kit TileGroup radio group; the current plan's tile is disabled, the recommended one starts checked, and one button acts on the pick.",
          code: `<div className="narrow-column"><PricingPlans plans={plans} … /></div>`,
          render: (
            <div className={agentDoc.narrow}>
              <PricingPlans title="Change plan" plans={FIT} interval="month" onIntervalChange={noop} onSelect={noop} />
            </div>
          ),
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
