"use client";

import { useState } from "react";
import { BillingSchedulePattern } from "../../packages/kit/patterns/BillingSchedulePattern";
import { IntegrationSettingsPattern } from "../../packages/kit/patterns/IntegrationSettingsPattern";
import styles from "../playground.module.css";

type BillingView = "history" | "next" | "summary" | "empty" | "loading";
type SettingsView = "connected" | "syncing" | "error" | "needsReauth" | "disconnected";

const noop = () => {};

/** billing-schedule as a full screen: the block on a settings-like page. `view` picks the state. */
export function BillingScheduleScreen({ view = "history" }: { view?: string }) {
  const billing = view as BillingView;
  return (
    <div className={`${styles.screenPage} ${styles.screenPagePadded}`}>
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
    </div>
  );
}

/** integration-settings as a full screen. `view` is the connection status; the buttons move between them. */
export function IntegrationSettingsScreen({ view = "connected" }: { view?: string }) {
  const [settings, setSettings] = useState<SettingsView>(view as SettingsView);
  return (
    <div className={`${styles.screenPage} ${styles.screenPagePadded}`}>
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
    </div>
  );
}
