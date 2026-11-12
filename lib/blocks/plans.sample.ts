import type { PlansFaq, PlansPlan } from "agentic-ds-kit";

/** Sample plans for the Plans docs: an agent workspace priced per seat. */
export const PLANS_SAMPLE: PlansPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For one person trying agents out",
    price: 0,
    features: ["2 agents", "500 runs a month", "7-day run history", "Community support"],
    ctaLabel: "Start free",
  },
  {
    id: "team",
    name: "Team",
    tagline: "For teams shipping with agents every day",
    price: 24,
    yearlyPrice: 19,
    features: ["10 agents per seat", "10,000 runs a month", "90-day run history", "Approvals and audit log", "Email support"],
    ctaLabel: "Start 14-day trial",
    recommended: true,
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For companies with many teams",
    price: 48,
    yearlyPrice: 39,
    features: ["Unlimited agents", "100,000 runs a month", "1-year run history", "SSO and SCIM", "Priority support"],
    ctaLabel: "Talk to sales",
  },
];

export const PLANS_FAQS: PlansFaq[] = [
  {
    id: "trial",
    question: "How does the Team trial work?",
    answer: "You get every Team feature for 14 days with no card. At the end you pick a plan or drop back to Starter; nothing is deleted.",
  },
  {
    id: "seats",
    question: "What counts as a seat?",
    answer: "A seat is a person who can start, approve or stop agents. People who only view runs are free.",
  },
  {
    id: "runs",
    question: "What happens if we go over our runs?",
    answer: "Agents keep running. We tell the workspace owners at 80% and 100%, and extra runs are billed at the end of the month.",
  },
  {
    id: "yearly",
    question: "Can we switch between monthly and yearly?",
    answer: "Yes, any time from Settings › Billing. Moving to yearly applies the discount from your next invoice.",
  },
  {
    id: "cancel",
    question: "Can we cancel?",
    answer: "Yes. Your plan runs to the end of the period you paid for, then the workspace moves to Starter.",
  },
];
