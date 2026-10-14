"use client";

import { useLocationHash } from "@/lib/use-location-hash";
import { AppShellBuiltNavDemo, AppShellCustomDemo, AppShellDemo } from "../_components/AppShellDemo";
import { DashboardDemo } from "../_components/DashboardDemo";
import { LayoutsDemo } from "../_components/LayoutsDemo";
import { SignInDemo } from "../_components/SignInDemo";
import { CodeBlock } from "../components/CodeBlock";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

/** Sections that render on their own, outside the DashboardDemo app shell. */
const STANDALONE = new Set(["sign-in", "app-shell", "layouts"]);

/** Page hash → copy-in id for `npx agentic-ds-kit add`. No pattern is a package export. */
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
  "sign-in": "sign-in",
  "app-shell": "app-shell",
};

function usageFor(hash: string) {
  if (hash === "layouts") {
    return {
      note: "No pattern needed: compose kit components. These need only the package.",
      code: `import { AppHeader, Button, Drawer, PageHeader, SideNav } from "agentic-ds-kit";`,
    };
  }
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
          Examples of what you can build from kit components. Copy one in to start from it, borrow
          from it, or ignore it: layout is your choice. Each contract lists what a copy must keep
          (kit look and accessibility) and its defaults, which you can change.
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
          <div id="layouts" />
          {standalone === "sign-in" ? (
            <SignInDemo />
          ) : standalone === "layouts" ? (
            <LayoutsDemo titleClassName={styles.variantTitle} />
          ) : standalone === "app-shell" ? (
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
          ) : (
            <DashboardDemo />
          )}
        </div>
      </div>
    </div>
  );
}
