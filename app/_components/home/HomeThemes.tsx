"use client";

import { useState } from "react";
import {
  ChangeSummary,
  ExperimentCard,
  NotificationStack,
  SetupGuide,
  Tabs,
  type ChangeItem,
  type NotificationItem,
  type SetupTask,
} from "agentic-ds-kit";
import { presetState } from "@/lib/theme-playground";
import { ThemeScope } from "../ThemeScope";
import { useDemoLoop } from "./useDemoLoop";
import styles from "./Home.module.css";

type SetId = "nistha" | "teal" | "violet" | "rose" | "ink";
type Mode = "light" | "dark";

const SETS: { value: SetId; label: string }[] = [
  { value: "nistha", label: "Nistha" },
  { value: "teal", label: "Teal" },
  { value: "violet", label: "Violet" },
  { value: "rose", label: "Rose" },
  { value: "ink", label: "Ink" },
];

const MODES: { value: Mode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** What plays by itself: each set in light, then the same set in dark. */
const ORDER: { set: SetId; mode: Mode }[] = SETS.flatMap(({ value }) => [
  { set: value, mode: "light" as const },
  { set: value, mode: "dark" as const },
]);

const MOVED: ChangeItem[] = [
  { id: "mrr", label: "MRR", before: "$48.2K", after: "$52.9K", delta: "+9.8%", direction: "up", sentiment: "good" },
  { id: "churn", label: "Churned accounts", before: "14", after: "9", delta: "-5", direction: "down", sentiment: "good" },
  { id: "response", label: "Avg. response time", before: "2.1h", after: "3.4h", delta: "+1.3h", direction: "up", sentiment: "bad" },
];

const SETUP: SetupTask[] = [
  { id: "company", label: "Add your company details", status: "done" },
  { id: "payments", label: "Connect a payment method", status: "done" },
  { id: "customers", label: "Import customers", description: "CSV or your CRM · 5 min", status: "current", actionLabel: "Import" },
  { id: "invoice", label: "Send your first invoice", status: "todo" },
];

const ALERTS: NotificationItem[] = [
  { id: "pay", title: "Payment received", body: "$782.40 from Acme Co", createdAt: "5m", read: false, tone: "success" },
  { id: "trial", title: "Trial ends in 3 days", body: "Northwind · Pro plan", createdAt: "1h", read: false, tone: "info" },
  { id: "card", title: "Card expiring", body: "Visa ending 4242", createdAt: "1d", read: true, tone: "warning" },
];

/**
 * A small SaaS workspace made of kit parts only: what moved this month, a running experiment,
 * onboarding and notifications. The brand colour shows in the progress, the leading variant, the
 * links and the unread marks, so a new colour set reads across every part at once.
 */
function Workspace() {
  return (
    <div className={styles.workspace} inert>
      <div className={styles.workspaceColumn}>
        <ChangeSummary title="What moved" period="Oct → Nov 2026" items={MOVED} onViewAll={() => {}} />
        <ExperimentCard
          name="Checkout copy"
          metricLabel="Conversion"
          status="running"
          dates="Started 3 Nov · day 12"
          confidenceNote="94% chance B wins"
          variants={[
            { id: "a", label: "Current", traffic: 50, value: "4.1%" },
            { id: "b", label: "Shorter form", traffic: 50, value: "4.6%", isLeading: true },
          ]}
        />
      </div>
      <div className={styles.workspaceColumn}>
        <SetupGuide title="Get Northwind ready" description="2 of 4 done" tasks={SETUP} />
        <NotificationStack inline label="Notifications" items={ALERTS} />
      </div>
    </div>
  );
}

/** One workspace; the colour set and light or dark change around it. It plays until someone picks. */
export function HomeThemes() {
  const [picked, setPicked] = useState<{ set: SetId; mode: Mode } | null>(null);
  const [ref, tick] = useDemoLoop<HTMLDivElement>(2200);
  const shown = picked ?? ORDER[tick % ORDER.length];

  return (
    <div ref={ref} className={styles.themes}>
      <div className={styles.themeControls}>
        {/* Line tabs, the same style as the job tabs above. */}
        <Tabs
          variant="line"
          ariaLabel="Colour set"
          items={SETS.map(({ value, label }) => ({ id: value, label }))}
          value={shown.set}
          onChange={(value) => setPicked({ set: value as SetId, mode: shown.mode })}
        />
        <Tabs
          variant="line"
          ariaLabel="Light or dark"
          items={MODES.map(({ value, label }) => ({ id: value, label }))}
          value={shown.mode}
          onChange={(value) => setPicked({ set: shown.set, mode: value as Mode })}
        />
      </div>
      <ThemeScope theme={presetState(shown.set, shown.mode)} className={styles.themeStage}>
        <Workspace />
      </ThemeScope>
    </div>
  );
}
