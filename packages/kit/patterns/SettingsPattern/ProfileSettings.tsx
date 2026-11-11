"use client";

import { useId, type FormEvent, type KeyboardEvent } from "react";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { LANGUAGE_OPTIONS, PROFILE, TIMEZONE_OPTIONS } from "./settings-data";

export interface ProfileSettingsProps {
  onSave?: () => void;
  onCancel?: () => void;
  onUploadPhoto?: () => void;
}

/** ⌘/Ctrl+S submits the form it is pressed in. */
export function saveShortcut(event: KeyboardEvent<HTMLFormElement>) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    event.currentTarget.requestSubmit();
  }
}

/** Profile page: photo and personal details in Cards, Save changes in the form's footer bar. */
export function ProfileSettings({ onSave, onCancel, onUploadPhoto }: ProfileSettingsProps) {
  const uid = useId();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave?.();
  }

  return (
    <form className="settings-pattern__form" onSubmit={submit} onKeyDown={saveShortcut}>
      <div className="layout-content">
        <Card title="Photo">
          <div className="settings-pattern__photo">
            <Avatar name={PROFILE.fullName} initials={PROFILE.initials} size="lg" />
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
            <div className="layout-split">
              <Field label="Full name" htmlFor={`${uid}-name`}>
                <Input id={`${uid}-name`} name="fullName" defaultValue={PROFILE.fullName} />
              </Field>
              <Field label="Display name" htmlFor={`${uid}-display`} hint="Shown in comments and mentions">
                <Input id={`${uid}-display`} name="displayName" defaultValue={PROFILE.displayName} />
              </Field>
            </div>
            <Field label="Email" htmlFor={`${uid}-email`} hint="Used to sign in. Changing it sends a confirmation link.">
              <Input id={`${uid}-email`} name="email" type="email" defaultValue={PROFILE.email} />
            </Field>
            <div className="layout-split">
              <Field label="Language" htmlFor={`${uid}-language`}>
                <Select id={`${uid}-language`} name="language" options={LANGUAGE_OPTIONS} defaultValue={PROFILE.language} />
              </Field>
              <Field label="Time zone" htmlFor={`${uid}-timezone`}>
                <Select id={`${uid}-timezone`} name="timezone" options={TIMEZONE_OPTIONS} defaultValue={PROFILE.timezone} />
              </Field>
            </div>
          </div>
        </Card>
      </div>

      <div className="settings-pattern__savebar">
        <Button appearance="ghost" mode="neutral" type="reset" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" shortcut="⌘S" aria-keyshortcuts="Meta+S Control+S">
          Save changes
        </Button>
      </div>
    </form>
  );
}
