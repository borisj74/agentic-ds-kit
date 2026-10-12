"use client";

import { useLocationHash } from "@/lib/use-location-hash";
import { AppShellCustomDemo, AppShellDemo } from "../_components/AppShellDemo";
import { DashboardDemo } from "../_components/DashboardDemo";
import { SignInDemo } from "../_components/SignInDemo";
import { CodeBlock } from "../components/CodeBlock";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

/** Patterns that render on their own, outside the DashboardDemo app shell. */
const STANDALONE = new Set(["sign-in", "app-shell"]);

/** Page hash → copy-in id for `npx agentic-ds-kit add`. Content patterns are not package exports. */
const ADD_ID: Record<string, string> = {
  dashboard: "dashboard",
  activity: "activity",
  inbox: "inbox",
  settings: "settings-form",
  "list-detail": "list-detail",
  "launch-brief": "list-detail",
  "qa-checklist": "list-detail",
  "release-notes": "list-detail",
  "support-macros": "list-detail",
  projects: "list-detail",
  invite: "invite-members",
  insights: "assistant-workspace",
  empty: "empty-first-run",
  research: "empty-first-run",
};

/** Chrome patterns stay imports from the package. */
const IMPORT_LINE: Record<string, string> = {
  "sign-in": `import { SignInPattern } from "agentic-ds-kit";`,
  "app-shell": `import { AppShellPattern } from "agentic-ds-kit";`,
};

function usageFor(hash: string) {
  if (IMPORT_LINE[hash]) return { note: "Import it from the package.", code: IMPORT_LINE[hash] };
  const id = ADD_ID[hash] ?? "dashboard";
  return {
    note: "Copy it into your app, then edit the data file and sections.",
    code: `npx agentic-ds-kit add ${id}`,
  };
}

export default function PatternsPage() {
  const locationHash = useLocationHash();
  const hash = locationHash ?? "";
  const standalone = STANDALONE.has(hash) ? hash : null;
  const usage = usageFor(hash);
  // Until the hash is read, the usage line and demo would show the dashboard: hide, don't swap.
  const pending = locationHash === null ? playground.pending : undefined;

  return (
    <div className={playground.page}>
      <div className={playground.opsShell}>
        <h1 className={playground.pageTitle}>Patterns</h1>
        <p className={playground.pageLead}>
          Code is the contract. Agents install the kit, then compose these screens instead of
          inventing layouts.
        </p>

        <div className={pending ? `${styles.usage} ${pending}` : styles.usage}>
          <p className={playground.body}>{usage.note}</p>
          <CodeBlock code={usage.code} />
        </div>

        <div className={pending ? `${styles.anchor} ${pending}` : styles.anchor}>
          <div id="dashboard" />
          <div id="activity" />
          <div id="inbox" />
          <div id="settings" />
          <div id="list-detail" />
          <div id="invite" />
          <div id="insights" />
          <div id="empty" />
          <div id="sign-in" />
          <div id="app-shell" />
          {standalone === "sign-in" ? (
            <SignInDemo />
          ) : standalone === "app-shell" ? (
            <>
              <AppShellDemo />
              <h2 className={styles.variantTitle}>Custom chrome</h2>
              <p className={playground.body}>
                header and nav also take nodes built from the kit blocks. The header places
                AppShellPattern.MenuButton in its brand cell; the nav reads useAppShell() to stay
                expanded in the Drawer.
              </p>
              <div className={styles.variantFrame}>
                <AppShellCustomDemo />
              </div>
            </>
          ) : (
            <DashboardDemo />
          )}
        </div>
      </div>
    </div>
  );
}
