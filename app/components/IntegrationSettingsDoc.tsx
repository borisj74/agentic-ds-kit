"use client";

import { useState } from "react";
import { IntegrationSettings, Select, Switch, type IntegrationConnectionStatus } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const SCOPES = ["invoices:read", "invoices:write", "payments:read", "contacts:read"];
const MESSAGES: Partial<Record<IntegrationConnectionStatus, string>> = {
  syncing: "Syncing now. Settings stay editable.",
  error: "Sync failed: the ledger rejected 3 invoices with missing tax codes.",
};
const LAST_SYNC: Record<IntegrationConnectionStatus, string> = {
  connected: "Last sync 4 min ago · example provider",
  syncing: "Syncing 128 of 412 invoices · example provider",
  error: "Last good sync 2 hours ago · example provider",
  needsReauth: "Paused since 09:12 · example provider",
  disconnected: "",
};
const noop = () => {};

function useSettings(prefix: string) {
  const [frequency, setFrequency] = useState("15m");
  const [account, setAccount] = useState("4000");
  const [payments, setPayments] = useState(true);
  const [credits, setCredits] = useState(false);
  return [
    {
      id: "frequency",
      label: "Sync frequency",
      description: "How often invoices and payments sync",
      controlId: `${prefix}-frequency`,
      control: (
        <Select
          id={`${prefix}-frequency`}
          size="sm"
          value={frequency}
          onChange={(value) => setFrequency(String(value))}
          options={[
            { value: "15m", label: "Every 15 minutes" },
            { value: "1h", label: "Every hour" },
            { value: "1d", label: "Daily" },
          ]}
        />
      ),
    },
    {
      id: "account",
      label: "Default account",
      description: "Where new payments are recorded",
      controlId: `${prefix}-account`,
      control: (
        <Select
          id={`${prefix}-account`}
          size="sm"
          value={account}
          onChange={(value) => setAccount(String(value))}
          options={[
            { value: "4000", label: "4000 · Sales income" },
            { value: "4100", label: "4100 · Services" },
          ]}
        />
      ),
    },
    {
      id: "payments",
      label: "Sync payments",
      description: "Mark invoices paid when the ledger records a payment",
      controlId: `${prefix}-payments`,
      control: <Switch id={`${prefix}-payments`} checked={payments} onChange={setPayments} />,
    },
    {
      id: "credits",
      label: "Sync credit notes",
      description: "Push credit notes to the ledger",
      controlId: `${prefix}-credits`,
      control: <Switch id={`${prefix}-credits`} checked={credits} onChange={setCredits} />,
    },
  ];
}

export function IntegrationSettingsDoc() {
  const [status, setStatus] = useState<IntegrationConnectionStatus>("connected");
  const [saving, setSaving] = useState(false);
  const settings = useSettings("preview");
  const variantSettings = useSettings("variant");
  const save = () => {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 900);
  };
  const base = { name: "Northwind Ledger", icon: "FileText", scopes: SCOPES, onSave: noop, onCancel: noop, onSyncNow: noop, onDisconnect: noop } as const;
  return (
    <AgentDocFrame
      id="integrationsettings"
      name="IntegrationSettings"
      lede="Configuration for one connected integration: status, settings, scopes and a confirmed disconnect."
      summary="Switch the status. Save changes (or ⌘/Ctrl+S) shows Saving…; Disconnect asks in an AlertDialog."
      preview={
        <IntegrationSettings
          {...base}
          status={status}
          lastSync={LAST_SYNC[status]}
          statusMessage={MESSAGES[status]}
          settings={settings}
          saving={saving}
          onSave={save}
          onViewErrors={noop}
          onReconnect={() => setStatus("connected")}
          onConnect={() => setStatus("connected")}
          onDisconnect={() => setStatus("disconnected")}
        />
      }
      controls={<DocOptions label="Status" options={["connected", "syncing", "error", "needsReauth", "disconnected"] as const} value={status} onChange={setStatus} />}
      usage="IntegrationSettings frames the kit controls you pass in (Select, Switch, Input) with the connection status, scopes, Save and Disconnect. Save is the one solid primary; when access expires, Reconnect takes over and the settings lock. Providers here are examples."
      code={`<IntegrationSettings
  name="Northwind Ledger"
  status="connected"
  lastSync="Last sync 4 min ago · example provider"
  settings={[
    { id: "payments", label: "Sync payments", controlId: "payments",
      control: <Switch id="payments" checked={on} onChange={setOn} /> },
  ]}
  scopes={["invoices:read", "payments:read"]}
  onSave={save}
  onCancel={reset}
  onSyncNow={sync}
  onDisconnect={disconnect}
/>`}
      variants={[
        {
          title: "Connected",
          about: "Settings, scopes, Save changes ⌘S and Disconnect.",
          code: `<IntegrationSettings name="Northwind Ledger" status="connected" … />`,
          render: <IntegrationSettings {...base} status="connected" lastSync={LAST_SYNC.connected} settings={variantSettings} />,
        },
        {
          title: "Error",
          about: "A role=alert banner with View errors.",
          code: `<IntegrationSettings … status="error" statusMessage="Sync failed: …" onViewErrors={viewErrors} />`,
          render: <IntegrationSettings {...base} status="error" lastSync={LAST_SYNC.error} statusMessage={MESSAGES.error} settings={variantSettings} onViewErrors={noop} />,
        },
        {
          title: "Needs reauth",
          about: "Reconnect is the solid primary; the settings and Save lock until then.",
          code: `<IntegrationSettings … status="needsReauth" onReconnect={reconnect} />`,
          render: <IntegrationSettings {...base} status="needsReauth" lastSync={LAST_SYNC.needsReauth} settings={variantSettings} onReconnect={noop} />,
        },
        {
          title: "Saving",
          about: "Saving… with the settings disabled.",
          code: `<IntegrationSettings … saving />`,
          render: <IntegrationSettings {...base} status="connected" lastSync={LAST_SYNC.connected} settings={variantSettings} saving />,
        },
        {
          title: "Not connected, loading and error",
          about: "A kit Empty with Connect; skeletons; a load error with Retry.",
          code: `<IntegrationSettings … status="disconnected" onConnect={connect} />
<IntegrationSettings … loading />
<IntegrationSettings … error="Couldn't load settings." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <IntegrationSettings {...base} status="disconnected" settings={[]} onConnect={noop} />
              <IntegrationSettings {...base} status="connected" settings={[]} loading />
              <IntegrationSettings {...base} status="connected" settings={[]} error="Couldn’t load settings." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
