"use client";

// Content patterns are copy-in only (npx agentic-ds-kit add <id>), not package exports:
// render them from their kit source.
import { AppShellPattern } from "../../packages/kit/patterns/AppShellPattern";
import { DashboardPattern } from "../../packages/kit/patterns/DashboardPattern";
import type { DashboardPatternProps } from "../../packages/kit/patterns/DashboardPattern";
import { sampleExchange } from "../../packages/kit/patterns/DashboardPattern/dashboard-data";
import { EmptyFirstRunPattern } from "../../packages/kit/patterns/EmptyFirstRunPattern";
import { ListDetailPattern } from "../../packages/kit/patterns/ListDetailPattern";
import { SettingsFormPattern } from "../../packages/kit/patterns/SettingsFormPattern";
import { northwindShell } from "./northwindShell";
import styles from "../playground.module.css";

/** The list-detail screens (lib/pattern-screens PATTERN_VIEWS["list-detail"]) as the open invoice. */
function listDetailSelectedId(view?: string): string | undefined {
  return view === "none" ? undefined : "INV-1842";
}

/** The dashboard's screens (lib/pattern-screens PATTERN_VIEWS.dashboard) as pattern props. */
function dashboardViewProps(view?: string): DashboardPatternProps {
  switch (view) {
    case "compare":
      return { defaultCompare: true };
    case "metric":
      return { defaultSelectedMetric: "overdue", defaultCompare: true };
    case "empty":
      return { metrics: [] };
    case "loading":
      return { loading: true };
    case "chat":
      return {
        panel: {
          defaultOpen: true,
          defaultTab: "ask",
          defaultContext: "MRR movements · Last 3 months",
          defaultMessages: sampleExchange("3m"),
        },
      };
    default:
      return {};
  }
}

/** dashboard as a full screen: its own shell, as the Northwind reference (Home current). */
export function DashboardScreen({ view }: { view?: string }) {
  return <DashboardPattern {...dashboardViewProps(view)} shell={northwindShell("home")} />;
}

/** empty-first-run as a full screen: its own page in the Northwind shell, Billing > Invoices current. */
export function EmptyFirstRunScreen() {
  return <EmptyFirstRunPattern shell={northwindShell("invoices")} />;
}

/** list-detail as a full screen in the Northwind shell, Billing > Invoices current. */
export function ListDetailScreen({ view }: { view?: string }) {
  return (
    <AppShellPattern {...northwindShell("invoices")}>
      {/* The pattern is its own layout-canvas; main only adds the landmark. */}
      <main className={styles.landmark}>
        <ListDetailPattern selectedId={listDetailSelectedId(view)} />
      </main>
    </AppShellPattern>
  );
}

/** settings-form as a full screen in the Northwind shell, Settings current. */
export function SettingsFormScreen() {
  return (
    <AppShellPattern {...northwindShell("settings")}>
      <main className={styles.landmark}>
        <SettingsFormPattern />
      </main>
    </AppShellPattern>
  );
}
