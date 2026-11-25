"use client";

import { useId, useState, type FormEvent } from "react";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { NotificationStack } from "../../ui/NotificationStack";
import { SaveBar } from "../../ui/SaveBar";
import { Select } from "../../ui/Select";
import { Switch } from "../../ui/Switch";
import { Table } from "../../ui/Table";
import { saveShortcut } from "./ProfileSettings";
import { DIGEST_OPTIONS, INBOX, NOTIFICATION_CATEGORIES } from "./settings-data";

export interface NotificationSettingsProps {
  /** Below --grid-breakpoint-md: the digest Select goes to lg 40. */
  narrow?: boolean;
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
export function NotificationSettings({ narrow = false, onSave, onCancel }: NotificationSettingsProps) {
  const uid = useId();
  const [saved, setSaved] = useState({ prefs: NOTIFICATION_CATEGORIES, digest: "daily-0800" });
  const [prefs, setPrefs] = useState(NOTIFICATION_CATEGORIES);
  const [digest, setDigest] = useState(saved.digest);

  // The SaveBar names what changed: a category and its channel, then the digest.
  const changes = [
    ...prefs.flatMap((row, index) => {
      const before = saved.prefs[index];
      return [
        row.email !== before.email ? `${row.label} by email` : null,
        row.inApp !== before.inApp ? `${row.label} in-app` : null,
      ].filter((item): item is string => item !== null);
    }),
    ...(digest !== saved.digest ? ["Email digest"] : []),
  ];

  function save() {
    if (changes.length === 0) return;
    setSaved({ prefs, digest });
    onSave?.();
  }

  function toggle(id: string, channel: "email" | "inApp", on: boolean) {
    setPrefs((rows) => rows.map((row) => (row.id === id ? { ...row, [channel]: on } : row)));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save();
  }

  return (
    <>
      <form className="layout-content settings-pattern__body" onSubmit={submit} onKeyDown={saveShortcut} noValidate>
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
              <Select
                id={`${uid}-digest`}
                size={narrow ? "lg" : "md"}
                name="digest"
                options={DIGEST_OPTIONS}
                value={digest}
                onChange={(next) => setDigest(String(next))}
              />
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
      </form>

      <SaveBar
        state={changes.length > 0 ? "dirty" : "saved"}
        changes={changes}
        discardLabel="Cancel"
        saveLabel="Save preferences"
        onDiscard={() => {
          setPrefs(saved.prefs);
          setDigest(saved.digest);
          onCancel?.();
        }}
        onSave={save}
      />
    </>
  );
}
