import type { InsightStackItem } from "./InsightStackPattern";

/** Demo findings for the ranked summary. Replace with your own data. */
export const DEMO_INSIGHTS: InsightStackItem[] = [
  {
    id: "expansion",
    title: "Expansion drove growth",
    detail: "Growth → Scale upgrades added $11.2k MRR",
    delta: "+$18.4k",
    tone: "success",
    why: {
      confidence: "High · 91%",
      value: 91,
      evidence: ["38 plan upgrades", "Stripe subscription changes since Nov 1"],
    },
  },
  {
    id: "starter-churn",
    title: "Starter churn is climbing",
    detail: "4.8% this week, up from 2.4% after the price change",
    delta: "+2.4 pt",
    tone: "danger",
    goodWhen: "down",
    why: {
      confidence: "High · 82%",
      value: 82,
      evidence: ["412 Stripe invoices", "plan changes since Oct 28", "CRM seat counts"],
    },
  },
  {
    id: "retries",
    title: "Two payments need a retry",
    detail: "Brightline Studio and Hollis & Grey, due Friday",
    delta: "$1,360",
    tone: "warning",
    why: {
      confidence: "Medium · 64%",
      value: 64,
      evidence: ["INV-1842 and INV-1847 declined", "card expiry dates"],
    },
  },
];
