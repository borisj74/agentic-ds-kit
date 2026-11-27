"use client";

import { useState } from "react";
import { BillingSchedulePattern } from "../../packages/kit/patterns/BillingSchedulePattern";
import { FAILED_CHARGES } from "../../packages/kit/patterns/BillingSchedulePattern/billing-schedule-data";
import { IntegrationSettingsPattern } from "../../packages/kit/patterns/IntegrationSettingsPattern";
import { NorthwindPage } from "./northwindShell";

type BillingView = "history" | "next" | "failed" | "summary" | "empty" | "loading" | "error";
type SettingsView = "connected" | "syncing" | "error" | "needsReauth" | "disconnected";

const noop = () => {};

/** billing-schedule as a full screen on a Northwind page (Billing > Plans current). `view` picks the state. */
export function BillingScheduleScreen({ view = "history" }: { view?: string }) {
  const billing = view as BillingView;
  return (
    <NorthwindPage active="plans" title="Plans" subtitle="Pro plan · next charge Dec 1">
      <BillingSchedulePattern
        charges={billing === "empty" ? [] : billing === "failed" ? FAILED_CHARGES : undefined}
        nextOnly={billing === "next"}
        summary={billing === "summary"}
        onViewAll={billing === "summary" ? noop : undefined}
        loading={billing === "loading"}
        error={billing === "error" ? "Check your connection, then try again" : undefined}
        onRetry={noop}
        onDownloadAll={noop}
        onChangeCard={noop}
        onUpdateCard={noop}
      />
    </NorthwindPage>
  );
}

/** integration-settings as a full screen on a Northwind page (Settings current). `view` is the connection status; the buttons move between them. */
export function IntegrationSettingsScreen({ view = "connected" }: { view?: string }) {
  const [settings, setSettings] = useState<SettingsView>(view as SettingsView);
  return (
    <NorthwindPage active="settings" title="Integrations" subtitle="Settings · Northwind">
      <IntegrationSettingsPattern
        status={settings}
        onSave={noop}
        onCancel={noop}
        onSyncNow={noop}
        onRetry={() => setSettings("connected")}
        onViewErrors={noop}
        onAsk={noop}
        onReconnect={() => setSettings("connected")}
        onDisconnect={() => setSettings("disconnected")}
        onConnect={() => setSettings("connected")}
      />
    </NorthwindPage>
  );
}
