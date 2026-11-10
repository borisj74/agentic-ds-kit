"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { NotificationStack } from "../../ui/NotificationStack";
import { Select } from "../../ui/Select";
import { Switch } from "../../ui/Switch";
import { Table } from "../../ui/Table";
import { saveShortcut } from "./ProfileSettings";
import { DIGEST_OPTIONS, INBOX, NOTIFICATION_CATEGORIES } from "./settings-data";

export interface NotificationSettingsProps {
  onSave?: () => void;
  onCancel?: () => void;
}

const COLUMNS = [
  { key: "category", header: "Category" },
  { key: "email", header: "Email", align: "end" as const },
  { key: "inApp", header: "In-app", align: "end" as const },
];

/**
 * Notifications page: a kit Table of categories with an Email and an In-app Switch per row, the
 * email digest, and the in-app inbox (NotificationStack, the same bell as the header).
 */
export function NotificationSettings({ onSave, onCancel }: NotificationSettingsProps) {
  const uid = useId();
  const [prefs, setPrefs] = useState(NOTIFICATION_CATEGORIES);

  function toggle(id: string, channel: "email" | "inApp", on: boolean) {
    setPrefs((rows) => rows.map((row) => (row.id === id ? { ...row, [channel]: on } : row)));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave?.();
  }

  return (
    <form className="settings-pattern__form" onSubmit={submit} onKeyDown={saveShortcut}>
      <div className="layout-content">
        <Card title="Channels" description="Choose where each kind of update reaches you.">
          <Table
            aria-label="Notification channels"
            size="md"
            columns={COLUMNS}
            rows={prefs.map((row) => ({
              category: (
                <span className="settings-pattern__two-line">
                  <span className="settings-pattern__strong">{row.label}</span>
                  <span className="settings-pattern__caption">{row.description}</span>
                </span>
              ),
              email: (
                <Switch
                  id={`${uid}-${row.id}-email`}
                  ariaLabel={`${row.label} by email`}
                  checked={row.email}
                  onChange={(on) => toggle(row.id, "email", on)}
                />
              ),
              inApp: (
                <Switch
                  id={`${uid}-${row.id}-in-app`}
                  ariaLabel={`${row.label} in the app`}
                  checked={row.inApp}
                  onChange={(on) => toggle(row.id, "inApp", on)}
                />
              ),
            }))}
          />
        </Card>

        <Card>
          <div className="layout-split settings-pattern__digest">
            <Field label="Email digest" htmlFor={`${uid}-digest`} hint="Bundles non-urgent emails into one message.">
              <Select id={`${uid}-digest`} name="digest" options={DIGEST_OPTIONS} defaultValue="daily-0800" />
            </Field>
            <div className="settings-pattern__inbox">
              <NotificationStack items={INBOX} label="Notification inbox" />
              <span className="settings-pattern__two-line">
                <span className="settings-pattern__strong">Notification inbox</span>
                <span className="settings-pattern__caption">
                  {`Opens from the bell in the header · ${INBOX.filter((item) => !item.read).length} unread`}
                </span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="settings-pattern__savebar">
        <Button appearance="ghost" mode="neutral" type="reset" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" shortcut="⌘S" aria-keyshortcuts="Meta+S Control+S">
          Save preferences
        </Button>
      </div>
    </form>
  );
}
