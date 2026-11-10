"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { CircleX, LoaderCircle, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { AlertDialog } from "../AlertDialog";
import { Badge } from "../Badge";
import type { BadgeTone } from "../Badge/Badge.types";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { IntegrationConnectionStatus, IntegrationSettingsProps } from "./IntegrationSettings.types";
import styles from "./IntegrationSettings.module.css";

export type { IntegrationSettingsProps, IntegrationSetting, IntegrationConnectionStatus } from "./IntegrationSettings.types";

const BADGE: Record<IntegrationConnectionStatus, { tone: BadgeTone; label: string }> = {
  connected: { tone: "success", label: "Connected" },
  syncing: { tone: "info", label: "Syncing" },
  error: { tone: "danger", label: "Error" },
  needsReauth: { tone: "warning", label: "Needs reauth" },
  disconnected: { tone: "neutral", label: "Not connected" },
};

/**
 * Settings for one connected integration: status, sync settings, granted scopes, Save, and a confirmed
 * Disconnect. The settings are kit controls you pass in; this frames them. Built on kit Badge, Button,
 * AlertDialog and Empty.
 */
export function IntegrationSettings({
  name,
  status,
  icon = "Plug",
  lastSync,
  statusMessage,
  settings,
  scopes = [],
  onSave,
  onCancel,
  saving = false,
  onSyncNow,
  onViewErrors,
  onReconnect,
  onDisconnect,
  onConnect,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: IntegrationSettingsProps) {
  const titleId = useId();
  const settingsId = useId();
  const disconnectRef = useRef<HTMLButtonElement>(null);
  const [confirm, setConfirm] = useState(false);
  const reauth = status === "needsReauth";
  const locked = reauth || saving;

  const keys = (event: KeyboardEvent<HTMLElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!locked) onSave();
    }
  };

  if (loading) {
    return (
      <section {...rest} ref={ref} className={cx(styles.card, className)} aria-busy="true" aria-label={name}>
        <div className={styles.loadingHead}>
          <Skeleton shape="rect" width="var(--space-8)" height="var(--space-8)" />
          <Skeleton width="40%" />
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className={styles.loadingRow}>
            <Skeleton width="40%" size="sm" />
            <Skeleton shape="rect" width="30%" height="var(--space-8)" />
          </div>
        ))}
      </section>
    );
  }

  const header = (
    <header className={styles.header}>
      <span className={styles.logo} aria-hidden="true">
        <LucideByName name={icon} size={16} />
      </span>
      <div className={styles.heading}>
        <div className={styles.nameLine}>
          <h3 id={titleId} className={styles.name}>
            {name}
          </h3>
          {!error ? (
            <Badge tone={BADGE[status].tone} size="sm">
              {BADGE[status].label}
            </Badge>
          ) : null}
        </div>
        {lastSync && !error ? <p className={styles.lastSync}>{lastSync}</p> : null}
      </div>
      {onSyncNow && !error && status !== "disconnected" ? (
        <Button size="sm" appearance="ghost" mode="neutral" iconStart="RefreshCw" disabled={status === "syncing" || reauth} onClick={onSyncNow}>
          Sync now
        </Button>
      ) : null}
    </header>
  );

  if (error) {
    return (
      <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId}>
        {header}
        <LoadError message={error} onRetry={onRetry} />
      </section>
    );
  }

  if (status === "disconnected") {
    return (
      <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId}>
        <Empty
          title={`${name} isn’t connected`}
          description={statusMessage ?? "Connect it to sync invoices and payments both ways."}
          icon={icon}
          actions={
            onConnect ? (
              <Button size="md" iconStart="Plug" onClick={onConnect}>
                Connect
              </Button>
            ) : undefined
          }
        />
        <span id={titleId} className={styles.srOnly}>
          {name}
        </span>
      </section>
    );
  }

  return (
    <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId} aria-busy={saving || undefined} onKeyDown={keys}>
      {header}

      {status === "syncing" ? (
        <div className={cx(styles.banner, styles.bannerInfo)} role="status">
          <LoaderCircle size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.spin} />
          <span className={styles.bannerText}>{statusMessage ?? "Syncing now. Settings stay editable."}</span>
        </div>
      ) : status === "error" ? (
        <div className={cx(styles.banner, styles.bannerDanger)} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.bannerText}>{statusMessage ?? "Sync failed."}</span>
          {onViewErrors ? (
            <Button size="sm" appearance="outline" mode="neutral" onClick={onViewErrors}>
              View errors
            </Button>
          ) : null}
        </div>
      ) : reauth ? (
        <div className={cx(styles.banner, styles.bannerWarning)} role="alert">
          <TriangleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.bannerText}>{statusMessage ?? "Access expired. Reconnect to resume syncing; your settings are kept."}</span>
          {onReconnect ? (
            <Button size="sm" onClick={onReconnect}>
              Reconnect
            </Button>
          ) : null}
        </div>
      ) : null}

      <fieldset className={styles.settings} disabled={locked} aria-describedby={reauth ? settingsId : undefined}>
        <legend className={styles.overline}>Settings</legend>
        {reauth ? (
          <span id={settingsId} className={styles.srOnly}>
            Locked until you reconnect.
          </span>
        ) : null}
        {settings.map((setting) => (
          <div key={setting.id} className={styles.row}>
            <div className={styles.rowText}>
              {setting.controlId ? (
                <label htmlFor={setting.controlId} className={styles.rowLabel}>
                  {setting.label}
                </label>
              ) : (
                <span className={styles.rowLabel}>{setting.label}</span>
              )}
              {setting.description ? <span className={styles.rowDescription}>{setting.description}</span> : null}
            </div>
            <div className={styles.control}>{setting.control}</div>
          </div>
        ))}
      </fieldset>

      {scopes.length ? (
        <div className={styles.scopes}>
          <span className={styles.scopesLabel} id={`${settingsId}-scopes`}>
            Scopes granted
          </span>
          <ul className={styles.scopeList} aria-labelledby={`${settingsId}-scopes`}>
            {scopes.map((scope) => (
              <li key={scope}>
                <code className={styles.scope}>{scope}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.footer}>
        {onCancel ? (
          <Button size="sm" appearance="ghost" mode="neutral" disabled={locked} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          size="sm"
          appearance={reauth ? "outline" : "solid"}
          mode={reauth ? "neutral" : "primary"}
          shortcut={saving ? undefined : "⌘S"}
          aria-keyshortcuts="Meta+S Control+S"
          iconStart={saving ? "LoaderCircle" : undefined}
          className={saving ? styles.saving : undefined}
          disabled={reauth}
          onClick={saving ? undefined : onSave}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <span className={styles.srOnly} role="status">
          {saving ? "Saving settings" : ""}
        </span>
      </div>

      <div className={styles.danger}>
        <div className={styles.dangerText}>
          <span className={styles.rowLabel}>Disconnect</span>
          <span className={styles.rowDescription}>Stops syncing. Data already in the ledger stays.</span>
        </div>
        <Button ref={disconnectRef} size="sm" appearance="outline" mode="danger" iconStart="Unplug" disabled={reauth || saving} onClick={() => setConfirm(true)}>
          Disconnect
        </Button>
      </div>

      <AlertDialog
        open={confirm}
        title={`Disconnect ${name}?`}
        description="Syncing stops right away. Invoices already in the ledger stay there. You can reconnect later."
        cancelLabel="Keep connected"
        actionLabel="Disconnect"
        actionVariant="danger"
        onCancel={() => {
          setConfirm(false);
          requestAnimationFrame(() => disconnectRef.current?.focus());
        }}
        onAction={() => {
          setConfirm(false);
          onDisconnect();
        }}
      />
    </section>
  );
}
