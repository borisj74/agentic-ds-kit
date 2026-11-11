"use client";

import { useState } from "react";
import { Tabs } from "agentic-ds-kit";
import { BillingSchedulePattern } from "../../packages/kit/patterns/BillingSchedulePattern";
import { IntegrationSettingsPattern } from "../../packages/kit/patterns/IntegrationSettingsPattern";
import styles from "../playground.module.css";
import { PreviewScope } from "./ThemeScope";

type BillingView = "history" | "next" | "summary" | "empty" | "loading";
type SettingsView = "connected" | "syncing" | "error" | "needsReauth" | "disconnected";

const noop = () => {};

/**
 * Frames for the two SaaS settings patterns from Paper p-4-0 (billing-schedule, integration-settings).
 * Same browser chrome as SignInDemo; a segmented Tabs switches the pattern's states.
 */
export function SaasPatternDemo({ pattern }: { pattern: "billing-schedule" | "integration-settings" }) {
  const [billing, setBilling] = useState<BillingView>("history");
  const [settings, setSettings] = useState<SettingsView>("connected");
  const billingTabs = [
    { id: "history", label: "History" },
    { id: "next", label: "Next charge" },
    { id: "summary", label: "Summary" },
    { id: "empty", label: "Empty" },
    { id: "loading", label: "Loading" },
  ];
  const settingsTabs = [
    { id: "connected", label: "Connected" },
    { id: "syncing", label: "Syncing" },
    { id: "error", label: "Error" },
    { id: "needsReauth", label: "Needs reauth" },
    { id: "disconnected", label: "Not connected" },
  ];
  return (
    <div className={styles.signInDemo}>
      <Tabs
        variant="segmented"
        size="sm"
        ariaLabel={pattern === "billing-schedule" ? "Billing schedule state" : "Integration settings state"}
        value={pattern === "billing-schedule" ? billing : settings}
        onChange={(id) => (pattern === "billing-schedule" ? setBilling(id as BillingView) : setSettings(id as SettingsView))}
        items={pattern === "billing-schedule" ? billingTabs : settingsTabs}
      />
      <div className={styles.browser}>
        <div className={styles.browserChrome} aria-hidden="true">
          <div className={styles.traffic}>
            <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
            <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
            <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
          </div>
          <div className={styles.urlBar}>{`app.northwind.example/settings/${pattern === "billing-schedule" ? "billing" : "integrations/ledger"}`}</div>
        </div>
        <PreviewScope className={styles.scopeFill}>
          <div className={`${styles.browserPage} ${styles.saasPage}`}>
            {pattern === "billing-schedule" ? (
              <BillingSchedulePattern
                charges={billing === "empty" ? [] : undefined}
                nextOnly={billing === "next"}
                summary={billing === "summary"}
                onViewAll={billing === "summary" ? noop : undefined}
                loading={billing === "loading"}
                onDownloadAll={noop}
                onChangeCard={noop}
                onUpdateCard={noop}
              />
            ) : (
              <IntegrationSettingsPattern
                status={settings}
                onSave={noop}
                onCancel={noop}
                onSyncNow={noop}
                onViewErrors={noop}
                onReconnect={() => setSettings("connected")}
                onDisconnect={() => setSettings("disconnected")}
                onConnect={() => setSettings("connected")}
              />
            )}
          </div>
        </PreviewScope>
      </div>
    </div>
  );
}
