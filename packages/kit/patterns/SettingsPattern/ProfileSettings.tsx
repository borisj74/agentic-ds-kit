"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { SaveBar } from "../../ui/SaveBar";
import { Select } from "../../ui/Select";
import { LANGUAGE_OPTIONS, PROFILE, TIMEZONE_OPTIONS } from "./settings-data";

export interface ProfileSettingsProps {
  /** Below --grid-breakpoint-md: split fields stack and controls go to lg 40. */
  narrow?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onUploadPhoto?: () => void;
}

type ProfileField = "fullName" | "displayName" | "email" | "language" | "timezone";

const LABELS: Record<ProfileField, string> = {
  fullName: "Full name",
  displayName: "Display name",
  email: "Email",
  language: "Language",
  timezone: "Time zone",
};

const FIELDS = Object.keys(LABELS) as ProfileField[];
const SAVED: Record<ProfileField, string> = {
  fullName: PROFILE.fullName,
  displayName: PROFILE.displayName,
  email: PROFILE.email,
  language: PROFILE.language,
  timezone: PROFILE.timezone,
};

/** ⌘/Ctrl+S submits the form it is pressed in. */
export function saveShortcut(event: KeyboardEvent<HTMLFormElement>) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    event.currentTarget.requestSubmit();
  }
}

/** Profile page: photo and personal details in Cards, then the one SaveBar. */
export function ProfileSettings({ narrow = false, onSave, onCancel, onUploadPhoto }: ProfileSettingsProps) {
  const uid = useId();
  const [saved, setSaved] = useState(SAVED);
  const [values, setValues] = useState(SAVED);
  const changes = FIELDS.filter((field) => values[field] !== saved[field]).map((field) => LABELS[field]);
  const size = narrow ? "lg" : "md";
  const split = narrow ? "settings-pattern__fields" : "layout-split";

  function update(field: ProfileField, next: string) {
    setValues((current) => ({ ...current, [field]: next }));
  }

  function save() {
    if (changes.length === 0) return;
    setSaved(values);
    onSave?.();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save();
  }

  return (
    <>
      <form className="layout-content settings-pattern__body" onSubmit={submit} onKeyDown={saveShortcut} noValidate>
        <Card title="Photo">
          <div className="settings-pattern__photo">
            <Avatar name={values.fullName} initials={PROFILE.initials} size="lg" />
            <div className="settings-pattern__photo-copy">
              <Button appearance="outline" mode="neutral" size="sm" type="button" iconStart="Upload" onClick={onUploadPhoto}>
                Upload photo
              </Button>
              <span className="settings-pattern__caption">PNG or JPG, at least 256 px</span>
            </div>
          </div>
        </Card>

        <Card title="Personal details">
          <div className="settings-pattern__fields">
            <div className={split}>
              <Field label={LABELS.fullName} htmlFor={`${uid}-name`}>
                <Input id={`${uid}-name`} size={size} name="fullName" value={values.fullName} onChange={(next) => update("fullName", next)} autoComplete="name" />
              </Field>
              <Field label={LABELS.displayName} htmlFor={`${uid}-display`} hint="Shown in comments and mentions">
                <Input id={`${uid}-display`} size={size} name="displayName" value={values.displayName} onChange={(next) => update("displayName", next)} />
              </Field>
            </div>
            <Field label={LABELS.email} htmlFor={`${uid}-email`} hint="Used to sign in. Changing it sends a confirmation link.">
              <Input id={`${uid}-email`} size={size} name="email" type="email" value={values.email} onChange={(next) => update("email", next)} autoComplete="email" />
            </Field>
            <div className={split}>
              <Field label={LABELS.language} htmlFor={`${uid}-language`}>
                <Select id={`${uid}-language`} size={size} name="language" options={LANGUAGE_OPTIONS} value={values.language} onChange={(next) => update("language", String(next))} />
              </Field>
              <Field label={LABELS.timezone} htmlFor={`${uid}-timezone`}>
                <Select id={`${uid}-timezone`} size={size} name="timezone" options={TIMEZONE_OPTIONS} value={values.timezone} onChange={(next) => update("timezone", String(next))} />
              </Field>
            </div>
          </div>
        </Card>
      </form>

      <SaveBar
        state={changes.length > 0 ? "dirty" : "saved"}
        changes={changes}
        discardLabel="Cancel"
        onDiscard={() => {
          setValues(saved);
          onCancel?.();
        }}
        onSave={save}
      />
    </>
  );
}
