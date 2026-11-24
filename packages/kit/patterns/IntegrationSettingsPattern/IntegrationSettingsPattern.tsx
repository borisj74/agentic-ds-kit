"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { Alert } from "../../ui/Alert";
import { AlertDialog } from "../../ui/AlertDialog";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Checkbox } from "../../ui/Checkbox";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { FieldSet } from "../../ui/FieldSet";
import { Section } from "../../ui/Section";
import { Select } from "../../ui/Select";
import { Skeleton } from "../../ui/Skeleton";
import {
  ACCOUNT_OPTIONS,
  FREQUENCY_OPTIONS,
  LAST_SYNC,
  PROVIDER,
  SETTINGS,
  STATUS_COPY,
  toMessage,
  type ConnectionStatus,
  type IntegrationLastSync,
  type IntegrationMessage,
} from "./integration-settings-data";
import "./IntegrationSettingsPattern.css";

export interface IntegrationSettingsPatternProps {
  status?: ConnectionStatus;
  loading?: boolean;
  /** Settings failed to load. A string is the detail under "Couldn’t load settings"; { title, detail } sets both. */
  error?: IntegrationMessage;
  /** What the last sync moved and when the next one runs. Defaults to the demo numbers. */
  lastSync?: IntegrationLastSync;
  onRetry?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onSyncNow?: () => void;
  onViewErrors?: () => void;
  onReconnect?: () => void;
  onDisconnect?: () => void;
  onConnect?: () => void;
  onAsk?: () => void;
}

/**
 * Settings for one connected integration: a Section head (provider, account, Ask) over a Connection Card
 * (status, last sync, the sync error with Retry) and a Sync settings Card (the form and Save), then
 * Disconnect in its own Section outside the form, behind a danger AlertDialog. Copy it in and replace the provider and fields.
 */
export function IntegrationSettingsPattern({
  status = "connected",
  loading = false,
  error,
  lastSync = LAST_SYNC,
  onRetry,
  onSave,
  onCancel,
  onSyncNow,
  onViewErrors,
  onReconnect,
  onDisconnect,
  onConnect,
  onAsk,
}: IntegrationSettingsPatternProps) {
  const uid = useId();
  const [frequency, setFrequency] = useState(SETTINGS.frequency);
  const [account, setAccount] = useState(SETTINGS.account);
  const [markPaid, setMarkPaid] = useState(SETTINGS.markPaid);
  const [creditNotes, setCreditNotes] = useState(SETTINGS.creditNotes);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const copy = STATUS_COPY[status];
  const reauth = status === "needsReauth";
  const locked = reauth || saving;
  const loadError = error ? toMessage(error, "Couldn’t load settings") : null;

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

  const ask = onAsk ? (
    <Button size="sm" appearance="outline" mode="neutral" iconStart="MessageCircle" onClick={onAsk}>
      Ask
    </Button>
  ) : undefined;

  const statusAlert =
    status === "syncing" && copy.message ? (
      <Alert variant="info" placement="inline" title={copy.message.title}>
        {copy.message.detail}
      </Alert>
    ) : status === "error" && copy.message ? (
      <Alert
        variant="danger"
        placement="inline"
        title={copy.message.title}
        action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
        secondaryAction={onViewErrors ? { label: "View 3 invoices", onClick: onViewErrors } : undefined}
      >
        {copy.message.detail}
      </Alert>
    ) : reauth && copy.message ? (
      <Alert variant="warning" title={copy.message.title} action={onReconnect ? { label: `Reconnect ${PROVIDER.name}`, onClick: onReconnect } : undefined}>
        {copy.message.detail}
      </Alert>
    ) : null;

  return (
    <Section
      title={PROVIDER.name}
      description={PROVIDER.account}
      size="sm"
      actions={ask}
      className="integration-settings-pattern"
      aria-busy={loading || saving || undefined}
    >
      {loading ? (
        <div className="integration-settings-pattern__loading">
          <Skeleton lines={5} />
        </div>
      ) : loadError ? (
        <Alert variant="danger" placement="inline" title={loadError.title} action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}>
          {loadError.detail}
        </Alert>
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
        <div className="integration-settings-pattern__body">
          <div className="integration-settings-pattern__blocks">
            <Card
              title="Connection"
              headingLevel={3}
              headerAction={onSyncNow && status !== "syncing" && !reauth ? { label: "Sync now", iconStart: "RefreshCw", appearance: "ghost", mode: "neutral", onClick: onSyncNow } : undefined}
              aria-busy={status === "syncing" || undefined}
            >
              <div className="integration-settings-pattern__status">
                <Badge tone={copy.tone} size="sm" icon={copy.icon}>
                  {copy.badge}
                </Badge>
              </div>
              <dl className="integration-settings-pattern__stats">
                <div className="integration-settings-pattern__stat" data-stat="at">
                  <dt>Last sync</dt>
                  <dd>{lastSync.at}</dd>
                </div>
                <div className="integration-settings-pattern__stat" data-stat="synced">
                  <dt>Synced</dt>
                  <dd>
                    {lastSync.invoices} invoices, {lastSync.payments} payments
                  </dd>
                </div>
                <div className="integration-settings-pattern__stat" data-stat="next">
                  <dt>Next sync</dt>
                  <dd>{lastSync.next}</dd>
                </div>
              </dl>
              {statusAlert}
            </Card>

            <Card title="Sync settings" description="Changes apply from the next sync" headingLevel={3}>
              <form className="integration-settings-pattern__form" onSubmit={save} onKeyDown={keys}>
                <FieldSet legend="Sync options" description={reauth ? "Locked until you reconnect." : undefined} disabled={locked}>
                  <div className="integration-settings-pattern__fields">
                    <Field label="Sync frequency" htmlFor={`${uid}-frequency`}>
                      <Select id={`${uid}-frequency`} value={frequency} onChange={(value) => setFrequency(String(value))} options={FREQUENCY_OPTIONS} />
                    </Field>
                    <Field label="Payout account" htmlFor={`${uid}-account`} hint={`Where ${PROVIDER.name} payouts are recorded`}>
                      <Select id={`${uid}-account`} value={account} onChange={(value) => setAccount(String(value))} options={ACCOUNT_OPTIONS} />
                    </Field>
                  </div>
                  <div className="integration-settings-pattern__checks">
                    <Checkbox id={`${uid}-paid`} label={`Mark invoices paid when ${PROVIDER.name} records a payment`} checked={markPaid} onChange={setMarkPaid} />
                    <div className="integration-settings-pattern__check">
                      <Checkbox
                        id={`${uid}-credits`}
                        label={`Create credit notes for ${PROVIDER.name} refunds`}
                        checked={creditNotes}
                        onChange={setCreditNotes}
                        describedBy={`${uid}-credits-hint`}
                      />
                      <span id={`${uid}-credits-hint`} className="integration-settings-pattern__caption integration-settings-pattern__check-hint">
                        Off: refunds show on the invoice only
                      </span>
                    </div>
                  </div>
                </FieldSet>

                <p className="integration-settings-pattern__caption">{PROVIDER.scopes}</p>

                <div className="integration-settings-pattern__actions">
                  {onCancel ? (
                    <Button size="md" appearance="outline" mode="neutral" type="button" disabled={locked} onClick={onCancel}>
                      Cancel
                    </Button>
                  ) : null}
                  <Button
                    size="md"
                    type="submit"
                    appearance={reauth ? "outline" : "solid"}
                    mode={reauth ? "neutral" : "primary"}
                    shortcut={locked ? undefined : "⌘S"}
                    aria-keyshortcuts="Meta+S Control+S"
                    disabled={locked}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {onDisconnect ? (
            <Section title="Disconnect" headingLevel={3} size="sm">
              <Card
                size="sm"
                headingLevel={4}
                title={`Stop syncing with ${PROVIDER.name}`}
                description="Invoices and payments already here stay. Settings are kept if you reconnect."
              >
                <div className="integration-settings-pattern__disconnect">
                  <Button size="sm" appearance="outline" mode="danger" disabled={saving} onClick={() => setConfirm(true)}>
                    Disconnect…
                  </Button>
                </div>
              </Card>
              <AlertDialog
                open={confirm}
                title={`Disconnect ${PROVIDER.name}?`}
                description={`Syncing stops now. New ${PROVIDER.name} payments won’t mark invoices paid. Invoices already here stay, and you can reconnect later.`}
                cancelLabel="Keep connected"
                actionLabel="Disconnect"
                actionVariant="danger"
                onCancel={() => setConfirm(false)}
                onAction={() => {
                  setConfirm(false);
                  onDisconnect();
                }}
              />
            </Section>
          ) : null}
        </div>
      )}
    </Section>
  );
}
