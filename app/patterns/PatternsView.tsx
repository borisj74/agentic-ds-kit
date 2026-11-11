"use client";

import { AppShellBuiltNavDemo, AppShellCustomDemo, AppShellDemo } from "../_components/AppShellDemo";
import { DashboardDemo } from "../_components/DashboardDemo";
import { LayoutsDemo } from "../_components/LayoutsDemo";
import { SaasPatternDemo } from "../_components/SaasPatternDemo";
import { OnboardingDemo, SettingsAreaDemo } from "../_components/ScreensPatternDemo";
import onboardingContract from "../../packages/kit/contracts/patterns/onboarding.json";
import settingsContract from "../../packages/kit/contracts/patterns/settings.json";
import { SignInDemo } from "../_components/SignInDemo";
import { CodeBlock } from "../components/CodeBlock";
import { PATTERN_ITEMS, type PatternSlug } from "@/lib/playground-nav";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

const ADD_ID: Record<string, string> = {
  dashboard: "dashboard",
  settings: "settings-form",
  "list-detail": "list-detail",
  empty: "empty-first-run",
  "sign-in": "sign-in",
  "app-shell": "app-shell",
  "billing-schedule": "billing-schedule",
  "integration-settings": "integration-settings",
  "settings-area": "settings",
  onboarding: "onboarding",
};

/** Pattern pages that show their contract under the preview. */
const CONTRACTS: Partial<Record<string, unknown>> = {
  "settings-area": settingsContract,
  onboarding: onboardingContract,
};

function usageFor(slug: string) {
  if (slug === "layouts") {
    return {
      note: "No pattern needed: compose kit components. These need only the package.",
      code: `import { AppHeader, Button, Drawer, PageHeader, SideNav } from "agentic-ds-kit";`,
    };
  }
  const id = ADD_ID[slug] ?? "dashboard";
  return {
    note: "Copy it into your app, then edit the data file and sections.",
    code: `npx agentic-ds-kit add ${id}`,
  };
}

function isDashboardRoute(slug: PatternSlug): slug is "dashboard" | "settings" | "list-detail" | "empty" {
  return slug === "dashboard" || slug === "settings" || slug === "list-detail" || slug === "empty";
}

export function PatternsView({ slug, view }: { slug: PatternSlug; view?: string }) {
  const title = PATTERN_ITEMS.find((item) => item.slug === slug)?.label ?? "Patterns";
  const usage = usageFor(slug);

  return (
    <div className={playground.page}>
      <div className={playground.opsShell}>
        <h1 className={playground.pageTitle}>{title}</h1>
        <p className={playground.pageLead}>
          Examples of what you can build from kit components. Copy one in to start from it, borrow
          from it, or ignore it: layout is your choice. Each contract lists what a copy must keep
          (kit look and accessibility) and its defaults, which you can change.
        </p>

        <div className={styles.usage}>
          <p className={playground.body}>{usage.note}</p>
          <CodeBlock code={usage.code} />
        </div>

        <div className={styles.anchor}>
          {slug === "sign-in" ? (
            <SignInDemo />
          ) : slug === "billing-schedule" || slug === "integration-settings" ? (
            <SaasPatternDemo pattern={slug} />
          ) : slug === "onboarding" ? (
            <OnboardingDemo view={view} />
          ) : slug === "settings-area" ? (
            <SettingsAreaDemo view={view} />
          ) : slug === "layouts" ? (
            <LayoutsDemo titleClassName={styles.variantTitle} />
          ) : slug === "app-shell" ? (
            <>
              <AppShellDemo />
              <h2 className={styles.variantTitle}>Custom chrome</h2>
              <p className={playground.body}>
                One layout option among many. header and nav also take nodes built from the kit
                blocks. The header places AppShellMenuButton in its brand cell; the nav reads
                useAppShell() to stay expanded in the Drawer.
              </p>
              <div className={styles.variantFrame}>
                <AppShellCustomDemo />
              </div>
              <h2 className={styles.variantTitle}>Built nav, no header</h2>
              <p className={playground.body}>
                No header and a nav passed as a function of placement. The shell cannot read a
                mark from a built nav, so markIcon on the shell brands the default narrow top bar:
                Menu Button, mark, and title.
              </p>
              <div className={styles.variantFrame}>
                <AppShellBuiltNavDemo />
              </div>
            </>
          ) : isDashboardRoute(slug) ? (
            <DashboardDemo pattern={slug} view={view} />
          ) : null}
        </div>

        {CONTRACTS[slug] ? (
          <>
            <h2 className={styles.variantTitle}>Contract</h2>
            <p className={playground.body}>
              Copied beside the source as {`${ADD_ID[slug]}.contract.json`}. Keep the must lines; the defaults are
              suggestions.
            </p>
            <CodeBlock code={JSON.stringify(CONTRACTS[slug], null, 2)} />
          </>
        ) : null}
      </div>
    </div>
  );
}
