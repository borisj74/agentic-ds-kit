"use client";

import {
  DEMO_INSIGHTS,
  InsightStackPattern,
  type InsightStackPatternProps,
  type InsightStackSize,
} from "../../packages/kit/patterns/InsightStackPattern";
import { NorthwindPage } from "./northwindShell";
import demo from "./InsightStackDemo.module.css";

const noop = () => {};
const SIZES: InsightStackSize[] = ["sm", "md", "lg"];

/** The three states from the InsightCard board (C — AI summary stack). */
const RANKED: InsightStackPatternProps = {
  eyebrow: "Summary · 3 of 7 insights",
  meta: "09:00",
  title: "Three things changed this month",
  source: "Billing, product and CRM · last 30 days",
  items: DEMO_INSIGHTS,
  defaultOpenIds: ["starter-churn"],
  seeAllLabel: "See all 7",
  onSeeAll: noop,
  askLabel: "Ask in Chat",
  onAsk: noop,
  onDismiss: noop,
};

const LOADING: InsightStackPatternProps = {
  eyebrow: "Summary · Updating",
  meta: "09:00",
  title: "Reading 30 days of billing data",
  source: "Billing, product and CRM",
  loading: true,
  onDismiss: noop,
};

const ALL_CLEAR: InsightStackPatternProps = {
  eyebrow: "Summary · All clear",
  meta: "09:00",
  title: "Nothing needs you today",
  caption: "Changes over 5% show up here first",
  source: "Billing, product and CRM · last 30 days",
  items: [],
  askLabel: "Ask in Chat",
  onAsk: noop,
  onDismiss: noop,
};

const STATES: Record<string, InsightStackPatternProps> = { ranked: RANKED, loading: LOADING, "all-clear": ALL_CLEAR };

/** insight-stack as a screen on a Northwind page (Reports current): the board specimens, or one state in all three sizes. */
export function InsightStackScreen({ view = "specimens" }: { view?: string }) {
  let cards;
  if (STATES[view]) {
    cards = SIZES.map((size) => <InsightStackPattern key={size} {...STATES[view]} size={size} />);
  } else {
    cards = (
      <>
        <InsightStackPattern {...RANKED} size="lg" />
        <InsightStackPattern {...LOADING} size="md" />
        <InsightStackPattern {...ALL_CLEAR} size="sm" />
      </>
    );
  }
  return (
    <NorthwindPage active="reports" title="Insights" subtitle="Billing, product and CRM · last 30 days">
      <div className={demo.row}>{cards}</div>
    </NorthwindPage>
  );
}
