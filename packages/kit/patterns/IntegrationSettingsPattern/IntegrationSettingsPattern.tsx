"use client";

import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Alert } from "../../ui/Alert";
import { AlertDialog } from "../../ui/AlertDialog";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { FieldSet } from "../../ui/FieldSet";
import { Section } from "../../ui/Section";
import { Select } from "../../ui/Select";
import { Skeleton } from "../../ui/Skeleton";
import { Switch } from "../../ui/Switch";
import { Tag } from "../../ui/Tag";
import {
  ACCOUNT_OPTIONS,
  FREQUENCY_OPTIONS,
  PROVIDER,
  SCOPES,
  SETTINGS,
  STATUS_COPY,
  type ConnectionStatus,
} from "./integration-settings-data";
import "./IntegrationSettingsPattern.css";

export interface IntegrationSettingsPatternProps {
  status?: ConnectionStatus;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onSyncNow?: () => void;
  onViewErrors?: () => void;
  onReconnect?: () => void;
  onDisconnect?: () => void;
  onConnect?: () => void;
}

/**
 * Settings block for one connected integration: status, sync settings in a FieldSet, granted scopes, Save,
 * and Disconnect behind a danger AlertDialog. Copy it in and replace the provider and fields.
 */
export function IntegrationSettingsPattern({
  status = "connected",
  loading = false,
  error,
  onRetry,
  onSave,
  onCancel,
  onSyncNow,
  onViewErrors,
  onReconnect,
  onDisconnect,
  onConnect,
}: IntegrationSettingsPatternProps) {
  const uid = useId();
  const [frequency, setFrequency] = useState(SETTINGS.frequency);
  const [account, setAccount] = useState(SETTINGS.account);
  const [syncPayments, setSyncPayments] = useState(SETTINGS.syncPayments);
  const [syncCreditNotes, setSyncCreditNotes] = useState(SETTINGS.syncCreditNotes);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const copy = STATUS_COPY[status];
  const reauth = status === "needsReauth";
  const locked = reauth || saving;

  function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (locked) return;
    setSaving(true);
    onSave?.();
    window.setTimeout(() => setSaving(false), 800);
  }

  function keys(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      save();
    }
  }

  const actions =
    !loading && !error && status !== "disconnected" ? (
      <div className="integration-settings-pattern__head-actions">
        <Badge tone={copy.tone} size="sm">
          {copy.badge}
        </Badge>
        {onSyncNow ? (
          <Button size="sm" appearance="ghost" mode="neutral" iconStart="RefreshCw" disabled={status === "syncing" || reauth} onClick={onSyncNow}>
            Sync now
          </Button>
        ) : null}
      </div>
    ) : undefined;

  return (
    <Section title={PROVIDER.name} description={error ? undefined : PROVIDER.lastSync} size="sm" actions={actions} aria-busy={loading || saving || undefined}>
      {loading ? (
        <div className="integration-settings-pattern__loading">
          <Skeleton lines={5} />
        </div>
      ) : error ? (
        <div className="integration-settings-pattern__notice">
          <Alert variant="danger" title="Couldn’t load settings">
            {error}
          </Alert>
          {onRetry ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : status === "disconnected" ? (
        <Empty
          title={`${PROVIDER.name} isn’t connected`}
          description="Connect it to sync invoices and payments both ways."
          icon="Plug"
          actions={
            onConnect ? (
              <Button size="md" iconStart="Plug" onClick={onConnect}>
                Connect
              </Button>
            ) : undefined
          }
        />
      ) : (
        <form ref={formRef} className="integration-settings-pattern" onSubmit={save} onKeyDown={keys}>
          {copy.message ? (
            <div className="integration-settings-pattern__notice">
              <Alert variant={status === "syncing" ? "info" : status === "error" ? "danger" : "warning"}>{copy.message}</Alert>
              {status === "error" && onViewErrors ? (
                <Button size="sm" appearance="outline" mode="neutral" onClick={onViewErrors}>
                  View errors
                </Button>
              ) : null}
              {reauth && onReconnect ? (
                <Button size="sm" onClick={onReconnect}>
                  Reconnect
                </Button>
              ) : null}
            </div>
          ) : null}

          <FieldSet legend="Settings" description={reauth ? "Locked until you reconnect." : undefined} disabled={locked}>
            <div className="integration-settings-pattern__rows">
              <Field label="Sync frequency" htmlFor={`${uid}-frequency`} hint="How often invoices and payments sync" labelPosition="start">
                <Select id={`${uid}-frequency`} size="sm" value={frequency} onChange={(value) => setFrequency(String(value))} options={FREQUENCY_OPTIONS} />
              </Field>
              <Field label="Default account" htmlFor={`${uid}-account`} hint="Where new payments are recorded" labelPosition="start">
                <Select id={`${uid}-account`} size="sm" value={account} onChange={(value) => setAccount(String(value))} options={ACCOUNT_OPTIONS} />
              </Field>
              <Field label="Sync payments" htmlFor={`${uid}-payments`} hint="Mark invoices paid when the ledger records a payment" labelPosition="start">
                <Switch id={`${uid}-payments`} checked={syncPayments} onChange={setSyncPayments} />
              </Field>
              <Field label="Sync credit notes" htmlFor={`${uid}-credits`} hint="Push credit notes to the ledger" labelPosition="start">
                <Switch id={`${uid}-credits`} checked={syncCreditNotes} onChange={setSyncCreditNotes} />
              </Field>
            </div>
          </FieldSet>

          <div className="integration-settings-pattern__scopes">
            <span className="integration-settings-pattern__caption" id={`${uid}-scopes`}>
              Scopes granted
            </span>
            <ul className="integration-settings-pattern__scope-list" aria-labelledby={`${uid}-scopes`}>
              {SCOPES.map((scope) => (
                <li key={scope}>
                  <Tag size="sm">{scope}</Tag>
                </li>
              ))}
            </ul>
          </div>

          <div className="integration-settings-pattern__actions">
            {onCancel ? (
              <Button size="md" appearance="ghost" mode="neutral" type="button" disabled={locked} onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button
              size="md"
              type="submit"
              appearance={reauth ? "outline" : "solid"}
              mode={reauth ? "neutral" : "primary"}
              shortcut={saving ? undefined : "⌘S"}
              aria-keyshortcuts="Meta+S Control+S"
              disabled={locked}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>

          <Card
            size="sm"
            title="Disconnect"
            description="Stops syncing. Data already in the ledger stays."
            actions={onDisconnect && !locked ? [{ label: "Disconnect", appearance: "outline", mode: "danger", onClick: () => setConfirm(true) }] : undefined}
          >
            <span className="integration-settings-pattern__caption">You can reconnect later; your settings are kept.</span>
          </Card>

          <AlertDialog
            open={confirm}
            title={`Disconnect ${PROVIDER.name}?`}
            description="Syncing stops right away. Invoices already in the ledger stay there. You can reconnect later."
            cancelLabel="Keep connected"
            actionLabel="Disconnect"
            actionVariant="danger"
            onCancel={() => {
              setConfirm(false);
              requestAnimationFrame(() =>
                [...(formRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])].find((button) => button.textContent === "Disconnect")?.focus(),
              );
            }}
            onAction={() => {
              setConfirm(false);
              onDisconnect?.();
            }}
          />
        </form>
      )}
    </Section>
  );
}
